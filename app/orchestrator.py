"""
End-to-end Investigation Orchestrator (Round 2):
Wires together all pipeline stages with explicit method_type labeling,
cold-start fallback, structured abstention, Shapley attribution,
RBAC enforcement, enhanced telemetry, and feedback loop integration.

Pipeline stages (each labeled with method_type):
1. Event bootstrap → deterministic_business_rules
2. Anomaly detection → statistics_zscore + statistics_cusum
3. Cold-start check → statistics_shrinkage_estimation (if sparse)
4. Hypothesis generation → statistics_evidence_scoring
5. Shapley attribution → statistics_shapley_values
6. Context assembly → deterministic_retrieval
7. LLM narration → llm_narration (or deterministic_template_fallback)
8. Recommendation → deterministic_business_rules
9. Human checkpoint → deterministic_business_rules
10. Telemetry logging → deterministic_business_rules
"""

from . import data_layer, event_extraction, anomaly_detection, hypothesis_engine
from . import (
    graph_retrieval,
    llm_narration,
    recommendation,
    human_checkpoint,
    decision_memory,
    db,
)

import time
from . import config


def bootstrap_events():
    change_log_df = data_layer.load_change_log()
    return event_extraction.extract_events_from_change_log(change_log_df)


def run_investigation(
    region: str,
    channel: str,
    as_of_date: str,
    persona: str | None = "analyst",
    decided_by: str = "system",
    user_id: str = "analyst@evidenceiq.ai",
) -> dict:
    start_time = time.time()
    persona_str = persona or "analyst"
    bootstrap_events()

    # Stage 1: Anomaly Detection (statistics_zscore + statistics_cusum)
    anomaly = anomaly_detection.detect_anomaly(
        {"region": region, "channel": channel}, as_of_date
    )
    if anomaly.get("status") == "insufficient_data":
        return {
            "status": "insufficient_data",
            "message": f"Not enough historical data to establish a baseline for {region}/{channel}.",
            "reason": anomaly.get("reason", "Sparse history"),
            "method_type": "statistics_zscore",
        }

    investigation_id = decision_memory.open_investigation(
        anomaly["kpi_id"], anomaly["severity"]
    )

    # Stage 2: Cold-start check (statistics_shrinkage_estimation)
    cold_start_result = None
    if anomaly.get("is_sparse_history", False):
        try:
            from . import cold_start_forecast
            cold_start_result = cold_start_forecast.shrinkage_forecast(
                {"region": region, "channel": channel}, as_of_date
            )
        except Exception:
            cold_start_result = {
                "status": "cold_start_not_available",
                "method_type": "statistics_shrinkage_estimation",
            }

    # Stage 3: Hypothesis Generation (statistics_evidence_scoring)
    hypotheses, driver_result, parameters_inspected = (
        hypothesis_engine.generate_hypotheses(anomaly)
    )

    # Stage 4: Shapley Attribution (statistics_shapley_values)
    shapley_result = None
    try:
        from . import driver_analysis
        window_start = str(
            (__import__("pandas").Timestamp(as_of_date) - __import__("pandas").Timedelta(days=14)).date()
        )
        shapley_result = driver_analysis.shapley_attribution(window_start, as_of_date)
    except Exception:
        shapley_result = {"status": "shapley_computation_failed", "method_type": "statistics_shapley_values"}

    # Stage 5: Context Assembly (deterministic_retrieval)
    context = graph_retrieval.assemble_context(anomaly, hypotheses, driver_result)

    # Stage 6: Abstention Check (deterministic_abstention_logic)
    abstention_result = None
    if hypotheses:
        top_hyp = hypotheses[0]
        scoring_breakdown = top_hyp.get("scoring_breakdown", {})
        abstention_info = scoring_breakdown  # Already includes abstention from evidence_scoring
        if top_hyp.get("confidence_band") == "INSUFFICIENT_EVIDENCE":
            abstention_result = {
                "should_abstain": True,
                "message": (
                    f"I'm not confident in the driver attribution for {anomaly['kpi_id']}. "
                    f"The top hypothesis scored {top_hyp.get('evidence_score', 0):.3f} "
                    f"(band: {top_hyp.get('confidence_band')}). "
                    f"Here's what evidence exists, what's missing, and what would resolve it."
                ),
                "existing_evidence": [h["statement"] for h in hypotheses[:2]],
                "missing_evidence": [
                    "Additional independent data sources",
                    "Control group comparison data",
                    "Extended baseline history"
                ],
                "resolution_suggestions": [
                    "Import API gateway error logs or APM traces",
                    "Extend observation window to 21+ days",
                    "Verify event timestamps against system deployment logs"
                ],
                "method_type": "deterministic_abstention_logic",
            }
    elif not hypotheses:
        abstention_result = {
            "should_abstain": True,
            "message": (
                f"No hypotheses could be generated for {anomaly['kpi_id']}. "
                "The evidence graph contains no matching events in the investigation window. "
                "Abstaining from attribution — requesting additional data sources."
            ),
            "existing_evidence": [],
            "missing_evidence": ["Change log events", "Support ticket correlation", "Deployment records"],
            "resolution_suggestions": [
                "Check if change log entries exist for this region/channel",
                "Review recent deployments or configuration changes",
                "Expand the investigation time window"
            ],
            "method_type": "deterministic_abstention_logic",
        }

    non_llm_time_ms = round((time.time() - start_time) * 1000, 2)
    llm_start = time.time()

    # Stage 7: LLM Narration (llm_narration or deterministic_template_fallback)
    narrative = llm_narration.generate_narrative(context, persona=persona_str)
    llm_time_ms = round((time.time() - llm_start) * 1000, 2)
    total_time_ms = round((time.time() - start_time) * 1000, 2)

    # Stage 8: Recommendation (deterministic_business_rules)
    top_hypothesis = hypotheses[0] if hypotheses else None
    rec = recommendation.generate_recommendation(top_hypothesis, narrative)

    # Stage 9: Human Checkpoint (deterministic_business_rules)
    review = (
        human_checkpoint.route_for_review(investigation_id, rec)
        if rec.get("status") != "no_recommendation"
        else None
    )

    # Stage 10: Telemetry (deterministic_business_rules)
    metric_key = anomaly.get("metric_id", "metric:revenue")
    contract = config.SEMANTIC_CONTRACTS.get(metric_key, {})

    # Enhanced telemetry with token counting and cost estimation
    provider = getattr(config, "LLM_PROVIDER", "ollama")
    model = (
        getattr(config, "OLLAMA_MODEL", "qwen2.5:1.5b")
        if provider == "ollama"
        else getattr(config, "GEMINI_MODEL", "gemini-2.0-flash")
    )
    input_tokens = len(str(context)) // 4
    output_tokens = len(str(narrative)) // 4
    total_tokens = input_tokens + output_tokens

    # Cost estimation
    try:
        from . import telemetry as telem
        cost_info = telem.compute_cost(model, input_tokens, output_tokens)
        telem.log_telemetry(
            investigation_id, model, provider,
            str(context), str(narrative), llm_time_ms
        )
    except Exception:
        cost_info = 0.0

    telemetry = {
        "total_latency_ms": total_time_ms,
        "non_llm_latency_ms": non_llm_time_ms,
        "llm_latency_ms": llm_time_ms,
        "provider": provider,
        "model": model,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "total_tokens": total_tokens,
        "estimated_cost_usd": cost_info if isinstance(cost_info, float) else 0.0,
        "cache_hit": False,
        "method_type": "deterministic_business_rules",
    }

    # Similar historical investigations (feedback loop)
    similar_investigations = []
    try:
        from . import feedback_loop
        similar_investigations = feedback_loop.find_similar_investigations(
            anomaly["kpi_id"], anomaly["severity"], top_k=3
        )
    except Exception:
        pass

    # Pipeline stage labels (Gap 11)
    pipeline_stages = [
        {"stage": "Event Bootstrap", "method_type": "deterministic_business_rules", "method": "Change log extraction + entity resolution"},
        {"stage": "Anomaly Detection", "method_type": "statistics_zscore + statistics_cusum", "method": "Z-score against rolling baseline + CUSUM change-point"},
        {"stage": "Cold-Start Check", "method_type": "statistics_shrinkage_estimation", "method": "Similarity-based shrinkage forecast (if sparse history)"},
        {"stage": "Hypothesis Generation", "method_type": "statistics_evidence_scoring", "method": "6-factor evidence scoring with configurable weights"},
        {"stage": "Driver Attribution", "method_type": "statistics_shapley_values + statistics_contribution_decomposition", "method": "Shapley values + counterfactual decomposition"},
        {"stage": "Context Assembly", "method_type": "deterministic_retrieval", "method": "Graph-first structured evidence retrieval"},
        {"stage": "Narration", "method_type": narrative.get("generation_method", "llm_narration"), "method": "LLM narrates pre-computed evidence (or deterministic template fallback)"},
        {"stage": "Recommendation", "method_type": "deterministic_business_rules", "method": "Action-risk table gating with 7-part schema"},
        {"stage": "Human Checkpoint", "method_type": "deterministic_business_rules", "method": "Always-route-to-review with decision memory"},
        {"stage": "Telemetry", "method_type": "deterministic_business_rules", "method": "Token counting, cost estimation, cache tracking"},
    ]

    return {
        "status": "ok",
        "investigation_id": investigation_id,
        "anomaly": anomaly,
        "driver_result": driver_result,
        "shapley_attribution": shapley_result,
        "hypotheses": hypotheses,
        "parameters_inspected": parameters_inspected,
        "context": context,
        "narrative": narrative,
        "recommendation": rec,
        "review": review,
        "persona": persona,
        "telemetry": telemetry,
        "semantic_contract": contract,
        "cold_start_forecast": cold_start_result,
        "abstention": abstention_result,
        "similar_investigations": similar_investigations,
        "pipeline_stages": pipeline_stages,
    }


def scan_and_list_anomalies(as_of_date: str) -> list:
    bootstrap_events()
    return anomaly_detection.scan_all_slices(as_of_date)
