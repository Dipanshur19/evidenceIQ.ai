"""
Smoke tests for the EvidenceIQ.ai pipeline. Run with: pytest -q
Validates the deterministic pipeline end-to-end using Rossmann & sample datasets.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from app import (
    db,
    orchestrator,
    anomaly_detection,
    hypothesis_engine,
    data_layer,
    event_extraction,
)


@pytest.fixture(autouse=True)
def reset_database():
    db.reset_db()
    event_extraction.extract_events_from_change_log(data_layer.load_change_log())
    yield


def test_anomaly_detection_finds_disruption():
    anomaly = anomaly_detection.detect_anomaly({"store": 101}, "2026-08-15")
    assert anomaly.get("status") != "insufficient_data"
    assert anomaly["delta_pct"] < -20  # Store 101 disruption event


def test_events_extracted_from_change_log():
    created = event_extraction.extract_events_from_change_log(
        data_layer.load_change_log()
    )
    assert len(created) == 3
    assert "event:mobile_app_release_v5_4" in created


def test_hypothesis_engine_surfaces_top_cause():
    event_extraction.extract_events_from_change_log(data_layer.load_change_log())
    anomaly = anomaly_detection.detect_anomaly({"store": 101}, "2026-08-15")
    hypotheses, driver_result, parameters_inspected = (
        hypothesis_engine.generate_hypotheses(anomaly)
    )
    assert len(hypotheses) > 0
    assert len(parameters_inspected["parameters"]) > 0


def test_full_orchestrator_pipeline():
    result = orchestrator.run_investigation("Region_A", "Store_101", "2026-08-15")
    assert result["status"] == "ok"
    assert "narrative" in result
    assert "what_happened" in result["narrative"]
    assert "recommendation" in result


def test_insufficient_data_handled_gracefully():
    result = orchestrator.run_investigation("Region_A", "Store_101", "2026-06-02")
    assert result["status"] == "insufficient_data"


def test_persona_and_telemetry_support():
    exec_result = orchestrator.run_investigation(
        "Region_A", "Store_101", "2026-08-15", persona="executive"
    )
    assert exec_result["status"] == "ok"
    assert exec_result["persona"] == "executive"
    assert "telemetry" in exec_result
    assert exec_result["telemetry"]["total_latency_ms"] >= 0
    assert "semantic_contract" in exec_result


def test_sparse_history_handling():
    result = orchestrator.run_investigation("Sparse_Region", "Store_999", "2026-08-15")
    assert result["status"] == "insufficient_data"
    assert "reason" in result
