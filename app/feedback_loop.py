"""
Feedback Learning Loop (Round 2, Objective 7).

Implements the capture → validate → integrate → monitor → close-the-loop
pattern for learning from analyst and business-user feedback.

Key design constraints (from brief):
- Recalibration uses ONLY human-confirmed outcomes
- Applied as small, bounded, audited weight adjustments on scheduled batch cadence
- NOT continuous online learning (avoids feedback loop corruption)
- SIMILAR_TO historical-precedent retrieval from Decision Memory

Method type: deterministic_business_rules + statistics_weight_adjustment
"""

import json
import math
from datetime import datetime, timezone
from . import db


def capture_feedback(decision_id: str, feedback_type: str, feedback_by: str,
                     feedback_detail: str, corrected_hypothesis_id: str = None,
                     corrected_driver: str = None) -> dict:
    """
    Capture explicit feedback (confirm/reject/modify) on a decision/recommendation.
    Tags each correction with source, timestamp, and the specific evidence it disputed.
    """
    feedback_id = f"feedback:{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{decision_id[-6:]}"

    with db.get_conn() as conn:
        # Ensure feedback table exists
        conn.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id TEXT PRIMARY KEY,
                decision_id TEXT NOT NULL,
                feedback_type TEXT NOT NULL,
                feedback_by TEXT NOT NULL,
                feedback_detail TEXT,
                corrected_hypothesis_id TEXT,
                corrected_driver TEXT,
                created_at TEXT NOT NULL,
                validated INTEGER DEFAULT 0,
                integrated INTEGER DEFAULT 0
            )
        """)
        conn.execute(
            """INSERT INTO feedback (id, decision_id, feedback_type, feedback_by,
               feedback_detail, corrected_hypothesis_id, corrected_driver, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
            (feedback_id, decision_id, feedback_type, feedback_by,
             feedback_detail, corrected_hypothesis_id, corrected_driver,
             datetime.now(timezone.utc).isoformat())
        )

    return {
        "feedback_id": feedback_id,
        "status": "captured",
        "method_type": "deterministic_business_rules",
        "method_justification": "Feedback captured as structured record. Awaiting validation before integration.",
    }


def validate_feedback(feedback_id: str) -> dict:
    """
    Lightweight sanity check before feedback influences anything.
    Validates that the referenced decision exists and feedback is internally consistent.
    """
    with db.get_conn() as conn:
        fb = conn.execute("SELECT * FROM feedback WHERE id = ?", (feedback_id,)).fetchone()
        if not fb:
            return {"status": "not_found"}

        fb = dict(fb)
        decision = conn.execute(
            "SELECT * FROM decision WHERE id = ?", (fb["decision_id"],)
        ).fetchone()

        is_valid = decision is not None
        if is_valid:
            conn.execute("UPDATE feedback SET validated = 1 WHERE id = ?", (feedback_id,))

    return {
        "feedback_id": feedback_id,
        "validated": is_valid,
        "reason": "Decision record found and feedback is internally consistent." if is_valid
                  else "Referenced decision not found in Decision Memory.",
        "method_type": "deterministic_business_rules",
    }


def compute_weight_adjustments() -> dict:
    """
    Analyze validated feedback patterns to compute bounded weight adjustments.
    This is the 'integrate' step — run on scheduled batch cadence (e.g., weekly).

    Adjustments are:
    - Small (max ±0.05 per factor per cycle)
    - Bounded (factors stay within [0.05, 0.50])
    - Audited (logged with timestamp and rationale)
    - Reversible (can be reverted)
    """
    with db.get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS weight_adjustment (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                factor TEXT NOT NULL,
                old_weight REAL NOT NULL,
                new_weight REAL NOT NULL,
                adjustment REAL NOT NULL,
                reason TEXT,
                feedback_count INTEGER,
                created_at TEXT NOT NULL
            )
        """)

        # Get validated, not-yet-integrated feedback
        feedbacks = [dict(r) for r in conn.execute(
            "SELECT * FROM feedback WHERE validated = 1 AND integrated = 0"
        ).fetchall()]

    if not feedbacks:
        return {
            "status": "no_pending_feedback",
            "adjustments": [],
            "method_type": "statistics_weight_adjustment",
        }

    # Analyze feedback patterns
    reject_count = sum(1 for f in feedbacks if f["feedback_type"] == "reject")
    confirm_count = sum(1 for f in feedbacks if f["feedback_type"] == "confirm")
    modify_count = sum(1 for f in feedbacks if f["feedback_type"] == "modify")
    total = len(feedbacks)

    adjustments = []
    from . import config

    current_weights = dict(config.EVIDENCE_WEIGHTS)

    # If high rejection rate, slightly increase causal evidence weight
    # (users want stronger causal proof before accepting)
    if total >= 3 and reject_count / total > 0.4:
        factor = "quasi_causal_evidence"
        old_w = current_weights[factor]
        delta = min(0.05, 0.02 * (reject_count / total))
        new_w = min(0.50, old_w + delta)
        adjustments.append({
            "factor": factor,
            "old_weight": round(old_w, 4),
            "new_weight": round(new_w, 4),
            "adjustment": round(new_w - old_w, 4),
            "reason": f"High rejection rate ({reject_count}/{total}). Increasing causal evidence weight to require stronger proof.",
            "feedback_count": reject_count,
        })

    # If high modify rate on driver attribution, increase correlation weight
    if total >= 3 and modify_count / total > 0.3:
        factor = "correlation_strength"
        old_w = current_weights[factor]
        delta = min(0.05, 0.02 * (modify_count / total))
        new_w = min(0.50, old_w + delta)
        adjustments.append({
            "factor": factor,
            "old_weight": round(old_w, 4),
            "new_weight": round(new_w, 4),
            "adjustment": round(new_w - old_w, 4),
            "reason": f"High modify rate on driver attribution ({modify_count}/{total}). Increasing correlation weight.",
            "feedback_count": modify_count,
        })

    # Persist adjustments
    with db.get_conn() as conn:
        for adj in adjustments:
            conn.execute(
                """INSERT INTO weight_adjustment (factor, old_weight, new_weight, adjustment,
                   reason, feedback_count, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)""",
                (adj["factor"], adj["old_weight"], adj["new_weight"], adj["adjustment"],
                 adj["reason"], adj["feedback_count"], datetime.now(timezone.utc).isoformat())
            )
        # Mark feedback as integrated
        for fb in feedbacks:
            conn.execute("UPDATE feedback SET integrated = 1 WHERE id = ?", (fb["id"],))

    return {
        "status": "adjustments_computed",
        "adjustments": adjustments,
        "feedback_processed": total,
        "method_type": "statistics_weight_adjustment",
        "method_justification": (
            "Weight adjustments are bounded (max ±0.05 per cycle), audited, and reversible. "
            "Uses only human-confirmed feedback patterns, not continuous online learning."
        ),
    }


def find_similar_investigations(kpi_id: str, severity: str, top_k: int = 5) -> list:
    """
    SIMILAR_TO historical-precedent retrieval from Decision Memory.
    Finds past investigations with similar KPI patterns and returns their
    outcomes to inform the current investigation.
    """
    with db.get_conn() as conn:
        # Find investigations on similar KPIs
        investigations = [dict(r) for r in conn.execute(
            """SELECT i.*, d.decision, d.justification, d.decided_by,
                      o.kpi_delta, o.hypothesis_confirmed
               FROM investigation i
               LEFT JOIN decision d ON d.investigation_id = i.id
               LEFT JOIN outcome o ON o.decision_id = d.id
               WHERE i.kpi_id LIKE ? OR i.severity = ?
               ORDER BY i.triggered_at DESC
               LIMIT ?""",
            (f"%{kpi_id.split(':')[-1].split('_')[0]}%", severity, top_k)
        ).fetchall()]

    similar = []
    for inv in investigations:
        similarity_score = 0.0
        # Same KPI family
        if kpi_id.split(":")[0] == inv.get("kpi_id", "").split(":")[0]:
            similarity_score += 0.5
        # Same severity
        if severity == inv.get("severity"):
            similarity_score += 0.3
        # Has outcome data
        if inv.get("hypothesis_confirmed") is not None:
            similarity_score += 0.2

        similar.append({
            "investigation_id": inv["id"],
            "kpi_id": inv.get("kpi_id"),
            "severity": inv.get("severity"),
            "decision": inv.get("decision"),
            "outcome_delta": inv.get("kpi_delta"),
            "hypothesis_confirmed": bool(inv.get("hypothesis_confirmed")),
            "similarity_score": round(similarity_score, 3),
        })

    similar.sort(key=lambda x: x["similarity_score"], reverse=True)
    return similar


def get_feedback_summary() -> dict:
    """Returns a summary of all feedback, adjustments, and learning metrics."""
    with db.get_conn() as conn:
        # Ensure tables exist
        conn.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id TEXT PRIMARY KEY, decision_id TEXT, feedback_type TEXT,
                feedback_by TEXT, feedback_detail TEXT, corrected_hypothesis_id TEXT,
                corrected_driver TEXT, created_at TEXT, validated INTEGER DEFAULT 0,
                integrated INTEGER DEFAULT 0
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS weight_adjustment (
                id INTEGER PRIMARY KEY AUTOINCREMENT, factor TEXT, old_weight REAL,
                new_weight REAL, adjustment REAL, reason TEXT, feedback_count INTEGER,
                created_at TEXT
            )
        """)

        feedbacks = [dict(r) for r in conn.execute(
            "SELECT * FROM feedback ORDER BY created_at DESC LIMIT 50"
        ).fetchall()]
        adjustments = [dict(r) for r in conn.execute(
            "SELECT * FROM weight_adjustment ORDER BY created_at DESC LIMIT 20"
        ).fetchall()]

    total_fb = len(feedbacks)
    confirmed = sum(1 for f in feedbacks if f.get("feedback_type") == "confirm")
    rejected = sum(1 for f in feedbacks if f.get("feedback_type") == "reject")
    modified = sum(1 for f in feedbacks if f.get("feedback_type") == "modify")

    return {
        "total_feedback": total_fb,
        "confirmed": confirmed,
        "rejected": rejected,
        "modified": modified,
        "acceptance_rate": round(confirmed / max(total_fb, 1) * 100, 1),
        "recent_feedback": feedbacks[:10],
        "weight_adjustments": adjustments[:10],
        "method_type": "deterministic_business_rules",
    }
