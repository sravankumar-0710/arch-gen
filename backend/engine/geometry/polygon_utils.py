# filepath: backend/engine/geometry/polygon_utils.py
# Purpose: Polygon decomposition, validation, and area utilities using Shapely

from shapely.geometry import Polygon
from shapely.validation import explain_validity
from dataclasses import dataclass, field


@dataclass
class PolygonValidationResult:
    """Result of a polygon validation check."""
    is_valid: bool
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


# India NBC 2016, Part 3 — minimum habitable plot area
MIN_PLOT_AREA_SQFT = 225  # 15ft × 15ft absolute minimum


def validate_polygon(points: list[tuple]) -> PolygonValidationResult:
    """
    Validate a polygon defined by a list of (x, y) coordinate tuples.

    Checks:
        - Minimum 3 points
        - No self-intersections (using Shapely)
        - Minimum area threshold met

    Args:
        points: List of (x, y) coordinate tuples in feet

    Returns:
        PolygonValidationResult with is_valid flag and any errors/warnings
    """
    # TODO(phase-5a): Implement full polygon validation
    errors = []
    warnings = []

    if len(points) < 3:
        errors.append("Polygon must have at least 3 points")
        return PolygonValidationResult(is_valid=False, errors=errors)

    polygon = Polygon(points)

    if not polygon.is_valid:
        errors.append(f"Invalid polygon geometry: {explain_validity(polygon)}")

    area = polygon.area
    if area < MIN_PLOT_AREA_SQFT:
        errors.append(
            f"Plot area {area:.1f} sqft is below the minimum {MIN_PLOT_AREA_SQFT} sqft"
        )

    return PolygonValidationResult(
        is_valid=len(errors) == 0,
        errors=errors,
        warnings=warnings,
    )


def compute_area(points: list[tuple]) -> float:
    """
    Compute the area of a polygon given a list of (x, y) coordinate tuples.

    Uses Shapely's Polygon area calculation.

    Args:
        points: List of (x, y) coordinate tuples

    Returns:
        Area in square feet (same unit as input coordinates)
    """
    # TODO(phase-5a): Add unit conversion support (meters ↔ feet)
    return Polygon(points).area


def compute_centroid(points: list[tuple]) -> tuple:
    """
    Compute the centroid of a polygon.

    Args:
        points: List of (x, y) coordinate tuples

    Returns:
        (x, y) centroid coordinate tuple
    """
    centroid = Polygon(points).centroid
    return (centroid.x, centroid.y)


def compute_bounding_box(points: list[tuple]) -> dict:
    """
    Compute the axis-aligned bounding box of a polygon.

    Args:
        points: List of (x, y) coordinate tuples

    Returns:
        Dict with keys: min_x, min_y, max_x, max_y, width, height
    """
    polygon = Polygon(points)
    min_x, min_y, max_x, max_y = polygon.bounds
    return {
        "min_x": min_x,
        "min_y": min_y,
        "max_x": max_x,
        "max_y": max_y,
        "width": max_x - min_x,
        "height": max_y - min_y,
    }