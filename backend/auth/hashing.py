import bcrypt


def hash_password(plain: str) -> str:
    """Hash a password using bcrypt directly (no passlib).
    
    bcrypt has a 72-byte input limit — we encode first and
    truncate to 72 bytes to avoid silent truncation surprises.
    """
    password_bytes = plain.encode("utf-8")[:72]
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    password_bytes = plain.encode("utf-8")[:72]
    hashed_bytes = hashed.encode("utf-8")
    return bcrypt.checkpw(password_bytes, hashed_bytes)
