# filepath: backend/routes/generator_routes.py
# Purpose: Layout generation API endpoints - generate, validate

from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from schemas import GenerateLayoutRequest
from middleware.auth_middleware import get_current_user
from database import get_db
from services.layout_service import LayoutService

router = APIRouter(prefix="/generate", tags=["generator"])


@router.post("")
async def generate_layout(
    request: GenerateLayoutRequest,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate multiple layout options from land and requirements."""
    import json

    # MARKER
    try:
        open('/tmp/MARKER_ROUTE_CALLED.txt', 'w').write('Route called')
    except:
        pass

    try:
        # Validate input
        if not request.land_data or 'polygonPoints' not in request.land_data:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Invalid land data"}
            )

        # Extract user ID safely
        user_id = 1
        if isinstance(current_user, dict):
            uid = current_user.get('sub') or current_user.get('id')
            try:
                user_id = int(uid) if uid else 1
            except (ValueError, TypeError):
                user_id = 1

        # Generate layouts
        result = LayoutService.generate_layouts(
            dict(request.land_data),
            dict(request.requirements),
            user_id=user_id
        )

        if not result.get('success'):
            return JSONResponse(
                status_code=422,
                content={
                    "success": False,
                    "message": result.get('error', 'Generation failed'),
                    "data": None
                }
            )

        # Build response
        response_content = {
            "success": True,
            "data": {
                "layouts": [json.loads(json.dumps(l, default=str)) for l in result.get('layouts', [])],
                "plotInfo": result.get('plotInfo', {})
            },
            "message": f"Generated {len(result.get('layouts', []))} variants"
        }

        return JSONResponse(
            status_code=200,
            content=response_content
        )

    except Exception as e:
        import traceback
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "message": str(e),
                "error_type": type(e).__name__,
                "traceback": traceback.format_exc()[:500]
            }
        )
