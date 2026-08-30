"""
Temporal + Quasi-Causal Analysis (Part 10, MVP: temporal alignment, lag,
pre/post, and difference-in-differences only).
"""

from datetime import date
import pandas as pd
from .data_layer import load_revenue


def temporal_alignment(
    event_timestamp: str, anomaly_date: str, max_lag_days: int = 7
) -> dict:
    ev_date = date.fromisoformat(event_timestamp[:10])
    an_date = date.fromisoformat(anomaly_date)
    lag = (an_date - ev_date).days
    if lag < 0:
        return {
            "aligned": False,
            "lag_days": lag,
            "reason": "event occurs after anomaly",
        }
    if lag > max_lag_days:
        return {
            "aligned": False,
            "lag_days": lag,
            "reason": "event too far before anomaly window",
        }
    strength = max(1.0 - 0.7 * (lag / max_lag_days), 0.1)
    return {"aligned": True, "lag_days": lag, "evidence_strength": round(strength, 3)}


def pre_post_comparison(
    region: str, channel: str, event_date: str, window_days: int = 5
) -> dict:
    df = load_revenue()
    sub = df[(df["region"] == region) & (df["channel"] == channel)]
    ev = pd.Timestamp(event_date)
    pre = sub[
        (sub["date"] < ev) & (sub["date"] >= ev - pd.Timedelta(days=window_days))
    ]["revenue_lakh_inr"]
    post = sub[
        (sub["date"] >= ev) & (sub["date"] < ev + pd.Timedelta(days=window_days))
    ]["revenue_lakh_inr"]
    if pre.empty or post.empty:
        return {"status": "insufficient_data"}
    pre_mean, post_mean = float(pre.mean()), float(post.mean())
    pct_change = (post_mean - pre_mean) / pre_mean * 100 if pre_mean else None
    return {
        "pre_mean": round(pre_mean, 3),
        "post_mean": round(post_mean, 3),
        "pct_change": round(pct_change, 2) if pct_change is not None else None,
        "caveat": "No control group used here - cannot rule out coincidental timing.",
    }


def difference_in_differences(
    treated_region: str,
    treated_channel: str,
    control_region: str,
    control_channel: str,
    event_date: str,
    window_days: int = 5,
) -> dict:
    df = load_revenue()
    ev = pd.Timestamp(event_date)

    def _pre_post(region, channel):
        sub = df[(df["region"] == region) & (df["channel"] == channel)]
        pre = sub[
            (sub["date"] < ev) & (sub["date"] >= ev - pd.Timedelta(days=window_days))
        ]["revenue_lakh_inr"].mean()
        post = sub[
            (sub["date"] >= ev) & (sub["date"] < ev + pd.Timedelta(days=window_days))
        ]["revenue_lakh_inr"].mean()
        return float(pre), float(post)

    treated_pre, treated_post = _pre_post(treated_region, treated_channel)
    control_pre, control_post = _pre_post(control_region, control_channel)
    treated_change = (treated_post - treated_pre) / treated_pre if treated_pre else None
    control_change = (control_post - control_pre) / control_pre if control_pre else None
    if treated_change is None or control_change is None:
        return {"status": "insufficient_data"}

    did_effect = treated_change - control_change
    evidence_strength = min(abs(did_effect) * 2, 1.0)
    return {
        "treated_pct_change": round(treated_change * 100, 2),
        "control_pct_change": round(control_change * 100, 2),
        "did_effect_pct_points": round(did_effect * 100, 2),
        "evidence_strength": round(evidence_strength, 3),
        "assumption": "Parallel trends assumed between treated and control slice - not independently verified.",
        "cannot_prove": "True causality if the parallel-trends assumption is violated.",
    }
