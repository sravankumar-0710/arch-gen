# filepath: backend/engine/geometry/room_placer.py
# Purpose: Decomposes a plot polygon into room zones using Binary Space Partitioning (BSP).
# BSP recursively splits space into pairs, always along the longer axis.
# All thresholds are proportional to plot size — works at any coordinate scale.
# All geometry via Shapely — never raw polygon math.

import random
from typing import List, Tuple, Optional
from shapely.geometry import Polygon, MultiPolygon, box


class RoomPlacer:
    """
    Decomposes a plot polygon into spatial zones using BSP.
    Three strategies vary the split ratio to produce different layouts.
    Thresholds scale with plot size so pixel-space and ft-space both work.
    """

    @staticmethod
    def decompose_all_strategies(
        polygon: Polygon,
        num_rooms: int
    ) -> List[Tuple[str, List[Polygon]]]:
        """
        Run all decomposition strategies and return each as a named list of zones.

        Args:
            polygon: Plot polygon in any coordinate space
            num_rooms: Number of rooms needed

        Returns:
            List of (strategy_name, zones) tuples with len(zones) >= num_rooms
        """
        strategies = [
            ("Courtyard",
             RoomPlacer._bsp_decompose(polygon, num_rooms, bias_mode="balanced",  seed=1)),
            ("Default (Vastu-Optimized)",
             RoomPlacer._bsp_decompose(polygon, num_rooms, bias_mode="biased",    seed=2)),
            ("Compact Layout",
             RoomPlacer._bsp_decompose(polygon, num_rooms, bias_mode="clustered", seed=3)),
        ]
        return [(name, zones) for name, zones in strategies if len(zones) >= num_rooms]

    # ─────────────────────────────────────────────────────────────
    # BSP core
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    def _bsp_decompose(
        polygon: Polygon,
        num_rooms: int,
        bias_mode: str = "balanced",
        seed: int = 0,
    ) -> List[Polygon]:
        """
        Binary Space Partitioning decomposition.

        Derives all thresholds proportionally from the plot so this works
        correctly regardless of whether coordinates are in pixels or feet.

        Args:
            polygon: Plot polygon
            num_rooms: Target number of zones
            bias_mode: "balanced" | "biased" | "clustered"
            seed: Random seed for reproducibility

        Returns:
            List of Shapely Polygon zones sorted largest first
        """
        rng = random.Random(seed)
        minx, miny, maxx, maxy = polygon.bounds

        plot_width  = maxx - minx
        plot_height = maxy - miny
        plot_area   = polygon.area

        # Minimum zone area: 40% of an equal share of the total plot
        # e.g. 5-room plot of 10000 units² → min zone = 10000/5*0.4 = 800 units²
        min_zone_area = (plot_area / num_rooms) * 0.40

        # Minimum dimension: 8% of the shorter plot side
        # e.g. 100-unit wide plot → min dim = 8 units
        min_dim = min(plot_width, plot_height) * 0.08

        root   = box(minx, miny, maxx, maxy)
        leaves = RoomPlacer._bsp_split(root, num_rooms, bias_mode, rng, min_dim)

        zones = []
        for leaf in leaves:
            clipped = polygon.intersection(leaf)
            cleaned = RoomPlacer._clean_zone(clipped, min_zone_area, min_dim)
            if cleaned is not None:
                zones.append(cleaned)

        zones.sort(key=lambda z: z.area, reverse=True)
        return zones

    @staticmethod
    def _bsp_split(
        rect: Polygon,
        num_leaves: int,
        bias_mode: str,
        rng: random.Random,
        min_dim: float,
    ) -> List[Polygon]:
        """
        Recursively split a rectangle into num_leaves sub-rectangles.

        Args:
            rect: Current rectangle
            num_leaves: Target leaf count from this node
            bias_mode: Split ratio strategy
            rng: Seeded random instance
            min_dim: Never produce a slice thinner than this

        Returns:
            List of leaf rectangles
        """
        if num_leaves <= 1:
            return [rect]

        minx, miny, maxx, maxy = rect.bounds
        width  = maxx - minx
        height = maxy - miny

        left_count  = num_leaves // 2
        right_count = num_leaves - left_count
        ratio = RoomPlacer._split_ratio(bias_mode, left_count, right_count, rng)

        if height >= width:
            # Cut horizontally — top and bottom
            split_y = miny + height * ratio
            split_y = max(miny + min_dim, min(split_y, maxy - min_dim))
            top    = box(minx, split_y, maxx, maxy)
            bottom = box(minx, miny,    maxx, split_y)
            return (
                RoomPlacer._bsp_split(top,    left_count,  bias_mode, rng, min_dim) +
                RoomPlacer._bsp_split(bottom, right_count, bias_mode, rng, min_dim)
            )
        else:
            # Cut vertically — left and right
            split_x = minx + width * ratio
            split_x = max(minx + min_dim, min(split_x, maxx - min_dim))
            left  = box(minx,    miny, split_x, maxy)
            right = box(split_x, miny, maxx,    maxy)
            return (
                RoomPlacer._bsp_split(left,  left_count,  bias_mode, rng, min_dim) +
                RoomPlacer._bsp_split(right, right_count, bias_mode, rng, min_dim)
            )

    @staticmethod
    def _split_ratio(
        bias_mode: str,
        left_count: int,
        right_count: int,
        rng: random.Random,
    ) -> float:
        """
        Compute the split ratio (0–1) for the current BSP node.

        Args:
            bias_mode: "balanced" | "biased" | "clustered"
            left_count: Rooms assigned to top/left child
            right_count: Rooms assigned to bottom/right child
            rng: Seeded random instance

        Returns:
            Float split position in (0, 1)
        """
        total = left_count + right_count

        if bias_mode == "balanced":
            base   = left_count / total
            jitter = rng.uniform(-0.08, 0.08)
            return max(0.25, min(0.75, base + jitter))

        elif bias_mode == "biased":
            base      = left_count / total
            stretched = 0.5 + (base - 0.5) * 1.4
            return max(0.35, min(0.65, stretched))

        elif bias_mode == "clustered":
            if left_count <= right_count:
                return rng.uniform(0.30, 0.40)
            else:
                return rng.uniform(0.60, 0.70)

        return left_count / total

    # ─────────────────────────────────────────────────────────────
    # Helpers
    # ─────────────────────────────────────────────────────────────

    @staticmethod
    def _clean_zone(
        zone,
        min_area: float,
        min_dim: float,
    ) -> Optional[Polygon]:
        """
        Normalize zone geometry and reject degenerate shapes.
        Thresholds are passed from the caller so they scale with the plot.

        Args:
            zone: Shapely geometry from intersection
            min_area: Minimum acceptable zone area (proportional to plot)
            min_dim: Minimum acceptable bounding box dimension

        Returns:
            Shapely Polygon or None
        """
        if zone is None or zone.is_empty:
            return None
        if isinstance(zone, MultiPolygon):
            zone = max(zone.geoms, key=lambda g: g.area)
        if not isinstance(zone, Polygon):
            return None
        if zone.area < min_area:
            return None
        minx, miny, maxx, maxy = zone.bounds
        half_min = min_dim * 0.5
        if (maxx - minx) < half_min or (maxy - miny) < half_min:
            return None
        return zone