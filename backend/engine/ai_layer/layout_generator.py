# filepath: backend/engine/ai_layer/layout_generator.py
# Purpose: Calls Gemini API to generate floor plan room coordinates.
# Parses the JSON response into Shapely polygons for the layout pipeline.
# Falls back gracefully if Gemini is unavailable or returns invalid JSON.

import json
import logging
import os
from typing import Dict, List, Optional, Tuple

import requests
from shapely.geometry import Polygon, box

from engine.ai_layer.prompt_builder import PromptBuilder

logger = logging.getLogger(__name__)

GEMINI_API_URL = (
    "https://generativelanguage.googleapis.com/v1beta/models/"
    "gemini-2.0-flash:generateContent"
)

MAX_RETRIES = 2


class AILayoutGenerator:
    """
    Generates floor plan layouts using Gemini 2.0 Flash.
    Converts Gemini's room rectangle JSON into Shapely polygons
    compatible with the existing layout pipeline.
    """

    @staticmethod
    def generate_all_variants(
        plot_polygon: Polygon,
        room_configs: List[Dict],
        land_data: Dict,
        requirements: Dict,
    ) -> List[Tuple[str, List[Polygon]]]:
        """
        Generate all 3 layout variants using Gemini.
        Returns same format as RoomPlacer.decompose_all_strategies:
        List of (strategy_name, zones) tuples.

        Args:
            plot_polygon: Shapely Polygon of the plot
            room_configs: List of {room_type, min_area, max_area}
            land_data: {northAngle, roadSide, unit, ...}
            requirements: {vastuEnabled, customPrompt, ...}

        Returns:
            List of (name, zones) tuples — each with len(zones) == len(room_configs)
        """
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key:
            logger.warning("GEMINI_API_KEY not set — AI layout generation unavailable")
            return []

        minx, miny, maxx, maxy = plot_polygon.bounds
        plot_width    = maxx - minx
        plot_height   = maxy - miny
        plot_area     = plot_polygon.area
        north_angle   = land_data.get("northAngle", 0)
        road_side     = land_data.get("roadSide", 0)
        vastu_enabled = requirements.get("vastuEnabled", True)

        # Pull custom prompt from requirements — empty string if not provided
        custom_prompt = requirements.get("customPrompt", "") or ""

        strategy_names = [
            "Public-Private Split",
            "Central Corridor",
            "Quadrant Zoning",
        ]

        results = []

        for i, strategy_name in enumerate(strategy_names):
            prompt = PromptBuilder.build_layout_prompt(
                plot_width=plot_width,
                plot_height=plot_height,
                plot_area=plot_area,
                room_configs=room_configs,
                north_angle=north_angle,
                road_side=road_side,
                vastu_enabled=vastu_enabled,
                strategy=strategy_name,
                strategy_index=i,
                custom_prompt=custom_prompt if custom_prompt.strip() else None,
            )

            rooms_json = AILayoutGenerator._call_gemini(prompt, api_key)
            if rooms_json is None:
                logger.warning(f"Gemini returned no valid response for '{strategy_name}'")
                continue

            zones = AILayoutGenerator._json_to_polygons(
                rooms_json, plot_polygon, minx, miny, room_configs
            )

            if len(zones) < len(room_configs):
                logger.warning(
                    f"Strategy '{strategy_name}' produced {len(zones)} zones "
                    f"but {len(room_configs)} needed — skipping"
                )
                continue

            results.append((strategy_name, zones))

        return results

    @staticmethod
    def _call_gemini(prompt: str, api_key: str) -> Optional[List[Dict]]:
        """
        Send prompt to Gemini API and return parsed JSON list.

        Args:
            prompt: Complete prompt string
            api_key: Gemini API key

        Returns:
            Parsed list of room dicts, or None on failure
        """
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.8,
                "maxOutputTokens": 2048,
            },
        }

        for attempt in range(MAX_RETRIES + 1):
            try:
                response = requests.post(
                    f"{GEMINI_API_URL}?key={api_key}",
                    json=payload,
                    timeout=30,
                )

                if response.status_code != 200:
                    logger.error(f"Gemini API error {response.status_code}: {response.text[:200]}")
                    return None

                data = response.json()
                text = (
                    data.get("candidates", [{}])[0]
                    .get("content", {})
                    .get("parts", [{}])[0]
                    .get("text", "")
                )

                if not text:
                    logger.warning("Gemini returned empty text")
                    return None

                parsed = AILayoutGenerator._parse_json_response(text)
                if parsed is not None:
                    return parsed

                logger.warning(f"Attempt {attempt + 1}: JSON parse failed, retrying...")

            except requests.Timeout:
                logger.error("Gemini API request timed out")
                return None
            except Exception as e:
                logger.error(f"Gemini API call failed: {e}")
                return None

        return None

    @staticmethod
    def _parse_json_response(text: str) -> Optional[List[Dict]]:
        """
        Extract and parse a JSON array from Gemini's text response.
        Handles markdown code fences gracefully.

        Args:
            text: Raw text from Gemini

        Returns:
            Parsed list of room dicts, or None if parsing fails
        """
        cleaned = text.strip()
        if cleaned.startswith("```"):
            lines  = cleaned.split("\n")
            inner  = [l for l in lines if not l.startswith("```")]
            cleaned = "\n".join(inner).strip()

        start = cleaned.find("[")
        end   = cleaned.rfind("]")
        if start == -1 or end == -1:
            logger.warning("No JSON array found in Gemini response")
            return None

        try:
            data = json.loads(cleaned[start : end + 1])
        except json.JSONDecodeError as e:
            logger.warning(f"JSON decode error: {e}")
            return None

        if not isinstance(data, list):
            return None

        required_fields = {"room_type", "x", "y", "width", "height"}
        valid_rooms = []
        for room in data:
            if not isinstance(room, dict):
                continue
            if not required_fields.issubset(room.keys()):
                logger.warning(f"Room missing required fields: {room}")
                continue
            try:
                room["x"]         = float(room["x"])
                room["y"]         = float(room["y"])
                room["width"]     = float(room["width"])
                room["height"]    = float(room["height"])
                room["room_type"] = str(room["room_type"])
            except (ValueError, TypeError):
                continue
            valid_rooms.append(room)

        return valid_rooms if valid_rooms else None

    @staticmethod
    def _json_to_polygons(
        rooms_json: List[Dict],
        plot_polygon: Polygon,
        plot_minx: float,
        plot_miny: float,
        room_configs: List[Dict],
    ) -> List[Polygon]:
        """
        Convert Gemini's room rectangle list to Shapely polygons.
        Clips each room against the actual plot polygon and reorders
        output to match room_configs order.

        Args:
            rooms_json: List of {room_type, x, y, width, height} from Gemini
            plot_polygon: Actual plot polygon for clipping
            plot_minx: Plot bounding box min x
            plot_miny: Plot bounding box min y
            room_configs: Original room config list (defines expected order)

        Returns:
            List of Shapely Polygons in room_configs order
        """
        type_to_polygons: Dict[str, List[Polygon]] = {}

        for room in rooms_json:
            rtype = room["room_type"]
            rx    = plot_minx + room["x"]
            ry    = plot_miny + room["y"]
            rw    = room["width"]
            rh    = room["height"]

            if rw < 4.0 or rh < 4.0:
                logger.warning(f"Skipping degenerate room {rtype}: {rw:.1f}x{rh:.1f}")
                continue

            clipped = plot_polygon.intersection(box(rx, ry, rx + rw, ry + rh))

            if clipped.is_empty or clipped.area < 20.0:
                logger.warning(f"Room {rtype} clipped to nothing or too small")
                continue

            if hasattr(clipped, "geoms"):
                clipped = max(clipped.geoms, key=lambda g: g.area)

            if not isinstance(clipped, Polygon):
                continue

            if rtype not in type_to_polygons:
                type_to_polygons[rtype] = []
            type_to_polygons[rtype].append(clipped)

        # Reorder to match room_configs order
        ordered_zones = []
        type_usage: Dict[str, int] = {}

        for rc in room_configs:
            rtype = rc["room_type"]
            idx   = type_usage.get(rtype, 0)
            polys = type_to_polygons.get(rtype, [])

            if idx < len(polys):
                ordered_zones.append(polys[idx])
                type_usage[rtype] = idx + 1
            else:
                logger.warning(f"Gemini did not generate '{rtype}' (need index {idx})")

        return ordered_zones