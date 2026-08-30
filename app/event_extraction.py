"""
Event Extraction (Part 6, MVP: Change Log rows are structured/system-of-record,
auto-validated, written directly as Event nodes).
"""

from datetime import datetime, timezone
from . import db
from .entity_resolution import resolve_region, resolve_channel


def extract_events_from_change_log(change_log_df) -> list:
    created = []
    for _, row in change_log_df.iterrows():
        region_res = resolve_region(row["region"])
        channel_res = resolve_channel(row["channel"])
        attrs = {
            "node_type": "Event",
            "id": row["event_id"],
            "event_type": row["event_type"],
            "timestamp": row["timestamp"].isoformat(),
            "source": row["source"],
            "description": row["description"],
            "affected_region": region_res["canonical_id"],
            "affected_channel": channel_res["canonical_id"],
            "confidence": 0.99,
            "provenance": row["provenance"],
        }
        db.upsert_node(
            row["event_id"], "Event", attrs, datetime.now(timezone.utc).isoformat()
        )
        created.append(row["event_id"])
    return created
