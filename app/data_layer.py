"""
Data Layer — structured revenue, structured Change Log, unstructured tickets.
"""

import pandas as pd
from . import config


def load_revenue() -> pd.DataFrame:
    df = pd.read_csv(config.REVENUE_CSV)
    date_col = "Date" if "Date" in df.columns else "date"
    df[date_col] = pd.to_datetime(df[date_col])
    if "date" not in df.columns:
        df["date"] = df[date_col]
    if "revenue_lakh_inr" not in df.columns and "Sales" in df.columns:
        df["revenue_lakh_inr"] = df["Sales"] / 100.0
    if "region" not in df.columns and "Region" in df.columns:
        df["region"] = df["Region"]
    if "channel" not in df.columns and "StoreType" in df.columns:
        df["channel"] = df["StoreType"]
    return df


def load_change_log() -> pd.DataFrame:
    df = pd.read_csv(config.CHANGE_LOG_CSV, parse_dates=["timestamp"])
    df["timestamp"] = df["timestamp"].dt.tz_localize(None)
    return df


def load_tickets() -> pd.DataFrame:
    df = pd.read_csv(config.TICKETS_CSV)
    col = "created_at" if "created_at" in df.columns else "timestamp"
    df[col] = pd.to_datetime(df[col]).dt.tz_localize(None)
    if "created_at" not in df.columns:
        df["created_at"] = df[col]
    return df
