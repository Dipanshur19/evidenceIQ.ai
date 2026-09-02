"""
Graph Retrieval + Context Assembly (Part 13): assembles the exact structured
JSON package the LLM is allowed to see.
"""

from . import db


def assemble_context(anomaly: dict, hypotheses: list, driver_result: dict) -> dict:
    ranked = sorted(hypotheses, key=lambda h: h["evidence_score"], reverse=True)
    above_low = [h for h in ranked if h["confidence_band"] != "INSUFFICIENT_EVIDENCE"]
    insufficient = [
        h for h in ranked if h["confidence_band"] == "INSUFFICIENT_EVIDENCE"
    ]

    hypothesis_packages = []
    for h in above_low:
        evidence_nodes = []
        for eid in h.get("supporting_evidence", []):
            node = db.get_node(eid)
            if node:
                evidence_nodes.append(
                    {
                        "id": node["id"],
                        "summary": node["attrs"].get("summary"),
                        "source": node["attrs"].get("source"),
                        "strength": node["attrs"].get("strength"),
                    }
                )
        event_node = db.get_node(h["related_event"])
        hypothesis_packages.append(
            {
                "id": h["id"],
                "statement": h["statement"],
                "evidence_score": h["evidence_score"],
                "confidence_band": h["confidence_band"],
                "scoring_breakdown": h["scoring_breakdown"],
                "related_event": {
                    "id": event_node["id"],
                    "description": event_node["attrs"].get("description", "") if isinstance(event_node.get("attrs"), dict) else "",
                    "timestamp": event_node["attrs"].get("timestamp", "") if isinstance(event_node.get("attrs"), dict) else "",
                    "provenance": event_node["attrs"].get("provenance", "change_log.csv") if isinstance(event_node.get("attrs"), dict) else "change_log.csv",
                }
                if event_node
                else None,
                "supporting_evidence": evidence_nodes,
            }
        )

    return {
        "kpi": anomaly["kpi_id"],
        "metric_id": anomaly["metric_id"],
        "dimension_scope": anomaly["dimension_scope"],
        "observed_value": anomaly["observed_value"],
        "expected_value": anomaly["expected_value"],
        "z_score": anomaly["z_score"],
        "severity": anomaly["severity"],
        "delta_pct": anomaly["delta_pct"],
        "as_of_date": anomaly["as_of_date"],
        "driver_summary": {
            dim: segs[:3] for dim, segs in driver_result["contributions"].items()
        },
        "ranked_hypotheses": hypothesis_packages,
        "insufficient_evidence_hypotheses": [
            {
                "id": h["id"],
                "statement": h["statement"],
                "evidence_score": h["evidence_score"],
            }
            for h in insufficient
        ],
        "causal_disclaimer": (
            "Evidence scores reflect corroboration strength (temporal alignment, independent sources, "
            "quasi-causal tests), NOT a statistical probability of causation. True causal proof would "
            "require controlled experimentation."
        ),
    }
