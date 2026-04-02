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
        num_rooms: int,
        room_configs: List[dict] = None,
    ) -> List[Tuple[str, List[Polygon]]]:
        """
        Run all decomposition strategies and return each as a named list of zones.

        Args:
            polygon: Plot polygon in any coordinate space
            num_rooms: Number of rooms needed
            room_configs: Optional list of {room_type, min_area, max_area} — used for
                          area-weighted splits so bathrooms don't get bedroom-sized zones.

        Returns:
            List of (strategy_name, zones) tuples with len(zones) >= num_rooms
        """
        # Request extra zones per strategy to absorb clipping losses on irregular polygons.
        # Each strategy uses a different seed so they produce meaningfully different layouts.
        strategies = [
            ("Courtyard",
             RoomPlacer._bsp_decompose(polygon, num_rooms, bias_mode="balanced",
                                       seed=1, room_configs=room_configs)),
            ("Default (Vastu-Optimized)",
             RoomPlacer._bsp_decompose(polygon, num_rooms, bias_mode="biased",
                                       seed=2, room_configs=room_configs)),
            ("Compact Layout",
             RoomPlacer._bsp_decompose(polygon, num_rooms, bias_mode="clustered",
                                       seed=3, room_configs=room_configs)),
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
        room_configs: List[dict] = None,
    ) -> List[Polygon]:
        """
        Binary Space Partitioning decomposition with optional area-weighted splits.

        When room_configs is provided, split ratios are weighted by cumulative min_area
        so large rooms (living room, master bedroom) get proportionally larger zones
        and small rooms (bathroom) don't end up bedroom-sized.

        Args:
            polygon: Plot polygon
            num_rooms: Target number of zones
            bias_mode: "balanced" | "biased" | "clustered"
            seed: Random seed for reproducibility
            room_configs: Optional [{room_type, min_area, max_area}] for area weighting

        Returns:
            List of Shapely Polygon zones sorted largest first
        """
        rng = random.Random(seed)
        minx, miny, maxx, maxy = polygon.bounds

        plot_width  = maxx - minx
        plot_height = maxy - miny
        plot_area   = polygon.area

        # Request extra leaf cells to absorb clipping losses on irregular polygons.
        target_leaves = num_rooms + 3

        # Lower thresholds so irregular-polygon slivers don't over-reject.
        min_zone_area = (plot_area / target_leaves) * 0.20
        min_dim = min(plot_width, plot_height) * 0.06

        # Build area weights: proportional target sizes per leaf based on room min_area.
        # This makes bathrooms small and living rooms large before Vastu assignment.
        area_weights = None
        if room_configs:
            avg = sum(r.get("min_area", 100) for r in room_configs) / len(room_configs)
            # Sort descending — BSP produces largest zones first
            weights = sorted(
                [r.get("min_area", 100) for r in room_configs] + [avg] * 3,
                reverse=True,
            )
            total_w = sum(weights)
            area_weights = [w / total_w for w in weights]

        root   = box(minx, miny, maxx, maxy)
        leaves = RoomPlacer._bsp_split(root, target_leaves, bias_mode, rng, min_dim,
                                       area_weights=area_weights)

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
        area_weights: List[float] = None,
        weight_offset: int = 0,
    ) -> List[Polygon]:
        """
        Recursively split a rectangle into num_leaves sub-rectangles.

        Args:
            rect: Current rectangle
            num_leaves: Target leaf count from this node
            bias_mode: Split ratio strategy
            rng: Seeded random instance
            min_dim: Never produce a slice thinner than this
            area_weights: Optional proportional target sizes per leaf (sums to 1.0)
            weight_offset: Index offset into area_weights for this subtree

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

        # Use area-weighted ratio if weights provided, otherwise use bias_mode
        if area_weights and len(area_weights) >= weight_offset + num_leaves:
            left_weight  = sum(area_weights[weight_offset : weight_offset + left_count])
            right_weight = sum(area_weights[weight_offset + left_count : weight_offset + num_leaves])
            total_weight = left_weight + right_weight
            ratio = left_weight / total_weight if total_weight > 0 else 0.5
            # Clamp to reasonable range to prevent degenerate splits
            ratio = max(0.25, min(0.75, ratio))
        else:
            ratio = RoomPlacer._split_ratio(bias_mode, left_count, right_count, rng)

        if height >= width:
            # Cut horizontally — top and bottom
            split_y = miny + height * ratio
            split_y = max(miny + min_dim, min(split_y, maxy - min_dim))
            top    = box(minx, split_y, maxx, maxy)
            bottom = box(minx, miny,    maxx, split_y)
            return (
                RoomPlacer._bsp_split(top,    left_count,  bias_mode, rng, min_dim,
                                      area_weights, weight_offset) +
                RoomPlacer._bsp_split(bottom, right_count, bias_mode, rng, min_dim,
                                      area_weights, weight_offset + left_count)
            )
        else:
            # Cut vertically — left and right
            split_x = minx + width * ratio
            split_x = max(minx + min_dim, min(split_x, maxx - min_dim))
            left  = box(minx,    miny, split_x, maxy)
            right = box(split_x, miny, maxx,    maxy)
            return (
                RoomPlacer._bsp_split(left,  left_count,  bias_mode, rng, min_dim,
                                      area_weights, weight_offset) +
                RoomPlacer._bsp_split(right, right_count, bias_mode, rng, min_dim,
                                      area_weights, weight_offset + left_count)
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