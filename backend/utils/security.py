# filepath: backend/utils/security.py
# Purpose: JWT creation/decoding and password hashing utilities used across auth layer

from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from config import settings

# Passlib context using bcrypt for password hashing
# Support both argon2 and bcrypt for backward compatibility with existing users
# Use argon2 as the default to avoid bcrypt's 72-byte limit and potential Windows initialization issues
_pwd_context = CryptContext(schemes=["argon2", "bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.
    Truncates to 72 bytes to avoid passlib/bcrypt ValueError.

    Args:
        password: Plaintext password string

    Returns:
        Bcrypt-hashed password string
    """
    # Truncate to 72 bytes (standard bcrypt limit)
    truncated_password = password[:72] if len(password) > 72 else password
    return _pwd_context.hash(truncated_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a bcrypt hash.
    Truncates to 72 bytes to avoid passlib/bcrypt ValueError.

    Args:
        plain_password: Plaintext password to verify
        hashed_password: Stored bcrypt hash

    Returns:
        True if password matches, False otherwise
    """
    # Truncate to 72 bytes (standard bcrypt limit)
    truncated_password = plain_password[:72] if len(plain_password) > 72 else plain_password
    return _pwd_context.verify(truncated_password, hashed_password)


def create_access_token(data: dict) -> str:
    """
    Create a signed JWT access token.

    Args:
        data: Payload dict to encode (must include 'sub' key with user ID)

    Returns:
        Encoded JWT string
    """
    payload = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload.update({"exp": expire})
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> dict:
    """
    Decode and validate a JWT access token.

    Args:
        token: JWT string from Authorization header

    Returns:
        Decoded payload dict

    Raises:
        JWTError: If token is invalid, expired, or tampered with
    """
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])