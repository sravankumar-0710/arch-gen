# filepath: backend/engine/geometry/room_placer.py
# Purpose: Decomposes a plot polygon into room zones using multiple spatial strategies.
# Each strategy produces a genuinely different arrangement of zones.
# All geometry via Shapely — never raw polygon math.

import math
from typing import List, Tuple
from shapely.geometry import Polygon, MultiPolygon, box


class RoomPlacer:
    """
    Decomposes a plot polygon into spatial zones for room placement.
    Provides three distinct strategies: horizontal bands, vertical bands, and L-split.
    """

    @staticmethod
    def decompose_all_strategies(polygon: Polygon, num_rooms: int) -> List[Tuple[str, List[Polygon]]]:
        """
        Run all decomposition strategies and return each as a named list of zones.

        Args:
            polygon: Plot polygon in real-world coordinates
            num_rooms: Number of rooms needed

        Returns:
            List of (strategy_name, zones) tuples — each with enough zones for num_rooms
        """
        strategies = [
            ("Default (Vastu-Optimized)", RoomPlacer.decompose_horizontal(polygon, num_rooms)),
            ("Compact Layout",            RoomPlacer.decompose_vertical(polygon, num_rooms)),
            ("Privacy-Focused",           RoomPlacer.decompose_l_split(polygon, num_rooms)),
            ("Open Plan",                 RoomPlacer.decompose_grid(polygon, num_rooms, split_bias=0.4)),
            ("Split Level",               RoomPlacer.decompose_grid(polygon, num_rooms, split_bias=0.6)),
        ]

        # Filter out strategies that didn't produce enough zones
        valid = [(name, zones) for name, zones in strategies if len(zones) >= num_rooms]
        return valid

    @staticmethod
    def decompose_horizontal(polygon: Polygon, num_rooms: int) -> List[Polygon]:
        """
        Slice the polygon into horizontal bands (cuts along Y axis).
        Produces a top-to-bottom room arrangement — bedrooms at top, service at bottom.

        Args:
            polygon: Plot polygon
            num_rooms: Number of zones needed

        Returns:
            List of Shapely Polygon zones
        """
        minx, miny, maxx, maxy = polygon.bounds
        height = maxy - miny
        weights = RoomPlacer._height_weights(num_rooms)
        zones = []
        y = miny

        for w in weights:
            band_h = height * w
            band = box(minx, y, maxx, y + band_h)
            zone = polygon.intersection(band)
            y += band_h

            zone = RoomPlacer._clean_zone(zone)
            if zone is not None:
                zones.append(zone)

        return zones

    @staticmethod
    def decompose_vertical(polygon: Polygon, num_rooms: int) -> List[Polygon]:
        """
        Slice the polygon into vertical bands (cuts along X axis).
        Produces a left-to-right room arrangement.

        Args:
            polygon: Plot polygon
            num_rooms: Number of zones needed

        Returns:
            List of Shapely Polygon zones
        """
        minx, miny, maxx, maxy = polygon.bounds
        width = maxx - minx
        weights = RoomPlacer._width_weights(num_rooms)
        zones = []
        x = minx

        for w in weights:
            band_w = width * w
            band = box(x, miny, x + band_w, maxy)
            zone = polygon.intersection(band)
            x += band_w

            zone = RoomPlacer._clean_zone(zone)
            if zone is not None:
                zones.append(zone)

        return zones

    @staticmethod
    def decompose_l_split(polygon: Polygon, num_rooms: int) -> List[Polygon]:
        """
        Split the polygon into an L-shaped arrangement with unequal proportions.
        Top half split at 55%, bottom third split at 35%/65% — maximally different from grid.

        Args:
            polygon: Plot polygon
            num_rooms: Number of zones needed

        Returns:
            List of Shapely Polygon zones
        """
        minx, miny, maxx, maxy = polygon.bounds
        width = maxx - minx
        height = maxy - miny

        # Horizontal cut at 45% from bottom
        h_cut = miny + height * 0.45

        # Top section: split at 55% horizontally
        top_zone = polygon.intersection(box(minx, h_cut, maxx, maxy))
        top_mid_x = minx + width * 0.55
        top_left  = RoomPlacer._clean_zone(top_zone.intersection(box(minx, h_cut, top_mid_x, maxy)))
        top_right = RoomPlacer._clean_zone(top_zone.intersection(box(top_mid_x, h_cut, maxx, maxy)))

        # Bottom section: split into thirds at 35% and 65%
        bot_zone = polygon.intersection(box(minx, miny, maxx, h_cut))
        b1x = minx + width * 0.35
        b2x = minx + width * 0.65
        bot_left   = RoomPlacer._clean_zone(bot_zone.intersection(box(minx, miny, b1x,  h_cut)))
        bot_center = RoomPlacer._clean_zone(bot_zone.intersection(box(b1x,  miny, b2x,  h_cut)))
        bot_right  = RoomPlacer._clean_zone(bot_zone.intersection(box(b2x,  miny, maxx, h_cut)))

        # Return non-None zones sorted by area descending so largest zones come first
        candidates = [top_left, top_right, bot_left, bot_center, bot_right]
        zones = [z for z in candidates if z is not None]
        zones.sort(key=lambda z: z.area, reverse=True)
        return zones

    @staticmethod
    def decompose_grid(polygon: Polygon, num_rooms: int, split_bias: float = 0.5) -> List[Polygon]:
        """
        Grid-based decomposition with a configurable split bias.
        split_bias < 0.5 skews cells leftward/upward; > 0.5 skews rightward/downward.

        Args:
            polygon: Plot polygon
            num_rooms: Number of zones needed
            split_bias: Float 0.3–0.7 controlling asymmetry

        Returns:
            List of Shapely Polygon zones
        """
        minx, miny, maxx, maxy = polygon.bounds
        cols = math.ceil(math.sqrt(num_rooms))
        rows = math.ceil(num_rooms / cols)

        # Apply bias to first column/row width
        col_widths = RoomPlacer._biased_splits(maxx - minx, cols, split_bias)
        row_heights = RoomPlacer._biased_splits(maxy - miny, rows, split_bias)

        zones = []
        y = miny
        for rh in row_heights:
            x = minx
            for cw in col_widths:
                cell = box(x, y, x + cw, y + rh)
                zone = polygon.intersection(cell)
                z = RoomPlacer._clean_zone(zone)
                if z is not None:
                    zones.append(z)
                x += cw
            y += rh

        return zones

    # ─────────────────────────────────────────────────────────────
    # Internal helpers
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    def _clean_zone(zone) -> Polygon | None:
        """
        Normalize a zone geometry: extract largest polygon from MultiPolygon,
        discard degenerate shapes.

        Args:
            zone: Shapely geometry from intersection

        Returns:
            Shapely Polygon or None if zone is too small
        """
        if zone is None or zone.is_empty:
            return None
        if isinstance(zone, MultiPolygon):
            zone = max(zone.geoms, key=lambda g: g.area)
        if not isinstance(zone, Polygon):
            return None
        if zone.area < 0.5:
            return None
        return zone

    @staticmethod
    def _height_weights(n: int) -> List[float]:
        """
        Proportional height weights for horizontal slices.
        Larger rooms (bedrooms, living) get more height than bathrooms.
        """
        presets = {
            1: [1.0],
            2: [0.55, 0.45],
            3: [0.38, 0.35, 0.27],
            4: [0.30, 0.28, 0.25, 0.17],
            5: [0.26, 0.24, 0.22, 0.17, 0.11],
            6: [0.22, 0.20, 0.18, 0.16, 0.14, 0.10],
        }
        if n in presets:
            return presets[n]
        # Geometric decay for n > 6
        base = [1.0 / (1.15 ** i) for i in range(n)]
        total = sum(base)
        return [b / total for b in base]

    @staticmethod
    def _width_weights(n: int) -> List[float]:
        """
        Proportional width weights for vertical slices.
        """
        presets = {
            1: [1.0],
            2: [0.45, 0.55],
            3: [0.30, 0.40, 0.30],
            4: [0.22, 0.30, 0.28, 0.20],
            5: [0.18, 0.24, 0.26, 0.20, 0.12],
            6: [0.15, 0.20, 0.22, 0.20, 0.15, 0.08],
        }
        if n in presets:
            return presets[n]
        base = [1.0 / (1.1 ** i) for i in range(n)]
        total = sum(base)
        return [b / total for b in base]

    @staticmethod
    def _biased_splits(total: float, n: int, bias: float) -> List[float]:
        """
        Split a total length into n segments with a bias applied to first segment.
        bias=0.5 gives equal splits; bias=0.3 shrinks first segment, 0.7 grows it.

        Args:
            total: Total length to split
            n: Number of segments
            bias: Proportion bias for first segment (0.3–0.7)

        Returns:
            List of segment lengths summing to total
        """
        if n == 1:
            return [total]
        first = total * bias
        remaining = total - first
        rest = [remaining / (n - 1)] * (n - 1)
        return [first] + rest