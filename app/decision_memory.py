"""
Decision Memory (Part 17, MVP: basic outcome logging; automated recalibration deferred).
"""

from datetime import datetime, timezone
import uuid
from . import db


def open_investigation(kpi_id: str, severity: str) -> str:
    investigation_id = f"investigation:{uuid.uuid4().hex[:8]}"
    with db.get_conn() as conn:
        conn.execute(
            "INSERT INTO investigation (id, kpi_id, triggered_at, severity, status) VALUES (?, ?, ?, ?, ?)",
            (
                investigation_id,
                kpi_id,
                datetime.now(timezone.utc).isoformat(),
                severity,
                "open",
            ),
        )
    return investigation_id


def close_investigation(investigation_id: str, status: str = "closed"):
    with db.get_conn() as conn:
        conn.execute(
            "UPDATE investigation SET status = ? WHERE id = ?",
            (status, investigation_id),
        )


def record_outcome(
    decision_id: str, kpi_delta: float, hypothesis_confirmed: bool
) -> str:
    outcome_id = f"outcome:{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    with db.get_conn() as conn:
        conn.execute(
            "INSERT INTO outcome (id, decision_id, measured_at, kpi_delta, hypothesis_confirmed) VALUES (?, ?, ?, ?, ?)",
            (
                outcome_id,
                decision_id,
                now_iso,
                kpi_delta,
                int(hypothesis_confirmed),
            ),
        )

    # Phase 3: Automatic RL Edge Recalibration based on outcome reward signal
    try:
        from .edge_recalibration import edge_recalibration_engine
        edge_recalibration_engine.recalibrate_from_outcome(
            decision_id=decision_id,
            hypothesis_confirmed=hypothesis_confirmed,
            kpi_delta=kpi_delta,
        )
    except Exception as e:
        print(f"Warning: Edge recalibration hook failed: {e}")

    return outcome_id


def list_investigations() -> list:
    with db.get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM investigation ORDER BY triggered_at DESC"
        ).fetchall()
        return [dict(r) for r in rows]


def list_decisions(investigation_id: str = None) -> list:
    with db.get_conn() as conn:
        if investigation_id:
            rows = conn.execute(
                "SELECT * FROM decision WHERE investigation_id = ?", (investigation_id,)
            ).fetchall()
        else:
            rows = conn.execute(
                "SELECT * FROM decision ORDER BY decided_at DESC"
            ).fetchall()
        return [dict(r) for r in rows]
