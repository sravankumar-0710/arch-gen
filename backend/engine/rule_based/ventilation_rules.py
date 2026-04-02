# filepath: backend/engine/rule_based/ventilation_rules.py
# Purpose: Validates ventilation requirements (exterior walls, window presence).
# India NBC 2016, Part 3, Section 4.10 â€” Lighting and Ventilation.

from dataclasses import dataclass
from typing import List, Dict
from shapely.geometry import Polygon


@dataclass
class RuleResult:
    """Result of a rule validation check."""
    valid: bool
    message: str = ""


# Habitable rooms MUST have ventilation
HABITABLE_ROOMS = [
    'master_bedroom', 'bedroom', 'living_room', 'dining_room', 'kitchen', 'pooja', 'study'
]


class VentilationRules:
    """Validates ventilation requirements for rooms."""

    @staticmethod
    def validate_ventilation(room: Dict, plot_polygon: Polygon) -> RuleResult:
        """
        Check if a room has at least one exterior wall for ventilation.
        
        Args:
            room: Room dictionary with 'polygon' and 'room_type'
            plot_polygon: The full plot boundary
            
        Returns:
            RuleResult with valid flag and message
        """
        room_poly = room['polygon']
        room_type = room['room_type']
        
        # Check if any edge of the room polygon is on the boundary of the plot
        # A room has an exterior wall if its intersection with the plot boundary is a line.
        plot_boundary = plot_polygon.boundary
        room_boundary = room_poly.boundary
        
        intersection = plot_boundary.intersection(room_boundary)
        
        if not intersection.is_empty and intersection.length > 0.1:
            return RuleResult(valid=True, message=f"{room_type} has exterior ventilation")
            
        # If it's a habitable room and has no exterior wall, it's a violation
        if room_type in HABITABLE_ROOMS:
            return RuleResult(
                valid=False, 
                message=f"Warning: {room_type} has no exterior wall (no ventilation)"
            )
            
        return RuleResult(valid=True, message=f"{room_type} is interior but permitted")

    @staticmethod
    def check_all_rooms(rooms: List[Dict], plot_polygon: Polygon) -> List[str]:
        """
        Run ventilation checks on all rooms and return a list of warnings.
        """
        warnings = []
        for room in rooms:
            res = VentilationRules.validate_ventilation(room, plot_polygon)
            if not res.valid:
                warnings.append(res.message)
        return warnings
