"""
Graph Builder (Part 4): writes KPI nodes and PRECEDES edges from Event to KPI.
"""

from datetime import datetime, timezone, date
from . import db


def upsert_kpi_node(
    kpi_id: str,
    metric_id: str,
    dimension_scope: dict,
    observed_value: float,
    expected_value: float,
):
    attrs = {
        "node_type": "KPI",
        "id": kpi_id,
        "metric_id": metric_id,
        "dimension_scope": dimension_scope,
        "observed_value": observed_value,
        "expected_value": expected_value,
    }
    db.upsert_node(kpi_id, "KPI", attrs, datetime.now(timezone.utc).isoformat())


def link_events_to_kpi(
    kpi_id: str, dimension_scope: dict, window_start: str, window_end: str
):
    events = db.get_nodes_by_type("Event")
    linked = []
    for ev in events:
        a = ev["attrs"]
        region_match = dimension_scope.get("region") is None or a.get(
            "affected_region"
        ) == dimension_scope.get("region")
        channel_match = dimension_scope.get("channel") is None or a.get(
            "affected_channel"
        ) == dimension_scope.get("channel")
        if not (region_match and channel_match):
            continue
        ev_ts = a["timestamp"][:10]
        if ev_ts > window_end:
            continue
        lag_days = (date.fromisoformat(window_end) - date.fromisoformat(ev_ts)).days
        if lag_days < 0:
            continue
        confidence = max(0.99 - 0.05 * max(lag_days - 5, 0), 0.1)
        db.add_edge(
            "PRECEDES",
            ev["id"],
            kpi_id,
            round(confidence, 3),
            methodology="lag_window_match",
            provenance="graph_builder",
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        linked.append(
            {
                "event_id": ev["id"],
                "lag_days": lag_days,
                "confidence": round(confidence, 3),
            }
        )
    return linked
