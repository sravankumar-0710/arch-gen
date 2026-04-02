# filepath: backend/engine/rule_based/door_window_rules.py
# Purpose: Validates and generates door and window placements.
# India NBC 2016, Part 3, Section 4.10.

import math
from typing import List, Dict


class DoorWindowRules:
    """Rules for door and window placement."""

    @staticmethod
    def generate_doors(walls: List[Dict], rooms: List[Dict]) -> List[Dict]:
        """
        Place doors at the midpoints of partition walls between rooms.
        
        Args:
            walls: List of wall segments
            rooms: List of room objects
            
        Returns:
            List of door objects
        """
        doors = []
        door_id = 1
        for wall in walls:
            if wall['wall_type'] == 'partition' and len(wall['rooms']) == 2:
                start, end = wall['start'], wall['end']
                doors.append({
                    'id': door_id,
                    'position': [
                        (start[0] + end[0]) / 2,
                        (start[1] + end[1]) / 2,
                    ],
                    'rooms': wall['rooms'],
                    'width': 3.0,
                })
                door_id += 1
        return doors

    @staticmethod
    def generate_windows(walls: List[Dict], rooms: List[Dict]) -> List[Dict]:
        """
        Place windows on exterior (load-bearing) walls.
        
        Args:
            walls: List of wall segments
            rooms: List of room objects
            
        Returns:
            List of window objects
        """
        windows = []
        window_id = 1
        for wall in walls:
            if wall['wall_type'] == 'load_bearing':
                start, end = wall['start'], wall['end']
                length = math.sqrt(
                    (end[0] - start[0]) ** 2 + (end[1] - start[1]) ** 2
                )
                if length > 5:
                    # Place two windows at 1/3 and 2/3 of the wall length
                    for pos in [0.33, 0.67]:
                        windows.append({
                            'id': window_id,
                            'position': [
                                start[0] + (end[0] - start[0]) * pos,
                                start[1] + (end[1] - start[1]) * pos,
                            ],
                            'size': 3.0,
                        })
                        window_id += 1
        return windows

    @staticmethod
    def validate_entrance(rooms: List[Dict], road_side: int) -> bool:
        """
        Verify that the entrance door is on the road-facing wall.
        (Simplified check for MVP)
        """
        # TODO: Implement complex check for entrance placement
        return True
