"""
Recommendation Engine (Part 15). Gated by confidence and a governed action-risk table.
"""

from . import config

ACTION_KEYWORDS = {
    "release": "rollback_release",
    "redesign": "rollback_release",
    "campaign": "pause_campaign",
    "promo": "pause_campaign",
    "price": "price_adjustment",
    "pricing": "price_adjustment",
}


def _infer_action_category(hypothesis_statement: str) -> str:
    statement_l = hypothesis_statement.lower()
    for kw, category in ACTION_KEYWORDS.items():
        if kw in statement_l:
            return category
    return "rollback_release"


def generate_recommendation(top_hypothesis: dict | None, narrative: dict) -> dict:
    if not top_hypothesis or top_hypothesis["confidence_band"] not in (
        "HIGH",
        "MEDIUM",
    ):
        return {
            "status": "no_recommendation",
            "reason": "No hypothesis reached MEDIUM confidence or higher; escalate to analyst for manual review.",
        }

    action_category = _infer_action_category(top_hypothesis["statement"])
    risk_info = config.ACTION_RISK_TABLE.get(
        action_category,
        {"risk": "unknown", "reversibility": "unknown", "always_review": True},
    )

    # Structured Schema Mapping
    driver = top_hypothesis.get("statement", "Observed KPI Anomaly")
    if "release" in action_category or "rollback" in action_category:
        controllable_lever = "Software Release Management / Engineering Operations"
        owner = "DevOps & Product Release Team"
        expected_impact = (
            "+15.0% to +25.0% Revenue Recovery within 24 hours post-rollback"
        )
        monitoring_plan = "Monitor real-time checkout conversion rate and POS error rates every 15 minutes for 6 hours."
    elif "campaign" in action_category or "promo" in action_category:
        controllable_lever = "Marketing Campaign Allocation"
        owner = "Growth Marketing Lead"
        expected_impact = "Mitigate negative ROI campaign loss by ₹2.5L daily"
        monitoring_plan = "Track hourly order volume and CAC in regional dashboard."
    else:
        controllable_lever = "Regional Commercial Operations"
        owner = "Regional Operations Director"
        expected_impact = "Restore baseline margin performance within 48 hours"
        monitoring_plan = "Daily automated z-score audit for 7 consecutive days."

    proposed_action = narrative.get(
        "recommended_next_step", f"Execute {action_category} mitigation protocol."
    )

    return {
        "recommendation_id": f"rec:{top_hypothesis['id'].split(':')[-1]}",
        "hypothesis_ref": top_hypothesis["id"],
        "action_category": action_category,
        # 7-Part Master Schema
        "driver": driver,
        "controllable_lever": controllable_lever,
        "action": proposed_action,
        "expected_impact": expected_impact,
        "owner": owner,
        "confidence": top_hypothesis["confidence_band"],
        "monitoring_plan": monitoring_plan,
        # Risk & Governance Gating
        "proposed_action": proposed_action,
        "reason": f"{top_hypothesis['confidence_band']} confidence hypothesis (evidence score: {top_hypothesis['evidence_score']:.3f}).",
        "risk": risk_info["risk"],
        "reversibility": risk_info["reversibility"],
        "requires_human_review": True
        if config.ALWAYS_REQUIRE_HUMAN_REVIEW
        else risk_info["always_review"],
        "status": "pending_human_review",
    }
