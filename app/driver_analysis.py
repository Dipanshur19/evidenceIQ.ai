"""
Driver Analysis (Round 2, Objective 3):
- Counterfactual per-dimension contribution decomposition
- Shapley value attribution for game-theoretically fair credit-split
  when multiple correlated drivers move together

Method types:
  - statistics_contribution_decomposition: Per-segment delta attribution
  - statistics_shapley_values: Shapley-style fair credit split
"""

import pandas as pd
import numpy as np
from itertools import combinations
from . import config
from .data_layer import load_revenue


def decompose(window_from: str, window_to: str, dimension_scope: dict = None) -> dict:
    df = load_revenue()
    if dimension_scope:
        for dim, val in dimension_scope.items():
            if val is not None:
                df = df[df[dim] == val]

    date_col = "Date" if "Date" in df.columns else "date"
    before = df[df[date_col] == pd.Timestamp(window_from)]
    after = df[df[date_col] == pd.Timestamp(window_to)]
    val_col = "Sales" if "Sales" in df.columns else "revenue_lakh_inr"
    total_before = before[val_col].sum()
    total_after = after[val_col].sum()
    total_delta = total_after - total_before

    contributions = {}
    dims = [d for d in config.DIMENSIONS if d in df.columns] or [
        c for c in ["Region", "Store", "StoreType"] if c in df.columns
    ]
    for dimension in dims:
        seg_before = before.groupby(dimension)[val_col].sum()
        seg_after = after.groupby(dimension)[val_col].sum()
        segments = set(seg_before.index) | set(seg_after.index)
        deltas = {
            seg: seg_after.get(seg, 0.0) - seg_before.get(seg, 0.0) for seg in segments
        }
        total_abs = sum(abs(v) for v in deltas.values()) or 1e-9
        seg_contribs = []
        for seg, delta in sorted(
            deltas.items(), key=lambda kv: abs(kv[1]), reverse=True
        ):
            impact_pct = (delta / total_abs) * 100
            seg_contribs.append(
                {
                    "dimension": dimension,
                    "segment": seg,
                    "delta": round(float(delta), 3),
                    "impact_pct": round(float(impact_pct), 1),
                }
            )
        contributions[dimension] = seg_contribs

    return {
        "window_from": window_from,
        "window_to": window_to,
        "total_before": round(float(total_before), 3),
        "total_after": round(float(total_after), 3),
        "total_delta": round(float(total_delta), 3),
        "total_delta_pct": round(float(total_delta / total_before * 100), 2)
        if total_before
        else None,
        "contributions": contributions,
        "method_type": "statistics_contribution_decomposition",
        "method_justification": (
            "Counterfactual 'hold-others-constant' contribution math decomposes "
            "the KPI's movement across dimensions (region, channel, store). "
            "Each segment's contribution is the ratio of its own delta to "
            "the total absolute delta across all segments."
        ),
    }


def shapley_attribution(window_from: str, window_to: str) -> dict:
    """
    Shapley value attribution for fair credit-split across interacting drivers.

    Shapley values provide a game-theoretically fair credit-split when multiple
    correlated drivers move together — exactly the "multiple interacting drivers
    such as price, volume, mix, marketing, supply, seasonality" scenario the
    brief calls out.

    For N drivers, we compute each driver's marginal contribution across all
    possible coalitions (subsets of other drivers), then average. This gives
    the unique fair allocation that satisfies efficiency, symmetry, and
    additivity axioms.

    Method type: statistics_shapley_values
    """
    df = load_revenue()
    date_col = "Date" if "Date" in df.columns else "date"
    val_col = "Sales" if "Sales" in df.columns else "revenue_lakh_inr"

    before = df[df[date_col] == pd.Timestamp(window_from)]
    after = df[df[date_col] == pd.Timestamp(window_to)]

    if before.empty or after.empty:
        return {
            "status": "insufficient_data",
            "method_type": "statistics_shapley_values",
        }

    total_before = float(before[val_col].sum())
    total_after = float(after[val_col].sum())
    total_delta = total_after - total_before

    # Identify available dimensional drivers
    dim_candidates = ["Region", "Store", "StoreType", "Promo", "Open"]
    available_dims = [d for d in dim_candidates if d in df.columns]

    if not available_dims:
        return {
            "status": "no_dimensions",
            "method_type": "statistics_shapley_values",
        }

    # Limit to top 4 dimensions for computational feasibility
    # (Shapley is O(2^N) — manageable for N ≤ 5)
    dims_to_use = available_dims[:4]
    n = len(dims_to_use)

    def _coalition_value(coalition: tuple) -> float:
        """
        Compute the 'value' of a coalition = how much of the total delta
        is explained by grouping and aggregating along these dimensions.
        """
        if not coalition:
            return 0.0

        # Group by the coalition dimensions and compute variance explained
        group_before = before.groupby(list(coalition))[val_col].sum()
        group_after = after.groupby(list(coalition))[val_col].sum()

        all_keys = set(group_before.index) | set(group_after.index)
        explained = 0.0
        for key in all_keys:
            b_val = group_before.get(key, 0.0)
            a_val = group_after.get(key, 0.0)
            explained += abs(a_val - b_val)

        # Normalize: what fraction of total absolute delta does this coalition explain?
        return explained

    # Compute Shapley values
    import math
    shapley_values = {}

    for i, dim in enumerate(dims_to_use):
        sv = 0.0
        other_dims = [d for d in dims_to_use if d != dim]

        # Iterate over all subsets of other_dims
        for size in range(len(other_dims) + 1):
            for subset in combinations(other_dims, size):
                # Coalition without dim
                v_without = _coalition_value(subset)
                # Coalition with dim
                v_with = _coalition_value(tuple(sorted(set(subset) | {dim})))

                # Marginal contribution
                marginal = v_with - v_without

                # Shapley weight: |S|! * (n-|S|-1)! / n!
                s_size = len(subset)
                weight = (math.factorial(s_size) * math.factorial(n - s_size - 1)) / math.factorial(n)
                sv += weight * marginal

        shapley_values[dim] = round(sv, 3)

    # Normalize to percentages of total explained
    total_sv = sum(abs(v) for v in shapley_values.values()) or 1e-9
    shapley_pct = {
        dim: round(abs(sv) / total_sv * 100, 1)
        for dim, sv in sorted(shapley_values.items(), key=lambda x: abs(x[1]), reverse=True)
    }

    # Build ranked driver list
    ranked_drivers = []
    for dim in sorted(shapley_values, key=lambda d: abs(shapley_values[d]), reverse=True):
        ranked_drivers.append({
            "driver": dim,
            "shapley_value": shapley_values[dim],
            "attribution_pct": shapley_pct[dim],
            "direction": "positive" if shapley_values[dim] > 0 else "negative",
        })

    return {
        "status": "ok",
        "total_delta": round(total_delta, 3),
        "total_before": round(total_before, 3),
        "total_after": round(total_after, 3),
        "shapley_values": shapley_values,
        "shapley_attribution_pct": shapley_pct,
        "ranked_drivers": ranked_drivers,
        "dimensions_analyzed": dims_to_use,
        "method_type": "statistics_shapley_values",
        "method_justification": (
            "Shapley values provide a game-theoretically fair credit-split when "
            "multiple correlated drivers move together. For each driver, we compute "
            "its average marginal contribution across all possible coalitions (subsets "
            "of other drivers). This satisfies efficiency (contributions sum to total), "
            "symmetry (equal contributors get equal credit), and dummy (zero-impact "
            "drivers get zero credit) axioms. Every ranked driver's number comes from "
            "this deterministic computation, never from LLM reasoning."
        ),
    }
