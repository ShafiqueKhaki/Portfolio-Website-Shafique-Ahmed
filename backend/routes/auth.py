import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.refresh_token import RefreshToken
from schemas.auth import LoginRequest, UserResponse, ChangePasswordRequest
from auth.hashing import verify_password, hash_password
from auth.jwt_handler import create_access_token, create_refresh_token, decode_token
from auth.dependencies import get_current_admin
from auth.cookies import set_auth_cookies, clear_auth_cookies, REFRESH_COOKIE
from rate_limit import limiter

router = APIRouter(prefix="/api/auth", tags=["auth"])
logger = logging.getLogger("portfolio.auth")


def _issue_tokens(response: Response, db: Session, user: User) -> None:
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token, jti, expires_at = create_refresh_token({"sub": str(user.id)})
    db.add(RefreshToken(jti=jti, user_id=user.id, expires_at=expires_at))
    db.commit()
    set_auth_cookies(response, access_token, refresh_token)


def _revoke_all_sessions(db: Session, user_id: int) -> None:
    now = datetime.now(timezone.utc)
    db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked_at.is_(None),
    ).update({"revoked_at": now}, synchronize_session=False)
    db.commit()


@router.post("/login", response_model=UserResponse)
@limiter.limit("5/minute")
def login(request: Request, response: Response, body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access only",
        )
    _issue_tokens(response, db, user)
    return user


@router.post("/refresh", response_model=UserResponse)
@limiter.limit("10/minute")
def refresh(request: Request, response: Response, db: Session = Depends(get_db)):
    invalid = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid session")

    raw_token = request.cookies.get(REFRESH_COOKIE)
    if not raw_token:
        raise invalid

    payload = decode_token(raw_token, token_type="refresh")
    user_id = int(payload.get("sub"))
    jti = payload.get("jti")
    if not jti:
        raise invalid

    record = db.query(RefreshToken).filter(RefreshToken.jti == jti).first()
    if record is None:
        raise invalid

    if record.revoked_at is not None:
        # Reuse of an already-rotated/revoked refresh token — treat as a stolen token
        # and kill every active session for this user.
        logger.warning("Refresh token reuse detected for user_id=%s (jti=%s)", record.user_id, jti)
        _revoke_all_sessions(db, record.user_id)
        clear_auth_cookies(response)
        raise invalid

    user = db.query(User).filter(User.id == user_id, User.is_admin == True).first()
    if not user:
        raise invalid

    # Rotate: revoke the used token, issue a new pair
    new_access_token = create_access_token({"sub": str(user.id)})
    new_refresh_token, new_jti, new_expires_at = create_refresh_token({"sub": str(user.id)})
    record.revoked_at = datetime.now(timezone.utc)
    record.replaced_by = new_jti
    db.add(RefreshToken(jti=new_jti, user_id=user.id, expires_at=new_expires_at))
    db.commit()

    set_auth_cookies(response, new_access_token, new_refresh_token)
    return user


@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    raw_token = request.cookies.get(REFRESH_COOKIE)
    if raw_token:
        try:
            payload = decode_token(raw_token, token_type="refresh")
            jti = payload.get("jti")
            if jti:
                record = db.query(RefreshToken).filter(RefreshToken.jti == jti).first()
                if record and record.revoked_at is None:
                    record.revoked_at = datetime.now(timezone.utc)
                    db.commit()
        except HTTPException:
            pass
    clear_auth_cookies(response)
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_admin)):
    return current_user


@router.post("/change-password")
def change_password(
    body: ChangePasswordRequest,
    response: Response,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(body.new_password)
    db.commit()
    # Force re-login everywhere else in case the old password was compromised.
    _revoke_all_sessions(db, current_user.id)
    clear_auth_cookies(response)
    return {"message": "Password updated successfully. Please log in again."}
