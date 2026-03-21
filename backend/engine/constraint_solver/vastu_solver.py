# filepath: backend/engine/constraint_solver/vastu_solver.py
# Purpose: Assigns rooms to spatial zones using Vastu Shastra direction preferences.
# Uses greedy matching: each zone gets the best unassigned room for its compass direction.

from typing import List, Dict, Tuple
from shapely.geometry import Polygon

from utils.geometry_utils import compute_zone_direction, compute_plot_center


# Vastu-preferred compass directions per room type
# Order matters: first = most preferred
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


class VastuSolver:
    """Assigns rooms to zones using Vastu direction preferences."""

    @staticmethod
    def assign_rooms_to_zones(
        zones: List[Polygon],
        room_configs: List[Dict],
        polygon: Polygon,
        north_angle: float,
        road_side: int,
        vastu_enabled: bool = True
    ) -> List[Dict]:
        """
        Assign each room type to the most Vastu-compatible zone.

        Uses a greedy algorithm: score every (zone, room) pair, then
        iteratively assign the highest-scoring unmatched pair.

        Args:
            zones: List of Shapely Polygon zones
            room_configs: List of {room_type, min_area, max_area} dicts
            polygon: Full plot polygon (for centroid computation)
            north_angle: North direction in degrees
            road_side: Road side indicator (0=front, 1=right, 2=back, 3=left)
            vastu_enabled: If False, assign rooms in order without scoring

        Returns:
            List of {zone, room_config, direction, centroid} dicts
        """
        plot_center = compute_plot_center(polygon)

        # Compute direction for each zone
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

        if not vastu_enabled:
            # Simple sequential assignment — no Vastu scoring
            return [
                {
                    'zone': zi['zone'],
                    'room_config': rc,
                    'direction': zi['direction'],
                    'centroid': zi['centroid'],
                }
                for zi, rc in zip(zone_info, room_configs)
            ]

        # Build score matrix: scores[zone_idx][room_idx]
        scores = []
        for zi in zone_info:
            row = []
            for rc in room_configs:
                score = VastuSolver._direction_score(
                    rc['room_type'], zi['direction']
                )
                row.append(score)
            scores.append(row)

        # Greedy assignment: pick the highest-scoring unmatched (zone, room) pair
        assigned_zones = set()
        assigned_rooms = set()
        assignments = [None] * len(zone_info)

        num_assignments = min(len(zone_info), len(room_configs))

        for _ in range(num_assignments):
            best_score = -1
            best_zi = -1
            best_ri = -1

            for zi in range(len(zone_info)):
                if zi in assigned_zones:
                    continue
                for ri in range(len(room_configs)):
                    if ri in assigned_rooms:
                        continue
                    if scores[zi][ri] > best_score:
                        best_score = scores[zi][ri]
                        best_zi = zi
                        best_ri = ri

            if best_zi == -1:
                break

            assignments[best_zi] = {
                'zone': zone_info[best_zi]['zone'],
                'room_config': room_configs[best_ri],
                'direction': zone_info[best_zi]['direction'],
                'centroid': zone_info[best_zi]['centroid'],
            }
            assigned_zones.add(best_zi)
            assigned_rooms.add(best_ri)

        return [a for a in assignments if a is not None]

    @staticmethod
    def _direction_score(room_type: str, direction: str) -> int:
        """
        Score a (room_type, direction) pair based on Vastu preferences.

        Args:
            room_type: e.g. 'kitchen'
            direction: e.g. 'SE'

        Returns:
            Score: 4 = primary, 3 = secondary, 2 = flexible, 1 = neutral, 0 = bad
        """
        preferred = VASTU_PREFERRED.get(room_type, [])
        if not preferred:
            return 1  # Unknown room type — neutral

        if direction == preferred[0]:
            return 4  # Best match
        elif direction in preferred[1:2]:
            return 3  # Good match
        elif direction in preferred[2:]:
            return 2  # Acceptable
        else:
            return 1  # Not preferred but not penalized