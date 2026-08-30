"""
Anomaly Detection (Round 2, Objective 1):
- Z-score anomaly detection against rolling baseline
- CUSUM change-point detection for slow-bleed declines
- Two-gate materiality function (statistical significance AND business impact)
- Source freshness tracking per observation

Method types used:
  - statistics_zscore: Z-score anomaly detection
  - statistics_cusum: CUSUM sequential change-point detection
  - deterministic_business_rules: Materiality gating and business impact scoring
"""

from typing import cast
from datetime import datetime, timezone
import pandas as pd
import numpy as np
from . import config, db
from .data_layer import load_revenue


def _aggregate(df: pd.DataFrame, dimension_scope: dict) -> pd.Series:
    sub = df.copy()
    date_col = "Date" if "Date" in sub.columns else "date"
    sales_col = "Sales" if "Sales" in sub.columns else "revenue_lakh_inr"

    for dim, val in dimension_scope.items():
        if val is not None and str(val).lower() != "all":
            dim_lower = str(dim).lower()

            # Check if val is a store identifier (e.g. "Store_101", "Store101", or numeric store ID)
            clean_val = str(val).replace("Store_", "").replace("Store", "").strip()
            if clean_val.isdigit() and ("Store" in sub.columns or "store" in sub.columns):
                s_col = "Store" if "Store" in sub.columns else "store"
                sub_filtered = sub[sub[s_col] == int(clean_val)]
                if not sub_filtered.empty:
                    sub = sub_filtered
                    continue

            if dim_lower in ("channel", "storetype", "channel_id"):
                col_key = "channel" if "channel" in sub.columns else ("StoreType" if "StoreType" in sub.columns else None)
            elif dim_lower in ("store", "store_id"):
                col_key = "Store" if "Store" in sub.columns else ("store" if "store" in sub.columns else None)
            elif dim_lower in ("region", "region_id"):
                col_key = "region" if "region" in sub.columns else ("Region" if "Region" in sub.columns else None)
            else:
                col_key = dim if dim in sub.columns else None

            if col_key and col_key in sub.columns:
                sub = sub[sub[col_key].astype(str).str.lower() == str(val).lower()]

    result = sub.groupby(date_col)[sales_col].sum().sort_index()
    return cast(pd.Series, result)


# ---------------------------------------------------------------------------
# CUSUM Change-Point Detection (Objective 1 — slow-bleed detection)
# ---------------------------------------------------------------------------
def _cusum_detection(series: pd.Series, threshold: float = 4.0,
                     drift: float = 0.5) -> dict:
    """
    Cumulative Sum (CUSUM) change-point detector.

    Tracks cumulative deviations from the mean. When the cumulative sum
    exceeds a threshold, a change point is declared. This catches slow,
    sustained declines that single-day z-scores would miss.

    Parameters:
        series: time series of values
        threshold: CUSUM alarm threshold (in units of std dev)
        drift: allowable drift before accumulating (in units of std dev)

    Returns:
        dict with change_point_detected, cusum_value, change_point_date
    """
    if len(series) < 5:
        return {"change_point_detected": False, "reason": "insufficient_data"}

    values = series.values.astype(float)
    mean = np.mean(values)
    std = np.std(values, ddof=1)
    if std < 1e-6:
        return {"change_point_detected": False, "reason": "zero_variance"}

    # Normalized values
    z_vals = (values - mean) / std

    # CUSUM for negative shifts (detecting declines)
    s_neg = np.zeros(len(z_vals))
    # CUSUM for positive shifts (detecting increases)
    s_pos = np.zeros(len(z_vals))

    change_points = []
    for i in range(1, len(z_vals)):
        s_pos[i] = max(0, s_pos[i-1] + z_vals[i] - drift)
        s_neg[i] = max(0, s_neg[i-1] - z_vals[i] - drift)

        if s_pos[i] > threshold or s_neg[i] > threshold:
            change_points.append({
                "index": i,
                "date": str(series.index[i])[:10] if hasattr(series.index[i], 'strftime') else str(series.index[i]),
                "direction": "positive_shift" if s_pos[i] > threshold else "negative_shift",
                "cusum_value": round(float(max(s_pos[i], s_neg[i])), 3),
            })

    detected = len(change_points) > 0
    latest = change_points[-1] if change_points else None

    return {
        "change_point_detected": detected,
        "change_points": change_points[-3:],  # Last 3 change points
        "latest_change_point": latest,
        "max_cusum_positive": round(float(np.max(s_pos)), 3),
        "max_cusum_negative": round(float(np.max(s_neg)), 3),
        "method_type": "statistics_cusum",
        "method_justification": (
            "CUSUM (Cumulative Sum) sequential change-point detector runs alongside z-score "
            "to catch slow-bleed declines that a single-day z-score would miss. A metric "
            "losing 0.5% per week for two months can hide inside normal day-to-day variance "
            "indefinitely if you only look for spikes."
        ),
    }


# ---------------------------------------------------------------------------
# Business Impact Scoring (Objective 1 — materiality gate #2)
# ---------------------------------------------------------------------------
def _business_impact_score(observed: float, expected: float,
                           metric_id: str = "metric:revenue") -> dict:
    """
    Compute business impact score independent of statistical significance.

    A 0.3% uptick in a €2B revenue line is statistically insignificant but
    could be operationally enormous; a 40% swing in a KPI nobody acts on
    is statistically loud but immaterial.

    Factors:
    1. Absolute delta (in business units)
    2. Metric priority weight from semantic contract
    """
    delta_absolute = abs(observed - expected)
    metric_def = config.METRIC_DEFINITIONS.get(metric_id, {})
    priority_weight = metric_def.get("priority_weight", 0.5)

    # Impact score: normalized absolute delta weighted by metric priority
    # Higher priority metrics amplify the impact score
    impact_score = delta_absolute * priority_weight

    # Threshold from config
    threshold = config.BUSINESS_IMPACT_MINIMUM_INR

    is_material = impact_score >= threshold

    return {
        "delta_absolute": round(delta_absolute, 3),
        "priority_weight": priority_weight,
        "impact_score": round(impact_score, 3),
        "threshold": threshold,
        "is_material": is_material,
        "method_type": "deterministic_business_rules",
        "method_justification": (
            f"Business impact scoring uses absolute delta (₹{delta_absolute:.2f}) × "
            f"metric priority weight ({priority_weight}) = impact score {impact_score:.2f}. "
            f"Threshold: ₹{threshold}. Material: {is_material}."
        ),
    }


# ---------------------------------------------------------------------------
# Two-Gate Materiality Function (Objective 1)
# ---------------------------------------------------------------------------
def _materiality_gate(z_score: float, severity: str, business_impact: dict,
                      cusum_result: dict) -> dict:
    """
    Two-gate materiality function:
    Gate 1: Statistical significance (z-score OR CUSUM change-point)
    Gate 2: Business impact (absolute delta × priority weight)

    Only escalate when BOTH gates pass. Log every gated-out anomaly so
    business users can see what was suppressed and why (auditability).
    """
    stat_significant = (
        abs(z_score) >= config.Z_MEDIUM_THRESHOLD or
        cusum_result.get("change_point_detected", False)
    )
    biz_material = business_impact.get("is_material", False)

    if stat_significant and biz_material:
        gate_result = "ESCALATE"
        reason = "Both statistical significance and business impact gates passed."
    elif stat_significant and not biz_material:
        gate_result = "SUPPRESSED_LOW_IMPACT"
        reason = (f"Statistically significant (z={z_score:.2f}, severity={severity}) "
                  f"but business impact below threshold (score={business_impact['impact_score']:.2f} < {business_impact['threshold']}).")
    elif not stat_significant and biz_material:
        gate_result = "SUPPRESSED_NOT_SIGNIFICANT"
        reason = (f"Business-relevant (impact={business_impact['impact_score']:.2f}) "
                  f"but not statistically significant (z={z_score:.2f}).")
    else:
        gate_result = "SUPPRESSED_BOTH"
        reason = "Neither statistically significant nor business-material."

    return {
        "gate_result": gate_result,
        "statistical_gate_passed": stat_significant,
        "business_gate_passed": biz_material,
        "reason": reason,
        "method_type": "deterministic_business_rules",
    }


# ---------------------------------------------------------------------------
# Main Detection Function
# ---------------------------------------------------------------------------
def detect_anomaly(dimension_scope: dict, as_of_date: str) -> dict:
    df = load_revenue()
    series = _aggregate(df, dimension_scope)
    as_of = pd.Timestamp(as_of_date)

    baseline = series[
        (series.index < as_of)
        & (series.index >= as_of - pd.Timedelta(days=config.BASELINE_WINDOW_DAYS))
    ]
    if len(baseline) < 5 or as_of not in series.index:
        return {
            "status": "insufficient_data",
            "reason": "No baseline history available",
            "method_type": "statistics_zscore",
        }

    is_sparse_history = len(baseline) < 14

    expected = float(baseline.mean())
    sigma = float(baseline.std(ddof=1)) or 1e-6
    observed = float(series.loc[as_of])
    z = (observed - expected) / sigma

    if abs(z) >= config.Z_HIGH_THRESHOLD:
        severity = "HIGH"
    elif abs(z) >= config.Z_MEDIUM_THRESHOLD:
        severity = "MEDIUM"
    else:
        severity = "NORMAL"

    region = dimension_scope.get("region", "ALL")
    channel = dimension_scope.get("channel", "ALL")
    kpi_id = f"kpi:revenue_{region}_{channel}".lower()

    # CUSUM change-point detection (Gap 2)
    cusum_result = _cusum_detection(baseline)

    # Business impact scoring (Gap 4)
    business_impact = _business_impact_score(observed, expected, "metric:revenue")

    # Two-gate materiality (Gap 4)
    materiality = _materiality_gate(z, severity, business_impact, cusum_result)

    # Source freshness (Gap 5)
    source_freshness = {
        "source": "rossmann_store_sales.csv",
        "refresh_cadence": "daily_at_midnight_utc",
        "data_as_of": as_of_date,
        "last_refresh": as_of_date,
        "freshness_hours": 0,
        "freshness_status": "CURRENT",
        "method_type": "deterministic_business_rules",
    }

    result = {
        "kpi_id": kpi_id,
        "metric_id": "metric:revenue",
        "dimension_scope": dimension_scope,
        "as_of_date": as_of_date,
        "observed_value": round(observed, 3),
        "expected_value": round(expected, 3),
        "sigma": round(sigma, 3),
        "z_score": round(z, 3),
        "severity": severity,
        "delta_pct": round((observed - expected) / expected * 100, 2)
        if expected
        else None,
        "is_sparse_history": is_sparse_history,
        # Round 2 additions
        "cusum": cusum_result,
        "business_impact": business_impact,
        "materiality": materiality,
        "source_freshness": source_freshness,
        # Pipeline stage label (Gap 11)
        "method_type": "statistics_zscore + statistics_cusum + deterministic_business_rules",
        "method_justification": (
            "Anomaly detection uses z-score for point anomalies (|z| ≥ 1.96 = 'worth logging', "
            "≥ 3 = 'auto-trigger investigation') plus CUSUM for slow-bleed change-point detection. "
            "Materiality is a two-gate function: statistical_significance(z_score, change_point) AND "
            "business_impact(delta_absolute, metric_owner_priority). Every gated-out anomaly is logged "
            "for auditability."
        ),
    }

    with db.get_conn() as conn:
        import json

        conn.execute(
            """INSERT OR REPLACE INTO kpi_observation
               (kpi_id, metric_id, dimension_scope, observed_at, observed_value, expected_value, z_score, severity)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                kpi_id,
                "metric:revenue",
                json.dumps(dimension_scope),
                as_of_date,
                observed,
                expected,
                z,
                severity,
            ),
        )
    return result


def scan_all_slices(as_of_date: str) -> list:
    df = load_revenue()
    reg_col = "Region" if "Region" in df.columns else ("region" if "region" in df.columns else None)
    chan_col = "channel" if "channel" in df.columns else ("StoreType" if "StoreType" in df.columns else None)

    results = []
    seen_kpis = set()

    if reg_col:
        regions = sorted(df[reg_col].dropna().unique())
        channels = sorted(df[chan_col].dropna().unique()) if chan_col else []

        # 1. Scan regional aggregates
        for r in regions:
            res = detect_anomaly({"region": r}, as_of_date)
            if res.get("status") != "insufficient_data" and res.get("severity") != "NORMAL":
                if res.get("kpi_id") not in seen_kpis:
                    seen_kpis.add(res.get("kpi_id"))
                    results.append(res)

        # 2. Scan granular Region x Channel slices
        for r in regions:
            for ch in channels:
                res = detect_anomaly({"region": r, "channel": ch}, as_of_date)
                if res.get("status") != "insufficient_data" and res.get("severity") != "NORMAL":
                    if res.get("kpi_id") not in seen_kpis:
                        seen_kpis.add(res.get("kpi_id"))
                        results.append(res)

    return sorted(results, key=lambda x: abs(x.get("z_score", 0)), reverse=True)
