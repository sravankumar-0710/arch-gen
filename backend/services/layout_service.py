# filepath: backend/services/layout_service.py
# Purpose: Core layout generation — uses Gemini AI for room placement.
# Falls back to BSP (RoomPlacer) if AI is unavailable or returns bad data.
# Rule validation (NBC sizes, Vastu, adjacency) always runs regardless of generation method.

import math
import logging
from typing import Dict, List, Tuple

from shapely.geometry import Polygon, MultiPolygon, box

from engine.ai_layer.layout_generator import AILayoutGenerator
from engine.geometry.room_placer import RoomPlacer
from utils.geometry_utils import (
    canvas_to_real, compute_zone_direction,
    compute_plot_center, compute_polygon_area, generate_walls_from_zones,
    validate_room_placement
)
from utils.vastu_scorer import VastuScorer

logger = logging.getLogger(__name__)

# Vastu-preferred directions per room type
VASTU_PREFERRED = {
    'master_bedroom': ['SW', 'S', 'W', 'SE'],
    'bedroom':        ['S', 'SW', 'W', 'NW', 'N'],
    'kitchen':        ['SE', 'NW', 'E'],
    'living_room':    ['N', 'NE', 'E', 'SE'],
    'dining_room':    ['W', 'E', 'N', 'S'],
    'bathroom':       ['NW', 'W', 'N', 'S'],
    'staircase':      ['S', 'SW', 'SE', 'W'],
    'balcony':        ['N', 'NE', 'E'],
    'pooja':          ['NE', 'N', 'E'],
    'garage':         ['W', 'NW', 'SW'],
    'store':          ['NW', 'W', 'SW'],
    'entrance':       ['N', 'NE', 'E'],
}


class LayoutService:
    """
    Service for floor plan layout generation.
    Primary path: Gemini AI generates room placements.
    Fallback path: BSP RoomPlacer if AI unavailable.
    Rule validation always runs on both paths.
    """

    @staticmethod
    def generate_layouts(land_data: Dict, requirements: Dict, user_id: int = None) -> Dict:
        """
        Main orchestrator: generate multiple layout variants for a plot.

        Args:
            land_data: {polygonPoints, unit, roadSide, northAngle, dimensions}
            requirements: {mode, rooms, vastuEnabled, floors, bedroomCount, ...}
            user_id: Authenticated user ID (unused in generation, kept for future logging)

        Returns:
            {success, layouts, plotInfo, error}
        """
        try:
            polygon = LayoutService._parse_land_data(land_data)
            plot_center = compute_plot_center(polygon)
            plot_area = compute_polygon_area(polygon, land_data.get('unit', 'ft'))
            room_configs = LayoutService._build_room_configs(requirements)

            if not room_configs:
                return {
                    "success": False,
                    "error": "No valid room configurations provided",
                    "layouts": []
                }

            num_rooms = len(room_configs)

            # ── Step 1: Try AI generation first ──────────────────────────────
            zone_sets = AILayoutGenerator.generate_all_variants(
                plot_polygon=polygon,
                room_configs=room_configs,
                land_data=land_data,
                requirements=requirements,
            )

            generation_method = "ai"

            # ── Step 2: Fall back to BSP if AI failed or returned too few layouts ──
            if len(zone_sets) < 3:
                if zone_sets:
                    logger.warning(
                        f"AI returned only {len(zone_sets)} layouts — "
                        "filling remaining with BSP fallback"
                    )
                else:
                    logger.warning("AI generation failed entirely — using BSP fallback")
                    generation_method = "bsp"

                bsp_sets = RoomPlacer.decompose_all_strategies(polygon, num_rooms)
                # Append BSP results until we have 3 total
                for bsp_name, bsp_zones in bsp_sets:
                    if len(zone_sets) >= 3:
                        break
                    # Rename BSP fallback variants so they're distinguishable
                    fallback_name = f"{bsp_name} (Fallback)"
                    zone_sets.append((fallback_name, bsp_zones))

            if not zone_sets:
                return {
                    "success": False,
                    "error": "Could not generate layouts — plot may be too small or irregular",
                    "layouts": []
                }

            # ── Step 3: Build variant dicts from zone sets ────────────────────
            variants = []
            for strategy_name, zones in zone_sets[:3]:
                if len(zones) < num_rooms:
                    logger.warning(
                        f"Strategy '{strategy_name}' has {len(zones)} zones "
                        f"but needs {num_rooms} — skipping"
                    )
                    continue

                assignments = LayoutService._assign_rooms_vastu(
                    zones[:num_rooms],
                    room_configs,
                    plot_center,
                    land_data.get('northAngle', 0),
                    land_data.get('roadSide', 0),
                )

                variant = LayoutService._create_variant(
                    assignments, polygon, plot_center, land_data, strategy_name
                )
                variants.append(variant)

            if not variants:
                return {
                    "success": False,
                    "error": "All layout strategies failed validation",
                    "layouts": []
                }

            # ── Step 4: Score and rank variants ──────────────────────────────
            scored = LayoutService._score_variants(variants, requirements)
            top = sorted(scored, key=lambda v: v['score'], reverse=True)[:3]

            return {
                "success": True,
                "layouts": top,
                "plotInfo": {
                    "area": plot_area,
                    "unit": land_data.get('unit', 'ft'),
                    "roadSide": land_data.get('roadSide', 0),
                    "northAngle": land_data.get('northAngle', 0),
                    "zonesGenerated": num_rooms,
                    "generationMethod": generation_method,
                },
                "error": None,
            }

        except Exception as e:
            import traceback
            logger.error(f"Layout generation error: {e}")
            return {
                "success": False,
                "error": str(e),
                "layouts": [],
                "details": traceback.format_exc()[:500],
            }

    # ─────────────────────────────────────────────────────────────
    # Room-to-zone assignment using Vastu direction scoring
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    def _assign_rooms_vastu(
        zones: List[Polygon],
        room_configs: List[Dict],
        plot_center: Tuple,
        north_angle: float,
        road_side: int,
    ) -> List[Dict]:
        """
        Assign room types to zones using greedy Vastu direction matching.

        Args:
            zones: List of Shapely Polygon zones (already ordered by AI/BSP)
            room_configs: List of {room_type, min_area, max_area}
            plot_center: (x, y) centroid of full plot
            north_angle: North direction in degrees
            road_side: Road side indicator

        Returns:
            List of {zone, room_config, direction, centroid} dicts
        """
        zone_info = []
        for zone in zones:
            centroid = (zone.centroid.x, zone.centroid.y)
            direction = compute_zone_direction(
                centroid, plot_center, north_angle, road_side
            )
            zone_info.append({
                'zone': zone,
                'centroid': centroid,
                'direction': direction,
            })

        assigned = []
        remaining_rooms = list(room_configs)

        for zi in zone_info:
            best_room = None
            best_score = -1

            for room in remaining_rooms:
                rtype = room['room_type']
                preferred = VASTU_PREFERRED.get(rtype, [])
                if zi['direction'] in preferred:
                    score = len(preferred) - preferred.index(zi['direction'])
                else:
                    score = 0
                if score > best_score:
                    best_score = score
                    best_room = room

            if best_room:
                assigned.append({
                    'zone': zi['zone'],
                    'room_config': best_room,
                    'direction': zi['direction'],
                    'centroid': zi['centroid'],
                })
                remaining_rooms.remove(best_room)

        return assigned

    # ─────────────────────────────────────────────────────────────
    # Variant creation, scoring, helpers
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    def _create_variant(
        assignments: List[Dict],
        plot_polygon: Polygon,
        plot_center: Tuple,
        land_data: Dict,
        variant_name: str,
    ) -> Dict:
        """Build the variant dict from zone-room assignments."""
        rooms = []

        for idx, a in enumerate(assignments):
            zone = a['zone']
            room_config = a['room_config']
            rooms.append({
                'id': idx + 1,
                'room_type': room_config['room_type'],
                'polygon': zone,
                'centroid': a['centroid'],
                'direction': a['direction'],
                'area': zone.area,
                'min_area': room_config.get('min_area', 0),
                'max_area': room_config.get('max_area', 10000),
                'room_id': idx + 1,
            })

        valid, error_msg = validate_room_placement(rooms)
        validation_warning = None if valid else error_msg

        walls = []
        try:
            walls = generate_walls_from_zones(rooms)
        except Exception as e:
            logger.warning(f"Wall generation failed for '{variant_name}': {e}")

        doors = LayoutService._generate_doors(walls, rooms)
        windows = LayoutService._generate_windows(walls, rooms)

        variant_dict = {
            'id': 0,
            'name': variant_name,
            'rooms': [{
                'id': r['id'],
                'type': r['room_type'],
                'area': r['area'],
                'direction': r['direction'],
                'centroid': list(r['centroid']),
                'polygon': [
                    [float(pt[0]), float(pt[1])]
                    for pt in r['polygon'].exterior.coords
                ],
            } for r in rooms],
            'walls': [{
                'start': list(w['start']),
                'end': list(w['end']),
                'type': w['wall_type'],
                'rooms': w['rooms'],
            } for w in walls],
            'doors': doors,
            'windows': windows,
            'score': 0,
        }

        if validation_warning:
            variant_dict['warning'] = validation_warning

        return variant_dict

    @staticmethod
    def _parse_land_data(land_data: Dict) -> Polygon:
        """Parse and validate land data, returning a Shapely Polygon."""
        polygon_points = land_data.get('polygonPoints', [])
        unit = land_data.get('unit', 'ft')

        if len(polygon_points) < 3:
            raise ValueError("Polygon must have at least 3 points")

        polygon = canvas_to_real(polygon_points, unit)

        if not polygon.is_valid:
            raise ValueError("Invalid polygon: self-intersecting or degenerate")

        if polygon.area < 10:
            raise ValueError("Plot area too small")

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
    def _generate_doors(walls: List[Dict], rooms: List[Dict]) -> List[Dict]:
        """Generate door placements at midpoints of partition walls."""
        doors = []
        door_id = 1
        for wall in walls:
            if wall['wall_type'] == 'partition' and len(wall['rooms']) == 2:
                start, end = wall['start'], wall['end']
                doors.append({
                    'id': door_id,
                    'position': [
                        (start[0] + end[0]) / 2,
                        (start[1] + end[1]) / 2,
                    ],
                    'rooms': wall['rooms'],
                    'width': 3.0,
                })
                door_id += 1
        return doors

    @staticmethod
    def _generate_windows(walls: List[Dict], rooms: List[Dict]) -> List[Dict]:
        """Generate window placements on exterior load-bearing walls."""
        windows = []
        window_id = 1
        for wall in walls:
            if wall['wall_type'] == 'load_bearing':
                start, end = wall['start'], wall['end']
                length = math.sqrt(
                    (end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2
                )
                if length > 5:
                    for pos in [0.33, 0.67]:
                        windows.append({
                            'id': window_id,
                            'position': [
                                start[0] + (end[0] - start[0]) * pos,
                                start[1] + (end[1] - start[1]) * pos,
                            ],
                            'size': 3.0,
                        })
                        window_id += 1
        return windows

    @staticmethod
    def _score_variants(variants: List[Dict], requirements: Dict) -> List[Dict]:
        """Score all variants using Vastu compliance."""
        for idx, variant in enumerate(variants):
            variant['id'] = idx + 1
            rooms_for_scoring = [
                {
                    'room_type': r['type'],
                    'direction': r['direction'],
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