# filepath: backend/utils/geometry_utils.py
# Purpose: Geometry utilities for polygon operations using Shapely

from shapely.geometry import Polygon, Point, LineString, box
from shapely.ops import unary_union
import math
from typing import List, Tuple, Dict


def canvas_to_real(polygon_points: List[Dict], unit: str, pixels_per_unit: float = 20) -> Polygon:
    """
    Convert canvas pixel coordinates to a real-world Shapely Polygon.

    Args:
        polygon_points: List of {x, y} points in canvas coordinates
        unit: "ft" or "m" (stored for scaling context)
        pixels_per_unit: Conversion factor (default 20 pixels = 1 unit)

    Returns:
        Shapely Polygon in real-world coordinates
    """
    if len(polygon_points) < 3:
        raise ValueError("Polygon must have at least 3 points")

    # Convert canvas coordinates to real-world coordinates
    real_coords = []
    for point in polygon_points:
        real_x = point['x'] / pixels_per_unit
        real_y = point['y'] / pixels_per_unit
        real_coords.append((real_x, real_y))

    return Polygon(real_coords)


def decompose_grid_based(polygon: Polygon, grid_cols: int, grid_rows: int) -> List[Polygon]:
    """
    Decompose a polygon into grid-based zones for room placement.

    Args:
        polygon: Shapely Polygon representing the plot
        grid_cols: Number of columns in grid (typically 2-3)
        grid_rows: Number of rows in grid (typically 2-3)

    Returns:
        List of Shapely Polygon zones that fit within the plot
    """
    minx, miny, maxx, maxy = polygon.bounds

    cell_width = (maxx - minx) / grid_cols
    cell_height = (maxy - miny) / grid_rows

    zones = []

    for row in range(grid_rows):
        for col in range(grid_cols):
            # Create grid cell
            cell_minx = minx + col * cell_width
            cell_miny = miny + row * cell_height
            cell_maxx = cell_minx + cell_width
            cell_maxy = cell_miny + cell_height

            cell_box = box(cell_minx, cell_miny, cell_maxx, cell_maxy)

            # Intersect with polygon to get valid zone
            zone = polygon.intersection(cell_box)

            # Only include valid polygons (not empty, not just a line/point)
            if zone.geom_type == 'Polygon' and zone.area > 0:
                zones.append(zone)
            elif zone.geom_type == 'MultiPolygon':
                # If intersection creates multiple polygons, take the largest
                largest = max(zone.geoms, key=lambda p: p.area)
                if largest.area > 0:
                    zones.append(largest)

    return zones


def compute_zone_direction(centroid: Tuple[float, float], plot_center: Tuple[float, float],
                          north_angle: float, road_side: int) -> str:
    """
    Compute cardinal direction (N, NE, E, SE, S, SW, W, NW) of a zone centroid.

    Args:
        centroid: (x, y) of zone center in real-world coordinates
        plot_center: (x, y) of plot center
        north_angle: North direction angle in degrees (0-360)
        road_side: Road side indicator (0=front/down, 1=right, 2=back/up, 3=left)

    Returns:
        Direction string: 'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'
    """
    # Calculate angle from plot center to zone centroid
    dx = centroid[0] - plot_center[0]
    dy = centroid[1] - plot_center[1]

    # Compute angle in degrees (0 = east, 90 = north in typical canvas coordinates)
    if dx == 0 and dy == 0:
        return 'CENTER'

    angle_rad = math.atan2(dy, dx)
    angle_deg = math.degrees(angle_rad)

    # Normalize north angle to canvas coordinates (canvas y increases downward)
    # north_angle is the compass direction; we need to convert to canvas coordinates
    adjusted_angle = (angle_deg - north_angle) % 360

    # Map angle to direction (45 degree sectors)
    # 0-45 and 315-360 = N, 45-135 = E, 135-225 = S, 225-315 = W, etc.
    if adjusted_angle < 22.5 or adjusted_angle >= 337.5:
        return 'N'
    elif adjusted_angle < 67.5:
        return 'NE'
    elif adjusted_angle < 112.5:
        return 'E'
    elif adjusted_angle < 157.5:
        return 'SE'
    elif adjusted_angle < 202.5:
        return 'S'
    elif adjusted_angle < 247.5:
        return 'SW'
    elif adjusted_angle < 292.5:
        return 'W'
    else:
        return 'NW'


def find_entry_points(polygon: Polygon, road_side: int) -> List[Point]:
    """
    Find potential entry points on the plot boundary facing the road.

    Args:
        polygon: Shapely Polygon representing the plot
        road_side: Road side indicator (0=front/down, 1=right, 2=back/up, 3=left)

    Returns:
        List of potential entry Point objects on the boundary
    """
    boundary = polygon.boundary

    if boundary.is_empty:
        return []

    # Get bounding box to identify which edge is the road side
    minx, miny, maxx, maxy = polygon.bounds

    # Extract segments of boundary based on road_side
    # 0 = front (bottom/south), 1 = right (east), 2 = back (top/north), 3 = left (west)
    threshold = 0.1  # 10% of boundary length

    entry_points = []

    # Sample points along the boundary
    if boundary.geom_type == 'LineString':
        coords = list(boundary.coords)
        num_samples = min(100, len(coords) * 5)

        for i in range(num_samples):
            param = i / num_samples
            point = boundary.interpolate(param, normalized=True)
            x, y = point.x, point.y

            # Check if point is on the correct road side
            on_road = False
            if road_side == 0 and y >= maxy * 0.95:  # Front/bottom
                on_road = True
            elif road_side == 1 and x >= maxx * 0.95:  # Right/east
                on_road = True
            elif road_side == 2 and y <= miny * 1.05:  # Back/top
                on_road = True
            elif road_side == 3 and x <= minx * 1.05:  # Left/west
                on_road = True

            if on_road:
                entry_points.append(point)

    return entry_points if entry_points else [Point(polygon.centroid)]


def generate_walls_from_zones(zones: List[Dict]) -> List[Dict]:
    """
    Generate wall lines from room zones.

    Args:
        zones: List of {polygon, room_type, room_id} dictionaries

    Returns:
        List of wall dictionaries {start: [x,y], end: [x,y], wall_type, rooms: [id1, id2]}
    """
    walls = []
    wall_set = set()  # Track unique walls to avoid duplicates

    for idx, zone_a in enumerate(zones):
        poly_a = zone_a['polygon']

        for zone_b in zones[idx + 1:]:
            poly_b = zone_b['polygon']

            # Check if zones share a boundary (are adjacent)
            boundary_a = poly_a.boundary
            boundary_b = poly_b.boundary

            # Compute intersection - shared edge means adjacent zones
            intersection = boundary_a.intersection(boundary_b)

            if not intersection.is_empty and intersection.length > 0.1:
                # Zones share a wall
                if intersection.geom_type == 'LineString':
                    coords = list(intersection.coords)
                    if len(coords) >= 2:
                        start = tuple(coords[0])
                        end = tuple(coords[-1])

                        wall_key = tuple(sorted([start, end]))
                        if wall_key not in wall_set:
                            wall_set.add(wall_key)
                            walls.append({
                                'start': list(start),
                                'end': list(end),
                                'wall_type': 'partition',  # Internal walls are partitions
                                'rooms': [zone_a['room_id'], zone_b['room_id']]
                            })

    # Add exterior walls
    for zone in zones:
        poly = zone['polygon']
        boundary = poly.boundary

        if boundary.geom_type == 'LineString':
            coords = list(boundary.coords)
            for i in range(len(coords) - 1):
                start = tuple(coords[i])
                end = tuple(coords[i + 1])

                wall_key = tuple(sorted([start, end]))
                if wall_key not in wall_set:
                    wall_set.add(wall_key)
                    walls.append({
                        'start': list(start),
                        'end': list(end),
                        'wall_type': 'load_bearing',  # Exterior walls are load-bearing
                        'rooms': [zone['room_id']]
                    })

    return walls


def validate_room_placement(rooms: List[Dict]) -> Tuple[bool, str]:
    """
    Validate that rooms don't overlap and meet constraints.

    Args:
        rooms: List of {polygon, room_type, room_id, min_area, max_area} dicts

    Returns:
        Tuple of (valid: bool, error_message: str)
    """
    if not rooms:
        return False, "No rooms to validate"

    # Check for overlaps between rooms
    for idx, room_a in enumerate(rooms):
        poly_a = room_a['polygon']

        # Skip invalid polygons
        if not poly_a.is_valid:
            return False, f"Room {room_a['room_id']} has invalid polygon"

        # Check area constraints
        area = poly_a.area
        min_area = room_a.get('min_area', 50)
        max_area = room_a.get('max_area', 10000)

        if area < min_area:
            return False, f"Room {room_a['room_id']} is too small ({area:.1f} sqft, minimum {min_area} sqft)"

        if area > max_area:
            return False, f"Room {room_a['room_id']} is too large ({area:.1f} sqft, maximum {max_area} sqft)"

        # Check for overlaps with other rooms
        for room_b in rooms[idx + 1:]:
            poly_b = room_b['polygon']

            intersection = poly_a.intersection(poly_b)

            # Allow small intersections (numerical errors), but not significant overlaps
            if intersection.area > 0.1:
                return False, f"Room {room_a['room_id']} overlaps with room {room_b['room_id']}"

    return True, "Validation passed"


def compute_plot_center(polygon: Polygon) -> Tuple[float, float]:
    """
    Compute the center point of a polygon.

    Args:
        polygon: Shapely Polygon

    Returns:
        Tuple of (x, y) center coordinates
    """
    centroid = polygon.centroid
    return (centroid.x, centroid.y)


def compute_polygon_area(polygon: Polygon, unit: str = 'sqft') -> float:
    """
    Compute polygon area in desired unit.

    Args:
        polygon: Shapely Polygon in real-world coordinates
        unit: Target unit ('sqft' or 'sqm')

    Returns:
        Area in specified unit
    """
    # Assuming polygon is already in real coordinates (ft or m)
    area = polygon.area

    if unit == 'sqft':
        return area
    elif unit == 'sqm':
        # Convert sqft to sqm: 1 sqm = 10.764 sqft
        return area / 10.764

    return area
