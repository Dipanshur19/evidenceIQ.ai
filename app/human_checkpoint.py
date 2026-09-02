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
    auto_dispatch_rollback: bool = True,
) -> dict:
    decision_id = f"decision:{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now(timezone.utc).isoformat()
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
                now_iso,
            ),
        )

    result = {"decision_id": decision_id, "status": "recorded"}

    # Phase 3: Automated CI/CD Rollback Hook Trigger upon confirmation
    if decision.lower() == "confirm" and auto_dispatch_rollback:
        from .recovery_engine import recovery_engine
        try:
            dispatch_res = recovery_engine.dispatch_rollback(
                decision_id=decision_id,
                action_category="rollback_release",
                target_release="v5.4.0",
                operator_id=decided_by,
                reason=justification or "Confirmed operator sign-off at Human Checkpoint Gate.",
            )
            result["recovery_dispatch"] = dispatch_res
        except Exception as e:
            result["recovery_dispatch_error"] = str(e)

    return result
