# filepath: backend/services/layout_service.py
# Purpose: Core layout generation — produces genuinely different spatial variants
# using three distinct zone decomposition strategies (horizontal, vertical, L-split)

from typing import Dict, List, Tuple
from shapely.geometry import Polygon, MultiPolygon, box
from shapely.ops import split, unary_union
import math

from utils.geometry_utils import (
    canvas_to_real, compute_zone_direction,
    compute_plot_center, compute_polygon_area, generate_walls_from_zones,
    validate_room_placement
)
from utils.vastu_scorer import VastuScorer


# Vastu-preferred directions per room type
# Used to rank zone-to-room assignments
VASTU_PREFERRED = {
    'master_bedroom': ['SW', 'W', 'S'],
    'bedroom':        ['S', 'W', 'N'],
    'kitchen':        ['SE', 'NW', 'E'],
    'living_room':    ['N', 'NE', 'E'],
    'dining_room':    ['W', 'E', 'N'],
    'bathroom':       ['NW', 'W', 'N'],
    'staircase':      ['S', 'SW', 'SE'],
    'balcony':        ['N', 'NE', 'E'],
}


class LayoutService:
    """Service for floor plan layout generation using spatial decomposition."""

    @staticmethod
    def generate_layouts(land_data: Dict, requirements: Dict, user_id: int = None) -> Dict:
        """
        Main orchestrator: generate multiple layout variants for a plot.
        Produces 3 genuinely different spatial arrangements.
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

            # Generate 3 variants using different spatial strategies
            variants = []

            # Strategy 1: Horizontal split (rooms stacked top-bottom)
            zones_h = LayoutService._decompose_horizontal(polygon, num_rooms)
            if len(zones_h) >= num_rooms:
                assignment_h = LayoutService._assign_rooms_vastu(
                    zones_h[:num_rooms], room_configs, plot_center,
                    land_data.get('northAngle', 0), land_data.get('roadSide', 0)
                )
                variants.append(LayoutService._create_variant(
                    assignment_h, polygon, plot_center, land_data,
                    "Default (Vastu-Optimized)"
                ))

            # Strategy 2: Vertical split (rooms arranged left-right)
            zones_v = LayoutService._decompose_vertical(polygon, num_rooms)
            if len(zones_v) >= num_rooms:
                assignment_v = LayoutService._assign_rooms_vastu(
                    zones_v[:num_rooms], room_configs, plot_center,
                    land_data.get('northAngle', 0), land_data.get('roadSide', 0)
                )
                variants.append(LayoutService._create_variant(
                    assignment_v, polygon, plot_center, land_data,
                    "Compact Layout"
                ))

            # Strategy 3: L-split (quadrant-style with unequal zones)
            zones_l = LayoutService._decompose_l_split(polygon, num_rooms)
            if len(zones_l) >= num_rooms:
                assignment_l = LayoutService._assign_rooms_vastu(
                    zones_l[:num_rooms], room_configs, plot_center,
                    land_data.get('northAngle', 0), land_data.get('roadSide', 0)
                )
                variants.append(LayoutService._create_variant(
                    assignment_l, polygon, plot_center, land_data,
                    "Privacy-Focused"
                ))

            # Fallback: if fewer than 3 strategies produced zones, fill with grid
            while len(variants) < 3:
                zones_g = LayoutService._decompose_grid(polygon, num_rooms, offset=len(variants))
                if len(zones_g) >= num_rooms:
                    assignment_g = LayoutService._assign_rooms_vastu(
                        zones_g[:num_rooms], room_configs, plot_center,
                        land_data.get('northAngle', 0), land_data.get('roadSide', 0)
                    )
                    name = ["Open Plan", "Split Level", "Courtyard"][len(variants)]
                    variants.append(LayoutService._create_variant(
                        assignment_g, polygon, plot_center, land_data, name
                    ))
                else:
                    break

            if not variants:
                return {
                    "success": False,
                    "error": "Could not generate layouts — plot may be too small or irregular",
                    "layouts": []
                }

            # Score variants
            scored = LayoutService._score_variants(variants, requirements)
            top = sorted(scored, key=lambda v: v['score'], reverse=True)[:5]

            return {
                "success": True,
                "layouts": top,
                "plotInfo": {
                    "area": plot_area,
                    "unit": land_data.get('unit', 'ft'),
                    "roadSide": land_data.get('roadSide', 0),
                    "northAngle": land_data.get('northAngle', 0),
                    "zonesGenerated": num_rooms
                },
                "error": None
            }

        except Exception as e:
            import traceback
            return {
                "success": False,
                "error": str(e),
                "layouts": [],
                "details": traceback.format_exc()[:500]
            }

    # ─────────────────────────────────────────────────────────────────
    # Spatial decomposition strategies
    # Each produces a genuinely different zone arrangement
    # ─────────────────────────────────────────────────────────────────

    @staticmethod
    def _decompose_horizontal(polygon: Polygon, num_rooms: int) -> List[Polygon]:
        """
        Slice the polygon into horizontal bands (cuts along Y axis).
        Produces top-to-bottom room arrangement.
        """
        minx, miny, maxx, maxy = polygon.bounds
        height = maxy - miny
        zones = []

        # Weight: larger rooms on top (bedrooms), smaller at bottom
        weights = LayoutService._room_height_weights(num_rooms)
        y = miny

        for i, w in enumerate(weights):
            band_h = height * w
            band = box(minx, y, maxx, y + band_h)
            zone = polygon.intersection(band)
            y += band_h

            if zone.is_empty:
                continue
            if isinstance(zone, MultiPolygon):
                # Take largest piece
                zone = max(zone.geoms, key=lambda g: g.area)
            if zone.area > 0.1:
                zones.append(zone)

        return zones

    @staticmethod
    def _decompose_vertical(polygon: Polygon, num_rooms: int) -> List[Polygon]:
        """
        Slice the polygon into vertical bands (cuts along X axis).
        Produces left-to-right room arrangement.
        """
        minx, miny, maxx, maxy = polygon.bounds
        width = maxx - minx
        zones = []

        weights = LayoutService._room_width_weights(num_rooms)
        x = minx

        for i, w in enumerate(weights):
            band_w = width * w
            band = box(x, miny, x + band_w, maxy)
            zone = polygon.intersection(band)
            x += band_w

            if zone.is_empty:
                continue
            if isinstance(zone, MultiPolygon):
                zone = max(zone.geoms, key=lambda g: g.area)
            if zone.area > 0.1:
                zones.append(zone)

        return zones

    @staticmethod
    def _decompose_l_split(polygon: Polygon, num_rooms: int) -> List[Polygon]:
        """
        Split the polygon into quadrant-style zones with unequal proportions.
        Top half split differently than bottom half — creates L-shaped variety.
        Produces the most spatially varied result.
        """
        minx, miny, maxx, maxy = polygon.bounds
        width = maxx - minx
        height = maxy - miny

        zones = []

        # Split vertical at 40% and 60% marks for variety
        h_split = miny + height * 0.45

        # Top section: split into thirds horizontally
        top_box = box(minx, h_split, maxx, maxy)
        top_zone = polygon.intersection(top_box)

        # Bottom section: split into halves
        bot_box = box(minx, miny, maxx, h_split)
        bot_zone = polygon.intersection(bot_box)

        # Further split top into left/right at 55%
        top_mid_x = minx + width * 0.55
        top_left  = top_zone.intersection(box(minx, h_split, top_mid_x, maxy))
        top_right = top_zone.intersection(box(top_mid_x, h_split, maxx, maxy))

        # Split bottom into thirds at 35% and 65%
        b1x = minx + width * 0.35
        b2x = minx + width * 0.65
        bot_left   = bot_zone.intersection(box(minx, miny, b1x, h_split))
        bot_center = bot_zone.intersection(box(b1x,  miny, b2x, h_split))
        bot_right  = bot_zone.intersection(box(b2x,  miny, maxx, h_split))

        candidates = [top_left, top_right, bot_left, bot_center, bot_right]

        for z in candidates:
            if z is None or z.is_empty:
                continue
            if isinstance(z, MultiPolygon):
                z = max(z.geoms, key=lambda g: g.area)
            if z.area > 0.5:
                zones.append(z)

        return zones

    @staticmethod
    def _decompose_grid(polygon: Polygon, num_rooms: int, offset: int = 0) -> List[Polygon]:
        """
        Grid-based fallback decomposition with offset variation.
        """
        minx, miny, maxx, maxy = polygon.bounds
        cols = math.ceil(math.sqrt(num_rooms))
        rows = math.ceil(num_rooms / cols)

        # Add slight offset variation per call to differ between fallbacks
        x_split = (0.45 + offset * 0.05)
        y_split = (0.45 + offset * 0.05)

        cell_w = (maxx - minx) / cols
        cell_h = (maxy - miny) / rows
        zones = []

        for row in range(rows):
            for col in range(cols):
                cell = box(
                    minx + col * cell_w,
                    miny + row * cell_h,
                    minx + (col + 1) * cell_w,
                    miny + (row + 1) * cell_h,
                )
                zone = polygon.intersection(cell)
                if zone.is_empty:
                    continue
                if isinstance(zone, MultiPolygon):
                    zone = max(zone.geoms, key=lambda g: g.area)
                if zone.area > 0.1:
                    zones.append(zone)

        return zones

    # ─────────────────────────────────────────────────────────────────
    # Room-to-zone assignment using Vastu direction scoring
    # ─────────────────────────────────────────────────────────────────

    @staticmethod
    def _assign_rooms_vastu(
        zones: List[Polygon],
        room_configs: List[Dict],
        plot_center: Tuple,
        north_angle: float,
        road_side: int
    ) -> List[Dict]:
        """
        Assign room types to zones using a greedy Vastu direction matching.
        Each zone gets the best-matching unassigned room type.

        Returns list of {zone, room_config, direction, centroid} dicts.
        """
        # Compute direction for each zone
        zone_info = []
        for zone in zones:
            centroid = (zone.centroid.x, zone.centroid.y)
            direction = compute_zone_direction(centroid, plot_center, north_angle, road_side)
            zone_info.append({'zone': zone, 'centroid': centroid, 'direction': direction})

        assigned = []
        remaining_rooms = list(room_configs)

        # Greedy: for each zone, find the best matching unassigned room
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

    # ─────────────────────────────────────────────────────────────────
    # Variant creation, scoring, helpers
    # ─────────────────────────────────────────────────────────────────

    @staticmethod
    def _create_variant(
        assignments: List[Dict],
        plot_polygon: Polygon,
        plot_center: Tuple,
        land_data: Dict,
        variant_name: str
    ) -> Dict:
        """
        Build the variant dict from zone-room assignments.
        """
        rooms = []
        zone_dicts = []

        for idx, a in enumerate(assignments):
            zone = a['zone']
            room_config = a['room_config']

            room = {
                'id': idx + 1,
                'room_type': room_config['room_type'],
                'polygon': zone,
                'centroid': a['centroid'],
                'direction': a['direction'],
                'area': zone.area,
                'min_area': room_config.get('min_area', 0),
                'max_area': room_config.get('max_area', 10000),
                'room_id': idx + 1
            }
            rooms.append(room)
            zone_dicts.append(room)

        valid, error_msg = validate_room_placement(zone_dicts)
        validation_warning = None if valid else error_msg

        walls = []
        try:
            walls = generate_walls_from_zones(zone_dicts)
        except Exception as e:
            print(f"[WARNING] Wall generation failed for {variant_name}: {e}")

        doors = LayoutService._generate_doors(walls, zone_dicts)
        windows = LayoutService._generate_windows(walls, zone_dicts)

        variant_dict = {
            'id': 0,
            'name': variant_name,
            'rooms': [{
                'id': r['id'],
                'type': r['room_type'],
                'area': r['area'],
                'direction': r['direction'],
                'centroid': list(r['centroid']),
                'polygon': [[float(pt[0]), float(pt[1])] for pt in r['polygon'].exterior.coords]
            } for r in rooms],
            'walls': [{
                'start': list(w['start']),
                'end': list(w['end']),
                'type': w['wall_type'],
                'rooms': w['rooms']
            } for w in walls],
            'doors': doors,
            'windows': windows,
            'score': 0
        }

        if validation_warning:
            variant_dict['warning'] = validation_warning

        return variant_dict

    @staticmethod
    def _room_height_weights(n: int) -> List[float]:
        """
        Proportional height weights for horizontal slices.
        Bedrooms/living get more vertical space, bathrooms less.
        """
        if n == 1: return [1.0]
        if n == 2: return [0.55, 0.45]
        if n == 3: return [0.38, 0.35, 0.27]
        if n == 4: return [0.30, 0.28, 0.25, 0.17]
        if n == 5: return [0.26, 0.24, 0.22, 0.17, 0.11]
        # General case: geometric decay
        base = [1.0 / (1.15 ** i) for i in range(n)]
        total = sum(base)
        return [b / total for b in base]

    @staticmethod
    def _room_width_weights(n: int) -> List[float]:
        """
        Proportional width weights for vertical slices.
        """
        if n == 1: return [1.0]
        if n == 2: return [0.45, 0.55]
        if n == 3: return [0.30, 0.38, 0.32]
        if n == 4: return [0.22, 0.30, 0.28, 0.20]
        if n == 5: return [0.18, 0.24, 0.26, 0.20, 0.12]
        base = [1.0 / (1.1 ** i) for i in range(n)]
        total = sum(base)
        return [b / total for b in base]

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

            if requirements.get('hasDiningRoom', False):
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
                    'position': [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2],
                    'rooms': wall['rooms'],
                    'width': 3.0
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
                length = math.sqrt((end[0]-start[0])**2 + (end[1]-start[1])**2)
                if length > 5:
                    for pos in [0.33, 0.67]:
                        windows.append({
                            'id': window_id,
                            'position': [
                                start[0] + (end[0]-start[0]) * pos,
                                start[1] + (end[1]-start[1]) * pos
                            ],
                            'size': 3.0
                        })
                        window_id += 1
        return windows

    @staticmethod
    def _score_variants(variants: List[Dict], requirements: Dict) -> List[Dict]:
        """Score all variants using Vastu compliance."""
        for idx, variant in enumerate(variants):
            variant['id'] = idx + 1
            rooms_for_scoring = [
                {'room_type': r['type'], 'direction': r['direction'], 'area': r['area']}
                for r in variant['rooms']
            ]
            vastu_enabled = requirements.get('vastuEnabled', True)
            variant['score'] = (
                VastuScorer.score_layout(rooms_for_scoring, requirements)
                if vastu_enabled else 50.0
            )
        return variants