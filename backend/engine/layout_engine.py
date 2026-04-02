# filepath: backend/engine/layout_engine.py
# Purpose: Entry point for the layout generation pipeline.
# All external callers (layout_service.py) must go through this module only.
# Never call engine sub-modules directly from outside the engine.

import logging
from typing import Dict, List, Tuple
from shapely.geometry import Polygon
from shapely.ops import unary_union
from dataclasses import dataclass, field

from engine.ai_layer.layout_generator import AILayoutGenerator
from engine.geometry.room_placer import RoomPlacer
from engine.rule_based.room_size_rules import RoomSizeRules
from engine.rule_based.adjacency_rules import AdjacencyRules
from engine.rule_based.door_window_rules import DoorWindowRules
from engine.rule_based.ventilation_rules import VentilationRules
from engine.rule_based.building_code_rules import BuildingCodeRules
from utils.geometry_utils import (
    compute_zone_direction, compute_plot_center, generate_walls_from_zones,
    validate_room_placement
)

logger = logging.getLogger(__name__)


@dataclass
class EngineResult:
    """Standard result object returned by all engine functions."""
    success: bool
    data: dict | None
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)


# Vastu-preferred directions per room type (moved from LayoutService)
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


class LayoutEngine:
    """
    Main layout generation orchestrator.
    Coordinates geometry, rules, and AI to produce layout variants.
    """

    @staticmethod
    def generate(
        polygon: Polygon,
        room_configs: List[Dict],
        land_data: Dict,
        requirements: Dict
    ) -> EngineResult:
        """
        Main entry point for generating layout variants.
        """
        try:
            plot_center = compute_plot_center(polygon)
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
                    logger.warning(f"AI returned only {len(zone_sets)} layouts — filling with BSP")
                else:
                    logger.warning("AI generation failed — using BSP fallback")
                    generation_method = "bsp"

                bsp_sets = RoomPlacer.decompose_all_strategies(polygon, num_rooms)
                for bsp_name, bsp_zones in bsp_sets:
                    if len(zone_sets) >= 3:
                        break
                    zone_sets.append((f"{bsp_name} (Fallback)", bsp_zones))

            if not zone_sets:
                return EngineResult(success=False, data=None, errors=["No layout zones generated"])

            # ── Step 3: Build variants from zone sets ────────────────────────
            variants = []
            for strategy_name, zones in zone_sets[:3]:
                if len(zones) < num_rooms:
                    continue

                assignments = LayoutEngine._assign_rooms_vastu(
                    zones[:num_rooms], room_configs, plot_center, 
                    land_data.get('northAngle', 0), land_data.get('roadSide', 0)
                )

                variant = LayoutEngine._create_variant(
                    assignments, polygon, plot_center, land_data, strategy_name
                )
                variants.append(variant)

            return EngineResult(
                success=True, 
                data={
                    'variants': variants,
                    'generationMethod': generation_method
                }
            )

        except Exception as e:
            logger.error(f"Engine generation error: {e}")
            return EngineResult(success=False, data=None, errors=[str(e)])

    @staticmethod
    def _assign_rooms_vastu(
        zones: List[Polygon],
        room_configs: List[Dict],
        plot_center: Tuple,
        north_angle: float,
        road_side: int,
    ) -> List[Dict]:
        """Greedy Vastu assignment (moved from LayoutService)."""
        zone_info = []
        for zone in zones:
            centroid = (zone.centroid.x, zone.centroid.y)
            direction = compute_zone_direction(centroid, plot_center, north_angle, road_side)
            zone_info.append({'zone': zone, 'centroid': centroid, 'direction': direction})

        assigned = []
        remaining_rooms = list(room_configs)

        for zi in zone_info:
            best_room, best_score = None, -1
            for room in remaining_rooms:
                rtype = room['room_type']
                preferred = VASTU_PREFERRED.get(rtype, [])
                score = len(preferred) - preferred.index(zi['direction']) if zi['direction'] in preferred else 0
                if score > best_score:
                    best_score, best_room = score, room

            if best_room:
                assigned.append({
                    'zone': zi['zone'], 'room_config': best_room,
                    'direction': zi['direction'], 'centroid': zi['centroid']
                })
                remaining_rooms.remove(best_room)

        return assigned

    @staticmethod
    def _create_variant(
        assignments: List[Dict],
        plot_polygon: Polygon,
        plot_center: Tuple,
        land_data: Dict,
        variant_name: str,
    ) -> Dict:
        """Build variant dict (moved from LayoutService)."""
        rooms = []
        for idx, a in enumerate(assignments):
            zone = a['zone']
            rooms.append({
                'id': idx + 1, 'room_type': a['room_config']['room_type'],
                'polygon': zone, 'centroid': a['centroid'],
                'direction': a['direction'], 'area': zone.area,
                'min_area': a['room_config'].get('min_area', 0),
                'max_area': a['room_config'].get('max_area', 10000),
                'room_id': idx + 1,
            })

        valid, error_msg = validate_room_placement(rooms)
        validation_warning = None if valid else error_msg
        
        adjacency_res = AdjacencyRules.validate(assignments)
        adjacency_warning = None if adjacency_res.valid else adjacency_res.message

        walls = []
        try:
            walls = generate_walls_from_zones(rooms)
        except Exception:
            pass

        doors = DoorWindowRules.generate_doors(walls, rooms)
        windows = DoorWindowRules.generate_windows(walls, rooms)
        ventilation_warnings = VentilationRules.check_all_rooms(rooms, plot_polygon)
        
        all_room_polys = [r['polygon'] for r in rooms]
        building_polygon = unary_union(all_room_polys)
        coverage_res = BuildingCodeRules.validate_coverage(plot_polygon.area, building_polygon.area)
        setback_res = BuildingCodeRules.validate_setbacks(plot_polygon, building_polygon, land_data.get('roadSide', 0))
        
        all_warnings = []
        if validation_warning: all_warnings.append(validation_warning)
        if adjacency_warning: all_warnings.append(adjacency_warning)
        all_warnings.extend(ventilation_warnings)
        if not coverage_res.valid: all_warnings.append(coverage_res.message)
        if not setback_res.valid: all_warnings.append(setback_res.message)

        return {
            'name': variant_name,
            'rooms': [{
                'id': r['id'], 'type': r['room_type'], 'area': r['area'],
                'direction': r['direction'], 'centroid': list(r['centroid']),
                'polygon': [[float(pt[0]), float(pt[1])] for pt in r['polygon'].exterior.coords],
            } for r in rooms],
            'walls': [{
                'start': list(w['start']), 'end': list(w['end']),
                'type': w['wall_type'], 'rooms': w['rooms'],
            } for w in walls],
            'doors': doors,
            'windows': windows,
            'warnings': all_warnings,
        }
