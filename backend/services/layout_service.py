# filepath: backend/services/layout_service.py
# Purpose: Service layer for layout generation.
# Orchestrates high-level logic and delegates to the engine (Rule 9).

import logging
from typing import Dict, List
from shapely.geometry import Polygon

from engine.layout_engine import LayoutEngine
from utils.geometry_utils import canvas_to_real, compute_polygon_area
from utils.vastu_scorer import VastuScorer

logger = logging.getLogger(__name__)


class LayoutService:
    """
    Service for floor plan layout generation.
    Following Rule 9: All engine calls must go through LayoutEngine.
    """

    @staticmethod
    def generate_layouts(land_data: Dict, requirements: Dict, user_id: int = None) -> Dict:
        """
        Main orchestrator: parse input and call the engine.
        """
        try:
            polygon = LayoutService._parse_land_data(land_data)
            plot_area = compute_polygon_area(polygon, land_data.get('unit', 'ft'))
            room_configs = LayoutService._build_room_configs(requirements)

            if not room_configs:
                return {"success": False, "error": "No valid room configurations provided", "layouts": []}

            # ── Delegate to Engine (Rule 9) ──────────────────────────────────
            engine_result = LayoutEngine.generate(
                polygon=polygon,
                room_configs=room_configs,
                land_data=land_data,
                requirements=requirements
            )

            if not engine_result.success:
                return {
                    "success": False,
                    "error": engine_result.errors[0] if engine_result.errors else "Generation failed",
                    "layouts": []
                }

            variants = engine_result.data.get('variants', [])
            generation_method = engine_result.data.get('generationMethod', 'unknown')

            # ── Score and rank variants ──────────────────────────────────────
            scored = LayoutService._score_variants(variants, requirements)
            top = sorted(scored, key=lambda v: v.get('score', 0), reverse=True)[:3]

            return {
                "success": True,
                "layouts": top,
                "plotInfo": {
                    "area": plot_area,
                    "unit": land_data.get('unit', 'ft'),
                    "roadSide": land_data.get('roadSide', 0),
                    "northAngle": land_data.get('northAngle', 0),
                    "zonesGenerated": len(room_configs),
                    "generationMethod": generation_method,
                },
                "error": None,
            }

        except Exception as e:
            import traceback
            logger.error(f"Layout service error: {e}")
            return {
                "success": False,
                "error": str(e),
                "layouts": [],
                "details": traceback.format_exc()[:500],
            }

    @staticmethod
    def _parse_land_data(land_data: Dict) -> Polygon:
        """Parse and validate land data."""
        polygon_points = land_data.get('polygonPoints', [])
        unit = land_data.get('unit', 'ft')

        if len(polygon_points) < 3:
            raise ValueError("Polygon must have at least 3 points")

        polygon = canvas_to_real(polygon_points, unit)

        if not polygon.is_valid:
            raise ValueError("Invalid polygon: self-intersecting or degenerate")

        # India NBC 2016 minimum for a habitable plot with rooms
        # A 2BHK needs at minimum ~600 sqft; enforce a safe lower bound of 300 sqft
        # so users get a clear message instead of a silent "No layout zones generated"
        MIN_VIABLE_AREA = 300  # sqft — absolute floor for any layout generation
        if polygon.area < MIN_VIABLE_AREA:
            raise ValueError(
                f"Plot area is too small ({polygon.area:.0f} sqft). "
                f"Minimum required is {MIN_VIABLE_AREA} sqft. "
                f"Please draw a larger plot on the canvas."
            )

        return polygon

    @staticmethod
    def _build_room_configs(requirements: Dict) -> List[Dict]:
        """Build room configuration list from requirements."""
        rooms = []
        mode = requirements.get('mode', 'basic')

        if mode == 'basic':
            bedroom_count = requirements.get('bedroomCount', 2)
            for i in range(bedroom_count):
                if i == 0:
                    rooms.append({'room_type': 'master_bedroom', 'min_area': 140, 'max_area': 250})
                else:
                    rooms.append({'room_type': 'bedroom', 'min_area': 90, 'max_area': 160})

            if requirements.get('hasKitchen', True):
                rooms.append({'room_type': 'kitchen', 'min_area': 80, 'max_area': 150})
            if requirements.get('hasLivingRoom', True):
                rooms.append({'room_type': 'living_room', 'min_area': 150, 'max_area': 300})
            if requirements.get('hasDiningRoom', True):
                rooms.append({'room_type': 'dining_room', 'min_area': 100, 'max_area': 200})
            
            bathroom_count = max(1, (bedroom_count + 2) // 3)
            for _ in range(bathroom_count):
                rooms.append({'room_type': 'bathroom', 'min_area': 40, 'max_area': 80})
        else:
            rooms = requirements.get('rooms', [])

        return rooms

    @staticmethod
    def _score_variants(variants: List[Dict], requirements: Dict) -> List[Dict]:
        """Score all variants using Vastu compliance."""
        for idx, variant in enumerate(variants):
            variant['id'] = idx + 1
            rooms_for_scoring = [
                {
                    'room_type': r['type'],
                    'direction': r.get('direction', 'N'),
                    'area': r['area'],
                }
                for r in variant['rooms']
            ]
            vastu_enabled = requirements.get('vastuEnabled', True)
            variant['score'] = (
                VastuScorer.score_layout(rooms_for_scoring, requirements)
                if vastu_enabled
                else 50.0
            )
        return variants