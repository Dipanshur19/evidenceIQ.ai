"""
End-to-end investigation orchestrator wiring together Parts 6-17.
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


def bootstrap_events():
    change_log_df = data_layer.load_change_log()
    return event_extraction.extract_events_from_change_log(change_log_df)


import time
from . import config


def run_investigation(
    region: str,
    channel: str,
    as_of_date: str,
    persona: str | None = "analyst",
    decided_by: str = "system",
) -> dict:
    start_time = time.time()
    persona_str = persona or "analyst"
    bootstrap_events()

    anomaly = anomaly_detection.detect_anomaly(
        {"region": region, "channel": channel}, as_of_date
    )
    if anomaly.get("status") == "insufficient_data":
        return {
            "status": "insufficient_data",
            "message": f"Not enough historical data to establish a baseline for {region}/{channel}.",
            "reason": anomaly.get("reason", "Sparse history"),
        }

    investigation_id = decision_memory.open_investigation(
        anomaly["kpi_id"], anomaly["severity"]
    )

    hypotheses, driver_result, parameters_inspected = (
        hypothesis_engine.generate_hypotheses(anomaly)
    )
    context = graph_retrieval.assemble_context(anomaly, hypotheses, driver_result)

    non_llm_time_ms = round((time.time() - start_time) * 1000, 2)
    llm_start = time.time()

    narrative = llm_narration.generate_narrative(context, persona=persona_str)
    llm_time_ms = round((time.time() - llm_start) * 1000, 2)
    total_time_ms = round((time.time() - start_time) * 1000, 2)

    top_hypothesis = hypotheses[0] if hypotheses else None
    rec = recommendation.generate_recommendation(top_hypothesis, narrative)
    review = (
        human_checkpoint.route_for_review(investigation_id, rec)
        if rec.get("status") != "no_recommendation"
        else None
    )

    # Telemetry & Semantic Contract payload
    metric_key = anomaly.get("metric_id", "metric:revenue")
    contract = config.SEMANTIC_CONTRACTS.get(metric_key, {})

    telemetry = {
        "total_latency_ms": total_time_ms,
        "non_llm_latency_ms": non_llm_time_ms,
        "llm_latency_ms": llm_time_ms,
        "provider": getattr(config, "LLM_PROVIDER", "ollama"),
        "model": getattr(config, "OLLAMA_MODEL", "qwen2.5:1.5b")
        if getattr(config, "LLM_PROVIDER", "") == "ollama"
        else getattr(config, "GEMINI_MODEL", "gemini-1.5-flash"),
        "estimated_tokens": len(str(context)) // 4,
        "estimated_cost_usd": 0.00,  # $0.00 for local Ollama LLM
    }

    return {
        "status": "ok",
        "investigation_id": investigation_id,
        "anomaly": anomaly,
        "driver_result": driver_result,
        "hypotheses": hypotheses,
        "parameters_inspected": parameters_inspected,
        "context": context,
        "narrative": narrative,
        "recommendation": rec,
        "review": review,
        "persona": persona,
        "telemetry": telemetry,
        "semantic_contract": contract,
    }


def scan_and_list_anomalies(as_of_date: str) -> list:
    bootstrap_events()
    return anomaly_detection.scan_all_slices(as_of_date)
