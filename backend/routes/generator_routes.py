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

    try:
        if not request.land_data or 'polygonPoints' not in request.land_data:
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "Invalid land data: polygonPoints is required"}
            )

        if not request.land_data.get('polygonPoints'):
            return JSONResponse(
                status_code=400,
                content={"success": False, "message": "polygonPoints is empty — draw a plot first"}
            )

        user_id = 1
        if isinstance(current_user, dict):
            user_id = current_user.get('user_id', 1)

        result = LayoutService.generate_layouts(
            dict(request.land_data),
            dict(request.requirements),
            user_id=user_id
        )

        if not result.get('success'):
            # 422 Unprocessable Entity — engine understood the request but could not generate
            # Using 422 (not 500) so the error message reaches the frontend correctly
            return JSONResponse(
                status_code=422,
                content={
                    "success": False,
                    "message": result.get('error', 'Layout generation failed'),
                    "data": None
                }
            )

        response_content = {
            "success": True,
            "data": {
                "layouts": [json.loads(json.dumps(l, default=str)) for l in result.get('layouts', [])],
                "plotInfo": result.get('plotInfo', {})
            },
            "message": f"Generated {len(result.get('layouts', []))} variants"
        }

        return JSONResponse(status_code=200, content=response_content)

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