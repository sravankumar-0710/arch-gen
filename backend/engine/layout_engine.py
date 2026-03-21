# filepath: backend/engine/layout_engine.py
# Purpose: Entry point for the layout generation pipeline.
# All external callers (layout_service.py) must go through this module only.
# Never call engine sub-modules directly from outside the engine.

from typing import Dict, List, Tuple
from shapely.geometry import Polygon
from dataclasses import dataclass, field

from engine.geometry.room_placer import RoomPlacer
from engine.rule_based.room_size_rules import RoomSizeRules
from engine.rule_based.adjacency_rules import AdjacencyRules
from engine.constraint_solver.vastu_solver import VastuSolver
from engine.constraint_solver.orientation_solver import OrientationSolver


@dataclass
class EngineResult:
    """Standard result object returned by all engine functions."""
    success: bool
    data: dict | None
    warnings: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)


class LayoutEngine:
    """
    Main layout generation orchestrator.
    Coordinates geometry, rules, and constraint solvers to produce layout variants.
    """

    @staticmethod
    def generate(
        polygon: Polygon,
        room_configs: List[Dict],
        land_data: Dict,
        requirements: Dict
    ) -> EngineResult:
        """
        Generate multiple layout variants for a given plot and room requirements.

        Pipeline:
            1. Decompose plot into spatial zones (3 strategies)
            2. Assign rooms to zones using Vastu direction matching
            3. Validate placements against building rules
            4. Apply constraint solver corrections
            5. Return ranked variants

        Args:
            polygon: Shapely Polygon in real-world coordinates
            room_configs: List of {room_type, min_area, max_area} dicts
            land_data: {northAngle, roadSide, unit, ...}
            requirements: {vastuEnabled, mode, floors, ...}

        Returns:
            EngineResult with data={'variants': [...]} or errors
        """
        warnings = []
        errors = []

        if polygon.area < 10:
            return EngineResult(
                success=False,
                data=None,
                errors=["Plot area too small for layout generation"]
            )

        if not room_configs:
            return EngineResult(
                success=False,
                data=None,
                errors=["No room configurations provided"]
            )

        north_angle = land_data.get('northAngle', 0)
        road_side = land_data.get('roadSide', 0)
        vastu_enabled = requirements.get('vastuEnabled', True)

        # Step 1: Generate zone sets using 3 spatial strategies
        zone_sets = RoomPlacer.decompose_all_strategies(polygon, len(room_configs))

        if not zone_sets:
            return EngineResult(
                success=False,
                data=None,
                errors=["Could not decompose plot into zones — plot may be too small or irregular"]
            )

        # Step 2: Build variants from each zone set
        variants = []
        strategy_names = [
            "Default (Vastu-Optimized)",
            "Compact Layout",
            "Privacy-Focused",
            "Open Plan",
            "Split Level",
        ]

        for i, (strategy_name, zones) in enumerate(zip(strategy_names, zone_sets)):
            if len(zones) < len(room_configs):
                warnings.append(f"Strategy '{strategy_name}' produced fewer zones than rooms — skipping")
                continue

            # Step 3: Assign rooms to zones using Vastu direction matching
            assignments = VastuSolver.assign_rooms_to_zones(
                zones[:len(room_configs)],
                room_configs,
                polygon,
                north_angle,
                road_side,
                vastu_enabled
            )

            # Step 4: Validate each assignment against room size rules
            variant_warnings = []
            for a in assignments:
                size_result = RoomSizeRules.validate(a['room_config']['room_type'], a['zone'].area)
                if not size_result.valid:
                    variant_warnings.append(size_result.message)

            # Step 5: Check adjacency rules
            adjacency_result = AdjacencyRules.validate(assignments)
            if not adjacency_result.valid:
                variant_warnings.append(adjacency_result.message)

            # Step 6: Apply orientation solver (road + north alignment)
            orientation_score = OrientationSolver.score(
                assignments, north_angle, road_side
            )

            variants.append({
                'strategy': strategy_name,
                'assignments': assignments,
                'warnings': variant_warnings,
                'orientation_score': orientation_score,
            })

        if not variants:
            return EngineResult(
                success=False,
                data=None,
                errors=["All decomposition strategies failed"],
                warnings=warnings
            )

        return EngineResult(
            success=True,
            data={'variants': variants},
            warnings=warnings
        )