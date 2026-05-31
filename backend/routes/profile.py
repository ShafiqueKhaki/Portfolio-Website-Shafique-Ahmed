from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.profile import Profile
from schemas.profile import ProfileResponse, ProfileUpdate
from auth.dependencies import get_current_admin

public_router = APIRouter(prefix="/api", tags=["profile"])
admin_router = APIRouter(prefix="/api/admin", tags=["admin-profile"])


def _get_profile(db: Session) -> Profile:
    profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile


@public_router.get("/profile", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    return _get_profile(db)


@admin_router.put("/profile", response_model=ProfileResponse, dependencies=[Depends(get_current_admin)])
def update_profile(body: ProfileUpdate, db: Session = Depends(get_db)):
    profile = _get_profile(db)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile
