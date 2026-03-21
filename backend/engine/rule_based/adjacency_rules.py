# filepath: backend/engine/rule_based/adjacency_rules.py
# Purpose: Validates that rooms with adjacency constraints are correctly placed.
# E.g. kitchen should not be adjacent to master bedroom.

from dataclasses import dataclass
from typing import List, Dict


@dataclass
class RuleResult:
    """Result of a rule validation check."""
    valid: bool
    message: str = ""


# Rooms that MUST be adjacent (share a wall)
REQUIRED_ADJACENCY = [
    ('kitchen', 'dining_room'),
    ('master_bedroom', 'bathroom'),
]

# Rooms that MUST NOT be adjacent
FORBIDDEN_ADJACENCY = [
    ('kitchen', 'master_bedroom'),
    ('bathroom', 'kitchen'),
    ('bathroom', 'dining_room'),
]


class AdjacencyRules:
    """Validates room adjacency constraints."""

    @staticmethod
    def validate(assignments: List[Dict]) -> RuleResult:
        """
        Check adjacency rules across all room assignments.
        Uses zone polygon proximity to determine adjacency.

        Args:
            assignments: List of {zone, room_config, direction, centroid} dicts

        Returns:
            RuleResult — valid if no forbidden adjacencies, warning if required ones missing
        """
        if not assignments or len(assignments) < 2:
            return RuleResult(valid=True, message="Too few rooms to check adjacency")

        # Build adjacency map: which rooms share a boundary
        adjacent_pairs = set()
        for i, a in enumerate(assignments):
            for j, b in enumerate(assignments):
                if i >= j:
                    continue
                zone_a = a['zone']
                zone_b = b['zone']
                # Zones are adjacent if their boundaries intersect with length > 0
                try:
                    intersection = zone_a.boundary.intersection(zone_b.boundary)
                    if not intersection.is_empty and intersection.length > 0.1:
                        type_a = a['room_config']['room_type']
                        type_b = b['room_config']['room_type']
                        adjacent_pairs.add((min(type_a, type_b), max(type_a, type_b)))
                except Exception:
                    continue

        # Check forbidden adjacencies
        for room_a, room_b in FORBIDDEN_ADJACENCY:
            pair = (min(room_a, room_b), max(room_a, room_b))
            if pair in adjacent_pairs:
                return RuleResult(
                    valid=False,
                    message=f"Warning: {room_a} is adjacent to {room_b} — not recommended"
                )

        return RuleResult(valid=True, message="Adjacency rules passed")