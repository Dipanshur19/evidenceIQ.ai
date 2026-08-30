"""
Driver Analysis (Part 9): counterfactual per-dimension contribution decomposition.
"""

import pandas as pd
from . import config
from .data_layer import load_revenue


def decompose(window_from: str, window_to: str, dimension_scope: dict = None) -> dict:
    df = load_revenue()
    if dimension_scope:
        for dim, val in dimension_scope.items():
            if val is not None:
                df = df[df[dim] == val]

    before = df[df["date"] == pd.Timestamp(window_from)]
    after = df[df["date"] == pd.Timestamp(window_to)]
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
    }
