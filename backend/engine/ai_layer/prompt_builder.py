# filepath: backend/engine/ai_layer/prompt_builder.py
# Purpose: Builds structured prompts for Gemini layout generation.
# Embeds real plot dimensions, NBC 2016 room size rules, Vastu constraints,
# and optional user-supplied free-text instructions.

from typing import Dict, List, Optional


# Vastu preferred directions per room type — mirrors vastu_solver.py
VASTU_PREFERRED = {
    'master_bedroom': ['SW', 'S', 'W'],
    'bedroom':        ['S', 'SW', 'W', 'NW'],
    'kitchen':        ['SE', 'NW', 'E'],
    'living_room':    ['N', 'NE', 'E'],
    'dining_room':    ['W', 'E', 'N'],
    'bathroom':       ['NW', 'W', 'N'],
    'staircase':      ['S', 'SW', 'SE'],
    'balcony':        ['N', 'NE', 'E'],
    'pooja':          ['NE', 'N', 'E'],
    'garage':         ['W', 'NW', 'SW'],
    'store':          ['NW', 'W', 'SW'],
    'entrance':       ['N', 'NE', 'E'],
}

# NBC 2016 minimum areas in square feet — mirrors room_size_rules.py
NBC_MIN_AREAS = {
    'master_bedroom': 140,
    'bedroom':        90,
    'living_room':    120,
    'dining_room':    80,
    'kitchen':        60,
    'bathroom':       35,
    'balcony':        20,
    'staircase':      30,
    'store':          20,
    'pooja':          15,
    'garage':         100,
    'entrance':       20,
}


class PromptBuilder:
    """Builds Gemini prompts for floor plan layout generation."""

    @staticmethod
    def build_layout_prompt(
        plot_width: float,
        plot_height: float,
        plot_area: float,
        room_configs: List[Dict],
        north_angle: float,
        road_side: int,
        vastu_enabled: bool,
        strategy: str,
        strategy_index: int,
        custom_prompt: Optional[str] = None,
    ) -> str:
        """
        Build a complete prompt for one layout variant.

        Args:
            plot_width: Plot width in feet
            plot_height: Plot height in feet
            plot_area: Total plot area in square feet
            room_configs: List of {room_type, min_area, max_area} dicts
            north_angle: North direction in degrees (0 = up)
            road_side: 0=north, 1=east, 2=south, 3=west
            vastu_enabled: Whether to apply Vastu constraints
            strategy: Strategy name for this variant
            strategy_index: 0, 1, or 2 — used to request different arrangements
            custom_prompt: Optional free-text instructions from the user

        Returns:
            Complete prompt string ready to send to Gemini
        """
        road_direction = PromptBuilder._road_side_to_direction(road_side)
        room_list      = PromptBuilder._format_room_list(room_configs, vastu_enabled)
        strategy_instr = PromptBuilder._strategy_instruction(strategy_index)
        vastu_section  = PromptBuilder._vastu_section(room_configs) if vastu_enabled else ""
        custom_section = PromptBuilder._custom_prompt_section(custom_prompt)

        prompt = f"""You are an expert Indian residential architect generating a floor plan layout.

## Plot Details
- Width: {plot_width:.1f} ft
- Height: {plot_height:.1f} ft
- Total area: {plot_area:.1f} sq ft
- North direction: {north_angle:.0f} degrees clockwise from top
- Road facing: {road_direction}

## Rooms to Place
{room_list}
{custom_section}
## Layout Strategy
{strategy_instr}

## Hard Constraints (must not be violated)
1. Every room polygon must fit entirely within the plot boundary (0,0) to ({plot_width:.1f},{plot_height:.1f})
2. No two rooms may overlap — they must tile the plot with no gaps larger than 2ft
3. Every room must meet its minimum area requirement listed above
4. RELATIVE SIZING: Living rooms and Bedrooms MUST be significantly larger than Bathrooms and Store rooms. A bathroom should typically be 40-70 sqft, while a Master Bedroom should be 140-200 sqft.
5. No room dimension (width or height) may be less than 7 feet (except bathrooms which can be 5ft min)
6. All coordinates must be positive numbers rounded to 1 decimal place
7. Rooms must together cover at least 85% of total plot area
8. DIVERSITY: Ensure the 3 variants have distinctly different spatial arrangements (e.g., L-shaped, open-plan, clustered).
{vastu_section}
## Output Format
Return ONLY a valid JSON array — no explanation, no markdown, no code fences.

[
  {{
    "room_type": "living_room",
    "x": 0.0,
    "y": 0.0,
    "width": 20.0,
    "height": 15.0
  }}
]

Where x,y is the bottom-left corner, width extends right, height extends up.
Adjacent rooms must share edges exactly. Generate exactly {len(room_configs)} rooms."""

        return prompt

    @staticmethod
    def _custom_prompt_section(custom_prompt: Optional[str]) -> str:
        """
        Build the user instructions section.
        Returns empty string when no custom prompt is provided.

        Args:
            custom_prompt: Raw user input string or None

        Returns:
            Formatted section string ready to embed in the main prompt
        """
        if not custom_prompt or not custom_prompt.strip():
            return ""

        # Sanitize — collapse whitespace, enforce length limit
        cleaned = ' '.join(custom_prompt.strip().split())
        if len(cleaned) > 500:
            cleaned = cleaned[:500] + '...'

        return f"""
## User's Custom Instructions (HIGH PRIORITY)
The user has described specific layout preferences. Follow these as closely as possible
while still satisfying all hard constraints:

"{cleaned}"

"""

    @staticmethod
    def _format_room_list(room_configs: List[Dict], vastu_enabled: bool) -> str:
        """Format room list with min areas and optional Vastu directions."""
        lines = []
        for rc in room_configs:
            rtype    = rc['room_type']
            min_area = NBC_MIN_AREAS.get(rtype, rc.get('min_area', 50))
            label    = rtype.replace('_', ' ').title()
            if vastu_enabled and rtype in VASTU_PREFERRED:
                directions = ', '.join(VASTU_PREFERRED[rtype][:2])
                lines.append(f"- {label}: min {min_area} sqft, preferred direction: {directions}")
            else:
                lines.append(f"- {label}: min {min_area} sqft")
        return '\n'.join(lines)

    @staticmethod
    def _vastu_section(room_configs: List[Dict]) -> str:
        """Build the Vastu constraint section."""
        lines = [
            "## Vastu Shastra Constraints (follow where possible)",
            "Plot compass: North=top, South=bottom, East=right, West=left.",
        ]
        for rc in room_configs:
            rtype = rc['room_type']
            if rtype in VASTU_PREFERRED:
                label = rtype.replace('_', ' ').title()
                lines.append(f"- {label} → ideally in {VASTU_PREFERRED[rtype][0]} zone")
        return '\n'.join(lines) + '\n'

    @staticmethod
    def _strategy_instruction(index: int) -> str:
        """Return a strategy instruction for each of the 3 variants."""
        strategies = [
            ("Public-Private Split: Social spaces (living, dining) near road/entrance. "
             "Private spaces (bedrooms) at the back. Service (kitchen, bathrooms) as buffer."),
            ("Central Corridor: Rooms along both sides of a central spine. "
             "Living and master bedroom on opposite ends. Bedrooms clustered on one side."),
            ("Quadrant Zoning: Four quadrants — sleeping zone, living zone, "
             "service zone, and transition zone. Most compact and efficient."),
        ]
        return strategies[min(index, len(strategies) - 1)]

    @staticmethod
    def _road_side_to_direction(road_side: int) -> str:
        """Convert road_side integer to compass direction string."""
        return {0: 'North', 1: 'East', 2: 'South', 3: 'West'}.get(road_side, 'North')