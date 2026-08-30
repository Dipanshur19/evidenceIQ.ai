"""
Evidence Scoring Engine (Part 12, MVP: historical-precedent term dropped).
"""

from . import config


def score_hypothesis(
    correlation_strength: float,
    temporal_alignment: float,
    independent_source_count: int,
    quasi_causal_evidence: float,
    contradiction_penalty: float = 0.0,
    data_quality_penalty: float = 0.0,
) -> dict:
    w = config.EVIDENCE_WEIGHTS
    corroboration_score = min(independent_source_count / 3.0, 1.0)

    raw_score = (
        w["correlation_strength"] * correlation_strength
        + w["temporal_alignment"] * temporal_alignment
        + w["independent_corroboration"] * corroboration_score
        + w["quasi_causal_evidence"] * quasi_causal_evidence
        - w["contradiction_penalty"] * contradiction_penalty
        - w["data_quality_penalty"] * data_quality_penalty
    )
    score = max(0.0, min(1.0, raw_score))

    if score >= config.CONFIDENCE_BANDS["HIGH"]:
        band = "HIGH"
    elif score >= config.CONFIDENCE_BANDS["MEDIUM"]:
        band = "MEDIUM"
    elif score >= config.CONFIDENCE_BANDS["LOW"]:
        band = "LOW"
    else:
        band = "INSUFFICIENT_EVIDENCE"

    return {
        "evidence_score": round(score, 3),
        "confidence_band": band,
        "breakdown": {
            "correlation_strength": correlation_strength,
            "temporal_alignment": temporal_alignment,
            "independent_corroboration": round(corroboration_score, 3),
            "independent_source_count": independent_source_count,
            "quasi_causal_evidence": quasi_causal_evidence,
            "contradiction_penalty": contradiction_penalty,
            "data_quality_penalty": data_quality_penalty,
        },
        "weights_used": w,
        "note": "Confidence score reflects evidence corroboration strength, NOT a statistical probability of causality.",
    }
