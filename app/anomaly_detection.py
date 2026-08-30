"""
Anomaly Detection (Part 8, MVP: z-score + rolling baseline; CUSUM deferred).
"""

from typing import cast
import pandas as pd
from . import config, db
from .data_layer import load_revenue


def _aggregate(df: pd.DataFrame, dimension_scope: dict) -> pd.Series:
    sub = df.copy()
    date_col = "Date" if "Date" in sub.columns else "date"
    sales_col = "Sales" if "Sales" in sub.columns else "revenue_lakh_inr"

    for dim, val in dimension_scope.items():
        if val is not None and str(val).lower() != "all":
            dim_lower = str(dim).lower()
            if dim_lower in ("channel", "storetype", "channel_id"):
                col_key = "channel" if "channel" in sub.columns else ("StoreType" if "StoreType" in sub.columns else None)
            elif dim_lower in ("store", "store_id"):
                col_key = "Store" if "Store" in sub.columns else ("store" if "store" in sub.columns else None)
            elif dim_lower in ("region", "region_id"):
                col_key = "region" if "region" in sub.columns else ("Region" if "Region" in sub.columns else None)
            else:
                col_key = dim if dim in sub.columns else None

            if col_key and col_key in sub.columns:
                if col_key in ("Store", "store"):
                    clean_val = str(val).replace("Store_", "").replace("Store", "").strip()
                    if clean_val.isdigit():
                        int_val = int(clean_val)
                        sub_filtered = sub[sub[col_key] == int_val]
                        if not sub_filtered.empty:
                            sub = sub_filtered
                            continue
                sub = sub[sub[col_key].astype(str) == str(val)]

    result = sub.groupby(date_col)[sales_col].sum().sort_index()
    return cast(pd.Series, result)


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
