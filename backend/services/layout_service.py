# filepath: backend/services/layout_service.py
# Purpose: Core layout generation engine using geometry and Vastu scoring

from typing import Dict, List, Tuple
from shapely.geometry import Polygon
import itertools
import math

from utils.geometry_utils import (
    canvas_to_real, decompose_grid_based, compute_zone_direction,
    compute_plot_center, compute_polygon_area, generate_walls_from_zones,
    validate_room_placement
)
from utils.vastu_scorer import VastuScorer


class LayoutService:
    """Service for AI-powered floor plan layout generation."""

    @staticmethod
    def generate_layouts(land_data: Dict, requirements: Dict, user_id: int = None) -> Dict:
        """
        Main orchestrator: generate multiple layout variants for a plot.
        """
        try:
            # Parse and validate land data
            polygon = LayoutService._parse_land_data(land_data)
            plot_center = compute_plot_center(polygon)
            plot_area = compute_polygon_area(polygon, land_data.get('unit', 'ft'))

            # Build room requirements
            room_configs = LayoutService._build_room_configs(requirements)

            # Validate room configs
            if not room_configs:
                return {
                    "success": False,
                    "error": "No valid room configurations provided",
                    "layouts": []
                }

            # Decompose plot into zones
            grid_size = LayoutService._compute_grid_size(len(room_configs))
            zones = decompose_grid_based(polygon, grid_size[0], grid_size[1])

            if len(zones) < len(room_configs):
                return {
                    "success": False,
                    "error": f"Plot too small for {len(room_configs)} rooms. Got {len(zones)} zones.",
                    "layouts": []
                }

            # Generate multiple layout variants
            variants = LayoutService._generate_variants(
                zones, room_configs, polygon, plot_center,
                land_data, requirements
            )

            # Score and rank variants
            scored_variants = LayoutService._score_variants(variants, requirements)
            top_layouts = sorted(scored_variants, key=lambda v: v['score'], reverse=True)[:5]

            return {
                "success": True,
                "layouts": top_layouts,
                "plotInfo": {
                    "area": plot_area,
                    "unit": land_data.get('unit', 'ft'),
                    "roadSide": land_data.get('roadSide', 0),
                    "northAngle": land_data.get('northAngle', 0),
                    "zonesGenerated": len(zones)
                },
                "error": None
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "layouts": [],
                "details": type(e).__name__
            }

    @staticmethod
    def _parse_land_data(land_data: Dict) -> Polygon:
        """
        Parse and validate land data, returning a Shapely Polygon.

        Args:
            land_data: Land input data from frontend

        Returns:
            Shapely Polygon in real-world coordinates
        """
        polygon_points = land_data.get('polygonPoints', [])
        unit = land_data.get('unit', 'ft')

        if len(polygon_points) < 3:
            raise ValueError("Polygon must have at least 3 points")

        try:
            polygon = canvas_to_real(polygon_points, unit)
        except Exception as e:
            raise ValueError(f"Failed to convert polygon: {str(e)}")

        if not polygon.is_valid:
            raise ValueError("Invalid polygon: self-intersecting or degenerate")

        if polygon.area < 100:  # Minimum ~5x5 sqft in real units
            raise ValueError("Plot area too small (minimum ~100 sqft)")

        return polygon

    @staticmethod
    def _build_room_configs(requirements: Dict) -> List[Dict]:
        """
        Build room configuration list from requirements.

        Args:
            requirements: User requirements dict

        Returns:
            List of {room_type, min_area, max_area, count} dicts
        """
        rooms = []
        mode = requirements.get('mode', 'basic')

        if mode == 'basic':
            # Basic mode: use toggles and counts
            if requirements.get('bedroomCount', 1) > 0:
                for i in range(requirements.get('bedroomCount', 1)):
                    if i == 0:
                        # First bedroom is master
                        rooms.append({
                            'room_type': 'master_bedroom',
                            'min_area': 140,
                            'max_area': 250
                        })
                    else:
                        rooms.append({
                            'room_type': 'bedroom',
                            'min_area': 90,
                            'max_area': 160
                        })

            if requirements.get('hasKitchen', True):
                rooms.append({
                    'room_type': 'kitchen',
                    'min_area': 80,
                    'max_area': 150
                })

            if requirements.get('hasLivingRoom', True):
                rooms.append({
                    'room_type': 'living_room',
                    'min_area': 150,
                    'max_area': 300
                })

            if requirements.get('hasDiningRoom', False):
                rooms.append({
                    'room_type': 'dining_room',
                    'min_area': 100,
                    'max_area': 200
                })

            # Add bathroom(s) - roughly 1 per 3 bedrooms
            bathroom_count = max(1, (requirements.get('bedroomCount', 1) + 2) // 3)
            for _ in range(bathroom_count):
                rooms.append({
                    'room_type': 'bathroom',
                    'min_area': 40,
                    'max_area': 80
                })

        else:
            # Advanced mode: use custom room list
            rooms = requirements.get('rooms', [])

        return rooms

    @staticmethod
    def _compute_grid_size(num_rooms: int) -> Tuple[int, int]:
        """
        Compute optimal grid size for decomposition.

        Args:
            num_rooms: Number of rooms needed

        Returns:
            Tuple of (cols, rows) for grid
        """
        # Prefer roughly square grids
        if num_rooms <= 2:
            return (2, 1)
        elif num_rooms <= 4:
            return (2, 2)
        elif num_rooms <= 6:
            return (3, 2)
        else:
            return (3, 3)

    @staticmethod
    def _generate_variants(
        zones: List[Polygon],
        room_configs: List[Dict],
        polygon: Polygon,
        plot_center: Tuple[float, float],
        land_data: Dict,
        requirements: Dict
    ) -> List[Dict]:
        """
        Generate multiple layout variants by assigning rooms to zones.
        """
        variants = []
        room_count = len(room_configs)
        zone_count = len(zones)

        if room_count > zone_count:
            room_count = zone_count

        # Get the zones to use for this layout
        selected_zones = zones[:room_count]

        # Strategy 1: Default - zip rooms directly to zones
        variants.append(LayoutService._create_variant(
            selected_zones,
            room_configs[:room_count],
            polygon,
            plot_center,
            land_data,
            "Default (Vastu-Optimized)"
        ))

        # Strategy 2: Rotate both zones and room configs by 1
        if room_count >= 2:
            rotated_zones = selected_zones[1:] + [selected_zones[0]]
            rotated_rooms = room_configs[1:room_count] + [room_configs[0]]
            variants.append(LayoutService._create_variant(
                rotated_zones,
                rotated_rooms,
                polygon,
                plot_center,
                land_data,
                "Compact Layout"
            ))

        # Strategy 3: Rotate both zones and room configs by 2
        if room_count >= 3:
            rotated_zones_2 = selected_zones[2:] + selected_zones[:2]
            rotated_rooms_2 = room_configs[2:room_count] + room_configs[:2]
            variants.append(LayoutService._create_variant(
                rotated_zones_2,
                rotated_rooms_2,
                polygon,
                plot_center,
                land_data,
                "Privacy-Focused"
            ))

        return variants

    @staticmethod
    def _create_variant(
        assigned_zones: List[Polygon],
        room_configs: List[Dict],
        plot_polygon: Polygon,
        plot_center: Tuple[float, float],
        land_data: Dict,
        variant_name: str
    ) -> Dict:
        """
        Create a single layout variant by assigning rooms to zones.

        Args:
            assigned_zones: List of zones to assign rooms
            room_configs: Room configurations to place
            plot_polygon: Full plot polygon
            plot_center: Center of plot
            land_data: Land input data
            variant_name: Name for this variant

        Returns:
            Variant dict with rooms, walls, doors, score
        """
        north_angle = land_data.get('northAngle', 0)
        road_side = land_data.get('roadSide', 0)

        rooms = []
        zone_dicts = []

        # Debug: print zone centroids
        zone_centroids = [f"({z.centroid.x:.1f},{z.centroid.y:.1f})" for z in assigned_zones]
        print(f"[{variant_name}] Zone centroids: {zone_centroids}")

        for idx, (zone, room_config) in enumerate(zip(assigned_zones, room_configs)):
            # Compute zone properties
            centroid = (zone.centroid.x, zone.centroid.y)
            direction = compute_zone_direction(centroid, plot_center, north_angle, road_side)
            area = zone.area

            room = {
                'id': idx + 1,
                'room_type': room_config['room_type'],
                'polygon': zone,
                'centroid': centroid,
                'direction': direction,
                'area': area,
                'min_area': room_config.get('min_area', 0),
                'max_area': room_config.get('max_area', 10000),
                'room_id': idx + 1
            }

            rooms.append(room)
            zone_dicts.append(room)

        # Print room assignment
        room_types = [r['room_type'] for r in rooms]
        print(f"[{variant_name}] Room assignment: {room_types}")

        # Validate placement (warning, not blocking)
        valid, error_msg = validate_room_placement(zone_dicts)
        validation_warning = None if valid else error_msg

        # Generate walls from zones (pass zone_dicts which have polygon and room_id)
        walls = []
        try:
            walls = generate_walls_from_zones(zone_dicts)
        except Exception as e:
            print(f"[WARNING] Wall generation failed: {e}")
            walls = []

        # Generate doors (on each wall, place at center)
        doors = LayoutService._generate_doors(walls, zone_dicts)

        # Generate windows (on exterior walls)
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
            'score': 0  # Will be computed in _score_variants
        }

        # Add validation warning if present
        if validation_warning:
            variant_dict['warning'] = validation_warning

        return variant_dict

    @staticmethod
    def _generate_doors(walls: List[Dict], rooms: List[Dict]) -> List[Dict]:
        """
        Generate door placements on walls.

        Args:
            walls: List of wall dicts
            rooms: List of room dicts

        Returns:
            List of door dicts
        """
        doors = []
        door_id = 1

        for wall in walls:
            # Place door on partition walls (interior) but not on external
            if wall['wall_type'] == 'partition' and len(wall['rooms']) == 2:
                # Door at midpoint of wall
                start = wall['start']
                end = wall['end']
                mid_x = (start[0] + end[0]) / 2
                mid_y = (start[1] + end[1]) / 2

                doors.append({
                    'id': door_id,
                    'position': [mid_x, mid_y],
                    'rooms': wall['rooms'],
                    'width': 3.0  # Standard door ~3ft wide
                })
                door_id += 1

        return doors

    @staticmethod
    def _generate_windows(walls: List[Dict], rooms: List[Dict]) -> List[Dict]:
        """
        Generate window placements on exterior walls.

        Args:
            walls: List of wall dicts
            rooms: List of room dicts

        Returns:
            List of window dicts
        """
        windows = []
        window_id = 1

        for wall in walls:
            # Windows on exterior walls (load-bearing)
            if wall['wall_type'] == 'load_bearing':
                # Place windows at 1/3 and 2/3 of wall
                start = wall['start']
                end = wall['end']

                # Only if wall is long enough for windows
                wall_length = ((end[0] - start[0])**2 + (end[1] - start[1])**2)**0.5
                if wall_length > 5:  # At least 5ft for windows
                    for pos in [0.33, 0.67]:
                        x = start[0] + (end[0] - start[0]) * pos
                        y = start[1] + (end[1] - start[1]) * pos

                        windows.append({
                            'id': window_id,
                            'position': [x, y],
                            'size': 3.0  # Standard window ~3ft wide
                        })
                        window_id += 1

        return windows

    @staticmethod
    def _score_variants(variants: List[Dict], requirements: Dict) -> List[Dict]:
        """
        Score all variants using Vastu compliance.

        Args:
            variants: List of variant dicts
            requirements: User requirements

        Returns:
            List of variants with scores added
        """
        for idx, variant in enumerate(variants):
            variant['id'] = idx + 1

            # Extract room data for scoring
            rooms_for_scoring = [
                {
                    'room_type': r['type'],
                    'direction': r['direction'],
                    'area': r['area']
                }
                for r in variant['rooms']
            ]

            # Compute Vastu score
            vastu_enabled = requirements.get('vastuEnabled', True)
            if vastu_enabled:
                score = VastuScorer.score_layout(rooms_for_scoring, requirements)
            else:
                score = 50.0  # Neutral score if Vastu disabled

            variant['score'] = score
            # Skip scoreBreakdown for now to simplify serialization
            # variant['scoreBreakdown'] = VastuScorer.get_score_explanation(rooms_for_scoring)

        return variants
