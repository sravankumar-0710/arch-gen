# filepath: backend/engine/rule_based/building_code_rules.py
# Purpose: Validates building-wide constraints (setbacks, coverage) against India NBC 2016.
# All constants cite their source.

from dataclasses import dataclass
from shapely.geometry import Polygon


@dataclass
class RuleResult:
    """Result of a rule validation check."""
    valid: bool
    message: str = ""
    errors: list[str] = None
    warnings: list[str] = None

    def __post_init__(self):
        if self.errors is None:
            self.errors = []
        if self.warnings is None:
            self.warnings = []


# India NBC 2016, Part 3, Section 4.8.1 â€” Minimum setbacks for residential buildings
# All values in feet (converted from meters: 1.5m â‰ˆ 5ft, 0.9m â‰ˆ 3ft)
MIN_FRONT_SETBACK = 5.0
MIN_SIDE_SETBACK = 3.0
MIN_REAR_SETBACK = 3.0

# India NBC 2016, Part 3, Section 4.7 â€” Maximum plot coverage
MAX_PLOT_COVERAGE_RATIO = 0.60


class BuildingCodeRules:
    """Validates building-wide constraints against NBC 2016."""

    @staticmethod
    def validate_coverage(plot_area: float, built_up_area: float) -> RuleResult:
        """
        Check if the built-up area exceeds the maximum allowed plot coverage.
        
        Args:
            plot_area: Total area of the plot
            built_up_area: Total area of all rooms combined
            
        Returns:
            RuleResult with valid flag and message
        """
        if plot_area <= 0:
            return RuleResult(valid=False, message="Invalid plot area")
            
        coverage_ratio = built_up_area / plot_area
        
        if coverage_ratio > MAX_PLOT_COVERAGE_RATIO:
            return RuleResult(
                valid=False,
                message=(
                    f"Coverage exceeds limit: {coverage_ratio*100:.1f}% "
                    f"(Max {MAX_PLOT_COVERAGE_RATIO*100:.1f}%)"
                )
            )
            
        return RuleResult(
            valid=True,
            message=f"Coverage OK: {coverage_ratio*100:.1f}%"
        )

    @staticmethod
    def validate_setbacks(plot_polygon: Polygon, building_polygon: Polygon, road_side: int) -> RuleResult:
        """
        Check if the building maintains minimum setbacks from plot boundaries.
        
        Args:
            plot_polygon: The full plot boundary
            building_polygon: The outer footprint of all rooms combined
            road_side: 0=Front/North, 1=Right/East, 2=Back/South, 3=Left/West (default)
            
        Returns:
            RuleResult with valid flag and message
        """
        # This is a simplified check for MVP. 
        # In a real engine, we'd check distance from each plot edge.
        
        # Calculate distance from building to plot boundary
        # If building is too close to any edge, it's a violation.
        
        # For MVP, we check the minimum distance overall first.
        min_distance = plot_polygon.exterior.distance(building_polygon)
        
        if min_distance < min(MIN_SIDE_SETBACK, MIN_REAR_SETBACK):
             return RuleResult(
                valid=False,
                message=f"Building too close to plot boundary ({min_distance:.1f}ft, min 3ft required)"
            )
            
        return RuleResult(valid=True, message="Setbacks OK")
