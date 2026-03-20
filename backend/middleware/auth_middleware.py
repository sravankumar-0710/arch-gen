# filepath: backend/middleware/auth_middleware.py
# Purpose: JWT token validation middleware and dependency injection

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer
from utils.security import decode_token
from jose import JWTError

security = HTTPBearer()


async def get_current_user(credentials = Depends(security)) -> dict:
    """
    Dependency to extract and validate JWT token from request.
    Raises HTTPException if token is invalid or expired.

    Returns:
        Decoded token payload with user info
    """
    token = credentials.credentials
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        return {"user_id": user_id}
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )
