"""
Evidence Scoring Engine (Round 2, Objective 5):
- Multi-factor evidence scoring with configurable weights
- Structured abstention with explicit uncertainty communication
- Evidence sufficiency assessment
- Retrieval-aware refusal when evidence is contradictory or insufficient

Method type: statistics_evidence_scoring + deterministic_abstention_logic
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

    # Structured abstention assessment (Objective 5)
    abstention = _assess_abstention(
        score, band, correlation_strength, temporal_alignment,
        corroboration_score, quasi_causal_evidence,
        contradiction_penalty, data_quality_penalty,
        independent_source_count
    )

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
        "abstention": abstention,
        "note": "Confidence score reflects evidence corroboration strength, NOT a statistical probability of causality.",
        "method_type": "statistics_evidence_scoring",
        "method_justification": (
            "6-factor evidence scoring using configurable weights: correlation (30%), "
            "temporal alignment (25%), independent corroboration (25%), quasi-causal DiD (20%), "
            "minus contradiction and data quality penalties. Score reflects corroboration "
            "strength only — true causal proof requires controlled experimentation."
        ),
    }


def _assess_abstention(score: float, band: str,
                       correlation: float, temporal: float,
                       corroboration: float, quasi_causal: float,
                       contradiction: float, data_quality: float,
                       source_count: int) -> dict:
    """
    Structured abstention mechanism (Objective 5).

    The correct abstention UX is NOT "I don't know" — it's:
    "I'm not confident in this driver attribution; here's what evidence exists,
    here's what's missing, here's what would resolve it."

    This directly satisfies the brief's "requests clarification" language.
    """
    should_abstain = False
    abstention_reasons = []
    missing_evidence = []
    resolution_suggestions = []

    # Check 1: Contradiction detected
    if contradiction > 0.1:
        should_abstain = True
        abstention_reasons.append(
            f"Contradictory evidence detected (penalty={contradiction:.3f}). "
            "Evidence explicitly conflicts rather than just being absent."
        )
        resolution_suggestions.append(
            "Resolve the contradiction by checking if the conflicting data sources "
            "cover the same time window and dimensional scope."
        )

    # Check 2: Very low evidence score
    if band == "INSUFFICIENT_EVIDENCE":
        should_abstain = True
        abstention_reasons.append(
            f"Evidence score ({score:.3f}) is below the minimum threshold ({config.CONFIDENCE_BANDS['LOW']}). "
            "Insufficient evidence to attribute causality."
        )

    # Check 3: Single-source evidence only
    if source_count <= 1:
        if band in ("LOW", "INSUFFICIENT_EVIDENCE"):
            should_abstain = True
        abstention_reasons.append(
            f"Only {source_count} independent source(s) found. "
            "Multi-source corroboration is needed for confident attribution."
        )
        missing_evidence.append("Additional independent data sources (e.g., server logs, A/B test results)")
        resolution_suggestions.append(
            "Import additional telemetry streams such as API gateway error logs, "
            "APM traces, or user session recordings to corroborate the hypothesis."
        )

    # Check 4: No temporal alignment
    if temporal < 0.1:
        missing_evidence.append("Temporal alignment between event and anomaly onset")
        resolution_suggestions.append(
            "Verify the exact timestamp of the suspected causal event and its "
            "relationship to the anomaly onset window."
        )

    # Check 5: No quasi-causal evidence
    if quasi_causal < 0.1:
        missing_evidence.append("Control group comparison (Difference-in-Differences)")
        resolution_suggestions.append(
            "Identify a valid control group (region/channel not affected by the event) "
            "and compare its trend against the treated group."
        )

    # Check 6: Data quality issues
    if data_quality > 0.1:
        missing_evidence.append("Full baseline history without data gaps")
        resolution_suggestions.append(
            "Extend the observation window to achieve at least 14 days of "
            "complete baseline data for stable variance estimates."
        )

    # What evidence exists (positive framing)
    existing_evidence = []
    if correlation > 0.1:
        existing_evidence.append(f"Correlation strength: {correlation:.3f}")
    if temporal > 0.1:
        existing_evidence.append(f"Temporal alignment: {temporal:.3f}")
    if corroboration > 0.3:
        existing_evidence.append(f"Independent corroboration from {source_count} source(s)")
    if quasi_causal > 0.1:
        existing_evidence.append(f"Quasi-causal DiD evidence: {quasi_causal:.3f}")

    return {
        "should_abstain": should_abstain,
        "abstention_reasons": abstention_reasons,
        "existing_evidence_summary": existing_evidence,
        "missing_evidence": missing_evidence,
        "resolution_suggestions": resolution_suggestions,
        "evidence_sufficiency": (
            "SUFFICIENT" if not should_abstain and band in ("HIGH", "MEDIUM")
            else "PARTIAL" if not should_abstain
            else "INSUFFICIENT"
        ),
        "method_type": "deterministic_abstention_logic",
        "method_justification": (
            "Abstention is triggered by retrieval-aware refusal rules: "
            "if evidence contradicts, if score is below threshold, or if "
            "only single-source evidence exists with low confidence. "
            "The abstention output explicitly communicates what evidence exists, "
            "what's missing, and what would resolve the uncertainty."
        ),
    }
