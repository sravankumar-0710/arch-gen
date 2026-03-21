# filepath: backend/engine/constraint_solver/orientation_solver.py
# Purpose: Scores a layout variant based on road and north orientation alignment.
# Entrance should face the road. Service rooms (bathroom, staircase) away from road.

from typing import List, Dict


# Which directions are "toward the road" for each road_side value
ROAD_FACING_DIRECTION = {
    0: ['S', 'SE', 'SW'],   # road_side=0 (front/south)
    1: ['E', 'NE', 'SE'],   # road_side=1 (right/east)
    2: ['N', 'NE', 'NW'],   # road_side=2 (back/north)
    3: ['W', 'NW', 'SW'],   # road_side=3 (left/west)
}

# Rooms that benefit from facing the road
ROAD_FACING_ROOMS = ['living_room', 'entrance', 'balcony', 'dining_room']

# Rooms that should NOT face the road
ROAD_AVOIDING_ROOMS = ['master_bedroom', 'bathroom', 'staircase']


class OrientationSolver:
    """Scores layout variants based on road and north orientation."""

    @staticmethod
    def score(assignments: List[Dict], north_angle: float, road_side: int) -> float:
        """
        Score a layout variant's orientation compliance.

        Args:
            assignments: List of {zone, room_config, direction, centroid} dicts
            north_angle: North direction in degrees
            road_side: Road side indicator (0=front, 1=right, 2=back, 3=left)

        Returns:
            Score 0.0–1.0
        """
        if not assignments:
            return 0.5

        road_directions = ROAD_FACING_DIRECTION.get(road_side, ['S', 'SE', 'SW'])
        total_score = 0.0
        max_score = 0.0

        for a in assignments:
            room_type = a['room_config']['room_type']
            direction = a['direction']

            if room_type in ROAD_FACING_ROOMS:
                max_score += 2.0
                if direction in road_directions:
                    total_score += 2.0
                elif direction in OrientationSolver._adjacent_directions(road_directions):
                    total_score += 1.0

            elif room_type in ROAD_AVOIDING_ROOMS:
                max_score += 2.0
                if direction not in road_directions:
                    total_score += 2.0
                elif direction in OrientationSolver._adjacent_directions(road_directions):
                    total_score += 1.0
            else:
                # Neutral rooms contribute a baseline
                max_score += 1.0
                total_score += 0.5

        return total_score / max_score if max_score > 0 else 0.5

    @staticmethod
    def _adjacent_directions(directions: List[str]) -> List[str]:
        """
        Return directions adjacent (clockwise or counterclockwise) to the given ones.
        Used for partial credit scoring.
        """
        all_dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
        adjacent = set()
        for d in directions:
            if d in all_dirs:
                idx = all_dirs.index(d)
                adjacent.add(all_dirs[(idx - 1) % 8])
                adjacent.add(all_dirs[(idx + 1) % 8])
        return list(adjacent - set(directions))