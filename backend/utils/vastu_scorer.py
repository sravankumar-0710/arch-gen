# filepath: backend/utils/vastu_scorer.py
# Purpose: Vastu Shastra compliance scoring for layouts

from typing import List, Dict, Tuple


# Vastu direction preferences for room types
VASTU_DIRECTIONS = {
    'kitchen': {
        'primary': ['SE'],      # +20 points
        'secondary': ['NW'],    # +15 points
        'flexible': ['E']       # +10 points
    },
    'master_bedroom': {
        'primary': ['SW'],
        'secondary': ['S', 'W'],
        'flexible': ['SE']
    },
    'bedroom': {
        'primary': ['S', 'SW', 'W'],
        'secondary': ['SE'],
        'flexible': ['NW']
    },
    'bathroom': {
        'primary': ['NW', 'W'],
        'secondary': ['S', 'SE'],
        'flexible': ['E']
    },
    'living_room': {
        'primary': ['N', 'NE', 'E'],
        'secondary': ['SE'],
        'flexible': ['S']
    },
    'dining_room': {
        'primary': ['W', 'E'],
        'secondary': ['N', 'S'],
        'flexible': ['NE', 'SW']
    },
    'pooja': {
        'primary': ['NE'],
        'secondary': ['N', 'E'],
        'flexible': ['NW']
    },
    'entrance': {
        'primary': ['N', 'NE', 'E'],
        'secondary': ['S'],
        'flexible': ['SE']
    },
    'balcony': {
        'primary': ['E', 'W'],
        'secondary': ['N', 'S'],
        'flexible': ['NE', 'SE']
    },
    'garage': {
        'primary': ['W'],
        'secondary': ['N', 'S'],
        'flexible': ['NW', 'SW']
    },
    'store': {
        'primary': ['NW', 'W'],
        'secondary': ['SW'],
        'flexible': ['N']
    }
}

# Penalty factors for certain constraints
CONSTRAINT_BONUSES = {
    'window_facing_north': 5,      # Rooms with north-facing windows get bonus
    'adjacent_to_entrance': 5,     # Rooms adjacent to entrance
    'corner_room': 3,              # Corner room gets minor bonus
    'proper_ventilation': 5        # Proper ventilation paths
}


class VastuScorer:
    """Score layouts based on Vastu Shastra principles."""

    @staticmethod
    def score_layout(rooms: List[Dict], requirements: Dict = None) -> float:
        """
        Calculate Vastu compliance score (0-100) for a layout.

        Args:
            rooms: List of {room_type, direction, area, centroid} dicts
            requirements: Optional requirements dict with Vastu preferences

        Returns:
            Float score from 0-100
        """
        if not rooms:
            return 0.0

        total_score = 0.0
        max_possible_score = 0.0

        for room in rooms:
            room_type = room.get('room_type', 'bedroom')
            direction = room.get('direction', 'CENTER')

            # Get Vastu preferences for this room type
            if room_type not in VASTU_DIRECTIONS:
                # Unknown room type - give neutral score
                room_score = 10
                max_score = 20
            else:
                room_prefs = VASTU_DIRECTIONS[room_type]

                # Calculate score based on direction match
                if direction in room_prefs.get('primary', []):
                    room_score = 20
                elif direction in room_prefs.get('secondary', []):
                    room_score = 15
                elif direction in room_prefs.get('flexible', []):
                    room_score = 10
                else:
                    room_score = 0

                max_score = 20

            total_score += room_score
            max_possible_score += max_score

        # Normalize to 0-100 scale
        if max_possible_score > 0:
            score = (total_score / max_possible_score) * 100
        else:
            score = 50.0

        # Apply bonuses for additional constraints
        score += VastuScorer._calculate_constraint_bonuses(rooms, requirements)

        # Cap at 100
        return min(100.0, max(0.0, score))

    @staticmethod
    def _calculate_constraint_bonuses(rooms: List[Dict], requirements: Dict = None) -> float:
        """
        Calculate bonus points for satisfying additional constraints.

        Args:
            rooms: List of room dicts
            requirements: Requirements dict with constraints

        Returns:
            Float bonus points (capped at reasonable max)
        """
        bonus = 0.0

        if not requirements:
            return bonus

        # Check for proper layout flow
        if VastuScorer._has_proper_entrance_flow(rooms):
            bonus += 5

        # Check for good ventilation (adjacent rooms with different exposures)
        if VastuScorer._has_good_ventilation(rooms):
            bonus += 5

        # Check for privacy (bedrooms away from common areas)
        if VastuScorer._has_privacy_zones(rooms):
            bonus += 5

        return bonus

    @staticmethod
    def _has_proper_entrance_flow(rooms: List[Dict]) -> bool:
        """Check if entrance area has good flow (not directly into private areas)."""
        entrance_rooms = [r for r in rooms if r.get('room_type') == 'entrance']
        living_rooms = [r for r in rooms if r.get('room_type') in ['living_room', 'dining_room']]

        # Good if entrance exists and living rooms are near entrance
        return len(entrance_rooms) > 0 and len(living_rooms) > 0

    @staticmethod
    def _has_good_ventilation(rooms: List[Dict]) -> bool:
        """Check if rooms have good ventilation (exposure to different sides)."""
        directions = [r.get('direction', 'CENTER') for r in rooms]

        # Good if we have rooms facing at least 3 different directions
        unique_directions = set(d for d in directions if d != 'CENTER')
        return len(unique_directions) >= 3

    @staticmethod
    def _has_privacy_zones(rooms: List[Dict]) -> bool:
        """Check if private spaces (bedrooms) are separated from public spaces."""
        private_room_types = ['bedroom', 'master_bedroom', 'bathroom', 'pooja']
        public_room_types = ['living_room', 'dining_room', 'entrance']

        private_rooms = [r for r in rooms if r.get('room_type') in private_room_types]
        public_rooms = [r for r in rooms if r.get('room_type') in public_room_types]

        # Good if we have both and they're not all in same location
        return len(private_rooms) > 0 and len(public_rooms) > 0

    @staticmethod
    def get_best_direction(room_type: str) -> str:
        """
        Get the primary (best) direction for a room type.

        Args:
            room_type: Type of room

        Returns:
            Primary direction string
        """
        if room_type not in VASTU_DIRECTIONS:
            return 'N'

        directions = VASTU_DIRECTIONS[room_type].get('primary', [])
        return directions[0] if directions else 'N'

    @staticmethod
    def get_all_good_directions(room_type: str) -> List[str]:
        """
        Get all acceptable directions for a room type.

        Args:
            room_type: Type of room

        Returns:
            List of acceptable direction strings
        """
        if room_type not in VASTU_DIRECTIONS:
            return ['N', 'S', 'E', 'W']

        prefs = VASTU_DIRECTIONS[room_type]
        return prefs.get('primary', []) + prefs.get('secondary', []) + prefs.get('flexible', [])

    @staticmethod
    def score_room_placement(room_type: str, direction: str) -> float:
        """
        Score a single room placement.

        Args:
            room_type: Type of room
            direction: Cardinal direction

        Returns:
            Score 0-20 for this room
        """
        if room_type not in VASTU_DIRECTIONS:
            return 10

        prefs = VASTU_DIRECTIONS[room_type]

        if direction in prefs.get('primary', []):
            return 20.0
        elif direction in prefs.get('secondary', []):
            return 15.0
        elif direction in prefs.get('flexible', []):
            return 10.0
        else:
            return 0.0

    @staticmethod
    def get_score_explanation(rooms: List[Dict]) -> Dict:
        """
        Get detailed explanation of Vastu score.

        Args:
            rooms: List of room dicts with room_type and direction

        Returns:
            Dict with breakdown of scores
        """
        breakdown = {
            'total_rooms': len(rooms),
            'rooms': [],
            'score_details': {}
        }

        for room in rooms:
            room_type = room.get('room_type', 'bedroom')
            direction = room.get('direction', 'CENTER')

            score = VastuScorer.score_room_placement(room_type, direction)

            breakdown['rooms'].append({
                'room_type': room_type,
                'direction': direction,
                'score': score,
                'ideal_direction': VastuScorer.get_best_direction(room_type)
            })

        breakdown['overall_score'] = VastuScorer.score_layout(rooms)

        return breakdown
