"""
Human-in-the-Loop (Part 16, MVP: single review tier). ALL recommendations
route here in MVP (Part 26).
"""

from datetime import datetime, timezone
import uuid
from . import db


def route_for_review(investigation_id: str, recommendation: dict) -> dict:
    return {
        "review_id": f"review:{uuid.uuid4().hex[:8]}",
        "investigation_id": investigation_id,
        "recommendation": recommendation,
        "status": "pending_review",
        "queued_at": datetime.now(timezone.utc).isoformat(),
    }


def submit_decision(
    investigation_id: str,
    hypothesis_id: str,
    recommendation_id: str,
    decided_by: str,
    decision: str,
    justification: str,
) -> dict:
    decision_id = f"decision:{uuid.uuid4().hex[:8]}"
    with db.get_conn() as conn:
        conn.execute(
            """INSERT INTO decision (id, recommendation_id, hypothesis_id, investigation_id,
               decided_by, decision, justification, decided_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                decision_id,
                recommendation_id,
                hypothesis_id,
                investigation_id,
                decided_by,
                decision,
                justification,
                datetime.now(timezone.utc).isoformat(),
            ),
        )
    return {"decision_id": decision_id, "status": "recorded"}
