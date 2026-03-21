# filepath: backend/middleware/auth_middleware.py
# Purpose: JWT token validation middleware and dependency injection

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.security import decode_token
from jose import JWTError

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Dependency to extract and validate JWT token from request.
    Raises HTTPException if token is invalid or expired.

    Returns:
        Decoded token payload with user_id as int
    """
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        # JWT encodes user_id as str(id) — cast back to int for SQLAlchemy queries
        return {"user_id": int(user_id_str)}
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )