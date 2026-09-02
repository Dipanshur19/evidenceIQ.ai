"""
Test Suite for Phase 3 Roadmap Implementations:
1. Automated CI/CD Rollback Hooks (LaunchDarkly & GitHub Actions)
2. Decision Memory Reinforcement Learning & Dynamic Edge Recalibration
3. Cross-Domain KPI Correlation Engine (Revenue <-> NPS <-> Churn <-> Inventory)
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import (
    db,
    human_checkpoint,
    decision_memory,
    recovery_engine,
    edge_recalibration,
    cross_domain_kpi,
    config,
)


@pytest.fixture(autouse=True)
def init_test_environment():
    db.reset_db()
    cross_domain_kpi.integrate_cross_domain_nodes_in_graph()
    yield


def test_launchdarkly_and_github_rollback_dispatch():
    engine = recovery_engine.recovery_engine
    result = engine.dispatch_rollback(
        decision_id="decision:test_rollback_101",
        action_category="rollback_release",
        target_release="v5.4.0",
        operator_id="lead_sre@evidenceiq.ai",
        reason="Verified 38% checkout timeout surge post-deployment",
    )

    assert result["status"] == "COMPLETED"
    assert result["execution_id"].startswith("exec_rb_")
    assert len(result["audit_hash"]) == 64  # SHA-256 length

    # Validate LaunchDarkly Hook
    ld = result["launchdarkly_hook"]
    assert ld["flag_key"] == "mobile_checkout_v5_4"
    assert ld["toggled_off"] is True
    assert ld["http_code"] == 200

    # Validate GitHub Actions Hook
    gh = result["github_actions_hook"]
    assert gh["repository"] == "enterprise/mobile-checkout-service"
    assert gh["workflow"] == "rollback-deployment.yml"
    assert gh["http_code"] == 204

    # Validate persistence in DB
    history = engine.get_recovery_history(limit=5)
    assert len(history) >= 1
    assert history[0]["id"] == result["execution_id"]
    assert history[0]["operator_id"] == "lead_sre@evidenceiq.ai"

    # Validate Telemetry Verification
    telemetry = engine.verify_rollback_telemetry(result["execution_id"])
    assert telemetry["status"] == "VERIFIED_RESOLVED"
    assert telemetry["verification_status"] == "NORMALIZED"


def test_human_checkpoint_auto_dispatches_rollback():
    inv_id = decision_memory.open_investigation("kpi:revenue_region_a", "HIGH")
    res = human_checkpoint.submit_decision(
        investigation_id=inv_id,
        hypothesis_id="hypothesis:checkout_flow_v5_4",
        recommendation_id="rec:rollback_checkout_v5_4",
        decided_by="operations_director@evidenceiq.ai",
        decision="confirm",
        justification="Human sign-off on automated CI/CD rollback",
        auto_dispatch_rollback=True,
    )

    assert res["status"] == "recorded"
    assert "recovery_dispatch" in res
    assert res["recovery_dispatch"]["status"] == "COMPLETED"
    assert res["recovery_dispatch"]["launchdarkly_hook"]["toggled_off"] is True


def test_rl_edge_recalibration_positive_and_negative_reward():
    from app.edge_recalibration import edge_recalibration_engine

    # Seed an active hypothesis and edge
    now = "2026-08-15T12:00:00Z"
    db.upsert_node(
        "hypothesis:checkout_flow_v5_4",
        "Hypothesis",
        {"statement": "Payment gateway timeout on v5.4 release"},
        now,
    )
    with db.get_conn() as conn:
        conn.execute(
            """INSERT INTO graph_edge (edge_type, from_id, to_id, confidence, methodology, provenance, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            ("PRECEDES", "event:mobile_app_release_v5_4", "hypothesis:checkout_flow_v5_4", 0.70, "temporal_alignment", "test", now),
        )

    # 1. Test Positive Outcome Reinforcement (Hypothesis confirmed)
    dec_id = "decision:test_rl_confirm"
    with db.get_conn() as conn:
        conn.execute(
            "INSERT INTO decision (id, hypothesis_id, decision, decided_at) VALUES (?, ?, ?, ?)",
            (dec_id, "hypothesis:checkout_flow_v5_4", "confirm", now),
        )

    pos_result = edge_recalibration_engine.recalibrate_from_outcome(
        decision_id=dec_id,
        hypothesis_confirmed=True,
        kpi_delta=-35.5,
        expected_recovery=35.0,
    )

    assert pos_result["status"] == "recalibrated"
    assert pos_result["reward_signal"] >= 0.8
    assert pos_result["reward_type"] == "POSITIVE_REINFORCEMENT"
    assert pos_result["edges_recalibrated_count"] >= 1

    # Edge weight should have increased
    first_edge = pos_result["recalibrated_edges"][0]
    assert first_edge["new_weight"] > first_edge["old_weight"]

    # 2. Test Negative Outcome Reinforcement (Hypothesis disconfirmed)
    neg_result = edge_recalibration_engine.recalibrate_from_outcome(
        decision_id=dec_id,
        hypothesis_confirmed=False,
        kpi_delta=0.0,
    )

    assert neg_result["reward_signal"] < 0
    assert neg_result["reward_type"] == "NEGATIVE_REINFORCEMENT"

    # History validation
    history = edge_recalibration_engine.get_recalibration_history(limit=10)
    assert len(history) >= 2


def test_cross_domain_kpi_correlation_matrix():
    matrix_res = cross_domain_kpi.compute_correlation_matrix("Region_A")
    assert matrix_res["status"] == "success"
    assert len(matrix_res["domains"]) == 5
    assert len(matrix_res["matrix"]) == 5
    assert len(matrix_res["matrix"][0]) == 5

    # Validate Strong Inverse Correlation: Support Tickets vs Customer NPS
    cells = {f"{c['source']}_{c['target']}": c["correlation"] for c in matrix_res["cells"]}
    assert cells["tickets_nps"] <= -0.80

    # Validate Strong Direct Correlation: Revenue vs Inventory Turnover
    assert cells["revenue_inventory"] >= 0.70

    # Validate Strong Inverse Correlation: NPS vs Churn
    assert cells["nps_churn"] <= -0.80


def test_cross_domain_lead_lag_cascades():
    lead_lag_res = cross_domain_kpi.compute_lead_lag_analysis("Region_A")
    assert lead_lag_res["status"] == "success"
    assert len(lead_lag_res["cascades"]) >= 3

    # Check that Support Tickets lead NPS collapse
    ticket_cascade = next(c for c in lead_lag_res["cascades"] if "Ticket" in c["leading_kpi"])
    assert ticket_cascade["lead_time_days"] >= 1
    assert ticket_cascade["peak_cross_correlation"] < -0.85


def test_cross_domain_semantic_contracts_and_graph_nodes():
    contracts = config.get_raw_yaml_contracts()
    metrics = contracts.get("metrics", {})

    # Ensure all 3 Phase 3 metrics are governed in semantic contracts
    assert "metric:nps" in metrics
    assert "metric:churn" in metrics
    assert "metric:inventory_turnover" in metrics

    assert metrics["metric:nps"]["owner_team"] == "cx_team"
    assert metrics["metric:churn"]["owner_team"] == "growth_team"
    assert metrics["metric:inventory_turnover"]["owner_team"] == "supply_chain"

    # Check Graph Store Nodes
    nps_node = db.get_node("kpi:nps")
    churn_node = db.get_node("kpi:churn")
    inv_node = db.get_node("kpi:inventory_turnover")

    assert nps_node is not None
    assert churn_node is not None
    assert inv_node is not None
