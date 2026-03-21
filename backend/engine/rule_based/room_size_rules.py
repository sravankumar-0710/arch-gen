# filepath: backend/engine/rule_based/room_size_rules.py
# Purpose: Validates room sizes against India NBC 2016 minimum area requirements.
# All constants cite their source.

from dataclasses import dataclass


@dataclass
class RuleResult:
    """Result of a rule validation check."""
    valid: bool
    message: str = ""


# India NBC 2016, Part 3, Section 4.2 — minimum habitable room areas
# All values in square feet
ROOM_SIZE_RULES = {
    'master_bedroom': {'min': 140, 'max': 400,  'label': 'Master Bedroom'},
    'bedroom':        {'min': 90,  'max': 250,  'label': 'Bedroom'},
    'living_room':    {'min': 120, 'max': 500,  'label': 'Living Room'},
    'dining_room':    {'min': 80,  'max': 250,  'label': 'Dining Room'},
    'kitchen':        {'min': 60,  'max': 200,  'label': 'Kitchen'},
    'bathroom':       {'min': 35,  'max': 100,  'label': 'Bathroom'},
    'balcony':        {'min': 20,  'max': 150,  'label': 'Balcony'},
    'staircase':      {'min': 30,  'max': 120,  'label': 'Staircase'},
    'store':          {'min': 20,  'max': 100,  'label': 'Store Room'},
    'pooja':          {'min': 15,  'max': 80,   'label': 'Pooja Room'},
    'garage':         {'min': 100, 'max': 300,  'label': 'Garage'},
    'entrance':       {'min': 20,  'max': 100,  'label': 'Entrance/Foyer'},
}

DEFAULT_MIN = 50
DEFAULT_MAX = 500


class RoomSizeRules:
    """Validates room sizes against NBC 2016 minimums."""

    @staticmethod
    def validate(room_type: str, area: float) -> RuleResult:
        """
        Validate a room's area against minimum/maximum size rules.

        Args:
            room_type: Type of room (e.g. 'bedroom', 'kitchen')
            area: Room area in square feet

        Returns:
            RuleResult with valid flag and message
        """
        rules = ROOM_SIZE_RULES.get(room_type)
        if not rules:
            # Unknown room type — use defaults
            if area < DEFAULT_MIN:
                return RuleResult(
                    valid=False,
                    message=f"{room_type} area {area:.1f} sqft is below minimum {DEFAULT_MIN} sqft"
                )
            return RuleResult(valid=True)

        label = rules['label']

        if area < rules['min']:
            return RuleResult(
                valid=False,
                message=f"{label} is too small ({area:.1f} sqft, minimum {rules['min']} sqft)"
            )

        if area > rules['max']:
            return RuleResult(
                valid=False,
                message=f"{label} is too large ({area:.1f} sqft, maximum {rules['max']} sqft)"
            )

        return RuleResult(valid=True, message=f"{label} size OK ({area:.1f} sqft)")

    @staticmethod
    def get_min_area(room_type: str) -> float:
        """Return minimum area for a room type."""
        return ROOM_SIZE_RULES.get(room_type, {}).get('min', DEFAULT_MIN)

    @staticmethod
    def get_max_area(room_type: str) -> float:
        """Return maximum area for a room type."""
        return ROOM_SIZE_RULES.get(room_type, {}).get('max', DEFAULT_MAX)