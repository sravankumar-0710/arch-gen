# filepath: backend/utils/security.py
# Purpose: JWT creation/decoding and password hashing utilities used across auth layer

from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from passlib.context import CryptContext
from config import settings

# Passlib context using bcrypt for password hashing
_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plaintext password using bcrypt.

    Args:
        password: Plaintext password string

    Returns:
        Bcrypt-hashed password string
    """
    return _pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plaintext password against a bcrypt hash.

    Args:
        plain_password: Plaintext password to verify
        hashed_password: Stored bcrypt hash

    Returns:
        True if password matches, False otherwise
    """
    return _pwd_context.verify(plain_password, hashed_password)


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