import secrets
from fastapi import Response, Request
from config import settings

ACCESS_COOKIE = "access_token"
REFRESH_COOKIE = "refresh_token"
CSRF_COOKIE = "csrf_token"


def _cookie_kwargs():
    secure = settings.is_production
    return {
        "secure": secure,
        "samesite": "none" if secure else "lax",
        "path": "/",
    }


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> str:
    """Set httpOnly access/refresh cookies plus a JS-readable CSRF cookie. Returns the CSRF token."""
    kwargs = _cookie_kwargs()
    response.set_cookie(
        ACCESS_COOKIE, access_token, max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True, **kwargs,
    )
    response.set_cookie(
        REFRESH_COOKIE, refresh_token, max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=True, **kwargs,
    )
    csrf_token = secrets.token_urlsafe(32)
    response.set_cookie(
        CSRF_COOKIE, csrf_token, max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        httponly=False, **kwargs,
    )
    return csrf_token


def clear_auth_cookies(response: Response) -> None:
    kwargs = _cookie_kwargs()
    for name in (ACCESS_COOKIE, REFRESH_COOKIE, CSRF_COOKIE):
        response.delete_cookie(name, path="/", secure=kwargs["secure"], samesite=kwargs["samesite"])


def verify_csrf(request: Request) -> bool:
    cookie_value = request.cookies.get(CSRF_COOKIE)
    header_value = request.headers.get("X-CSRF-Token")
    return bool(cookie_value) and bool(header_value) and secrets.compare_digest(cookie_value, header_value)
