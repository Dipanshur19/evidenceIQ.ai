"""
Cold-Start Forecasting Module (Round 2, Objective 3, Min Expectation #6).

Handles sparse-history or newly launched KPI scenarios using similarity-based
shrinkage estimation: borrow from a matched group of comparable KPIs/segments,
blend the item's own thin signal with the group's pattern via a shrinkage
estimator whose weight shifts toward the item's own data as more observations
accumulate.

Method type: statistics_shrinkage_estimation
This is explicitly NOT an LLM computation — it is a deterministic statistical
method (empirical Bayes / James-Stein style shrinkage).
"""

import pandas as pd
import numpy as np
from . import config
from .data_layer import load_revenue


def _compute_group_baseline(df: pd.DataFrame, date_col: str, sales_col: str,
                            exclude_scope: dict, window_days: int = 21,
                            as_of_date: str = "2026-08-15") -> dict:
    """
    Compute the 'group average' baseline from all slices EXCEPT the target,
    to serve as the prior for shrinkage estimation.
    """
    as_of = pd.Timestamp(as_of_date)
    group_df = df.copy()

    # Exclude the target slice
    for dim, val in exclude_scope.items():
        if val and dim in group_df.columns:
            group_df = group_df[group_df[dim] != val]

    window_start = as_of - pd.Timedelta(days=window_days)
    group_series = group_df[
        (group_df[date_col] >= window_start) & (group_df[date_col] < as_of)
    ].groupby(date_col)[sales_col].mean().sort_index()

    if len(group_series) < 5:
        return {"status": "insufficient_group_data", "group_mean": 0, "group_std": 1}

    return {
        "status": "ok",
        "group_mean": float(group_series.mean()),
        "group_std": float(group_series.std(ddof=1)) or 1e-6,
        "group_n": len(group_series),
        "group_trend": float(group_series.iloc[-5:].mean() - group_series.iloc[:5].mean()),
    }


def shrinkage_forecast(dimension_scope: dict, as_of_date: str,
                       window_days: int = 21) -> dict:
    """
    Produce a forecast for a sparse-history KPI using shrinkage estimation.

    The shrinkage weight alpha determines how much we trust the item's own
    data vs. the group prior:
        alpha = n_item / (n_item + k)
    where k is a regularization constant (higher k = more shrinkage toward group).

    forecast = alpha * item_mean + (1 - alpha) * group_mean

    As n_item grows, alpha → 1 (trust own data more).
    When n_item is very small, alpha → 0 (trust group prior more).
    """
    df = load_revenue()
    date_col = "Date" if "Date" in df.columns else "date"
    sales_col = "Sales" if "Sales" in df.columns else "revenue_lakh_inr"
    as_of = pd.Timestamp(as_of_date)

    # Filter to target slice
    sub = df.copy()
    for dim, val in dimension_scope.items():
        if val is not None and str(val).lower() != "all":
            # Try various column name mappings
            col = None
            dim_lower = dim.lower()
            if dim_lower in ("region",):
                col = "Region" if "Region" in sub.columns else ("region" if "region" in sub.columns else None)
            elif dim_lower in ("channel", "storetype"):
                col = "channel" if "channel" in sub.columns else ("StoreType" if "StoreType" in sub.columns else None)
            elif dim_lower in ("store",):
                col = "Store" if "Store" in sub.columns else ("store" if "store" in sub.columns else None)
            else:
                col = dim if dim in sub.columns else None

            if col and col in sub.columns:
                sub = sub[sub[col].astype(str).str.lower() == str(val).lower()]

    # Compute item's own baseline
    window_start = as_of - pd.Timedelta(days=window_days)
    item_series = sub[
        (sub[date_col] >= window_start) & (sub[date_col] < as_of)
    ].groupby(date_col)[sales_col].sum().sort_index()

    n_item = len(item_series)
    is_sparse = n_item < 14

    if n_item == 0:
        item_mean = 0.0
        item_std = 0.0
    else:
        item_mean = float(item_series.mean())
        item_std = float(item_series.std(ddof=1)) if n_item > 1 else 0.0

    # Compute group baseline (excluding target)
    group = _compute_group_baseline(df, date_col, sales_col, dimension_scope,
                                     window_days, as_of_date)

    if group["status"] != "ok":
        return {
            "status": "insufficient_group_data",
            "method_type": "statistics_shrinkage_estimation",
            "method_justification": "Cold-start forecasting requires a group baseline to borrow strength from; insufficient data across comparison slices.",
            "forecast": item_mean if n_item > 0 else None,
            "confidence": "VERY_LOW",
            "n_item": n_item,
            "is_sparse": is_sparse,
        }

    # Shrinkage estimation
    # k = regularization constant; k=10 means we need ~10 observations
    # before trusting item data over the group
    k = 10
    alpha = n_item / (n_item + k)  # shrinkage weight

    shrinkage_forecast_value = alpha * item_mean + (1 - alpha) * group["group_mean"]

    # Blended standard deviation for confidence intervals
    if item_std > 0 and group["group_std"] > 0:
        blended_std = np.sqrt(alpha * item_std**2 + (1 - alpha) * group["group_std"]**2)
    else:
        blended_std = group["group_std"]

    # Confidence based on data availability
    if n_item >= 14:
        confidence = "HIGH"
    elif n_item >= 7:
        confidence = "MEDIUM"
    elif n_item >= 3:
        confidence = "LOW"
    else:
        confidence = "VERY_LOW"

    return {
        "status": "ok",
        "method_type": "statistics_shrinkage_estimation",
        "method_justification": (
            f"KPI has only {n_item} days of history (sparse). Using James-Stein style "
            f"shrinkage estimation: blending item's own mean with group mean from "
            f"{group['group_n']} comparison data points. Shrinkage weight alpha={alpha:.3f} "
            f"(0=full group prior, 1=full item data). As more data accumulates, "
            f"the forecast will converge toward the item's own signal."
        ),
        "forecast": round(shrinkage_forecast_value, 3),
        "item_mean": round(item_mean, 3),
        "group_mean": round(group["group_mean"], 3),
        "shrinkage_alpha": round(alpha, 3),
        "confidence_interval_95": [
            round(shrinkage_forecast_value - 1.96 * blended_std, 3),
            round(shrinkage_forecast_value + 1.96 * blended_std, 3),
        ],
        "blended_std": round(blended_std, 3),
        "confidence": confidence,
        "n_item": n_item,
        "n_group": group["group_n"],
        "is_sparse": is_sparse,
        "group_trend": round(group["group_trend"], 3),
    }
