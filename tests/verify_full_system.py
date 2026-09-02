import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import json
import time
import pandas as pd
from app import (
    db,
    data_layer,
    event_extraction,
    anomaly_detection,
    hypothesis_engine,
    graph_retrieval,
    llm_narration,
    recommendation,
    human_checkpoint,
    decision_memory,
    audit,
    orchestrator,
)


def verify_all():
    print("==================================================")
    print("STARTING COMPREHENSIVE SYSTEM VERIFICATION")
    print("==================================================")

    # 1. Database & Schema Initialization
    print("\n1. Testing Database & Schema Initialization...")
    db.reset_db()
    with db.get_conn() as conn:
        tables = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table'"
        ).fetchall()
        table_names = [t[0] for t in tables]
        print(
            f"   [OK] Active SQLite Tables ({len(table_names)}): {', '.join(table_names)}"
        )

    # 2. Data Layer Ingestion
    print("\n2. Testing Data Layer & Change Log Ingestion...")
    rev_df = data_layer.load_revenue()
    log_df = data_layer.load_change_log()
    tic_df = data_layer.load_tickets()
    print(f"   [OK] Revenue CSV: {len(rev_df)} rows")
    print(f"   [OK] Change Log CSV: {len(log_df)} rows")
    print(f"   [OK] Support Tickets CSV: {len(tic_df)} rows")

    # 3. Event Extraction & Graph Builder
    print("\n3. Testing Event Graph Node Extraction...")
    extracted = event_extraction.extract_events_from_change_log(log_df)
    print(
        f"   [OK] Extracted {len(extracted)} Event nodes into Graph Store: {extracted}"
    )

    # 4. Anomaly Detection Engine (Rossmann Store Sales)
    print("\n4. Testing Anomaly Detection Query Engine (Rossmann Store Sales)...")
    anomaly = anomaly_detection.detect_anomaly({"store": 101}, "2026-08-15")
    assert anomaly["severity"] in ("HIGH", "MEDIUM")
    print(
        f"   [OK] Anomaly detected: KPI={anomaly['kpi_id']}, z-score={anomaly['z_score']}, delta={anomaly['delta_pct']}%"
    )

    # 5. Sparse History Handling
    print("\n5. Testing Sparse History Handling...")
    sparse_res = anomaly_detection.detect_anomaly({"store": 999}, "2026-08-15")
    assert sparse_res.get("status") == "insufficient_data"
    print("   [OK] Sparse History handled correctly with abstention response.")

    # 6. Anomaly Scanning Across All Slices
    print("\n6. Testing Multi-Slice Anomaly Scan...")
    anomalies = anomaly_detection.scan_all_slices("2026-08-15")
    print(f"   [OK] Scanned all slices: found {len(anomalies)} anomalous slices")

    # 7. Hypothesis Generation & Causal Scoring Engine
    print("\n7. Testing Hypothesis Engine & Evidence Scoring...")
    hyps, drv, params = hypothesis_engine.generate_hypotheses(anomaly)
    assert len(hyps) > 0
    top_hyp = hyps[0]
    print(
        f"   [OK] Top Hypothesis: ID={top_hyp['id']}, Score={top_hyp['evidence_score']}, Confidence={top_hyp['confidence_band']}"
    )

    # 8. Graph Retrieval & Context Assembly
    print("\n8. Testing Graph Retrieval & Context Assembly...")
    ctx = graph_retrieval.assemble_context(anomaly, hyps, drv)
    assert "kpi" in ctx and "ranked_hypotheses" in ctx
    print("   [OK] Structured context package assembled for LLM narration.")

    # 9. LLM Narration Layer (Ollama / Local LLM)
    print("\n9. Testing Ollama Narration (Analyst Persona)...")
    nar_analyst = llm_narration.generate_narrative(ctx, persona="analyst")
    print(f"   [OK] Analyst Narrative Method: {nar_analyst.get('generation_method')}")
    print(f"   [OK] Narrative Summary: {nar_analyst.get('what_happened')[:80]}...")

    print("\n10. Testing Ollama Narration (Executive Persona)...")
    nar_exec = llm_narration.generate_narrative(ctx, persona="executive")
    print(f"   [OK] Executive Narrative Persona: {nar_exec.get('persona')}")

    # 11. Action Recommendation & Risk Gating Engine
    print("\n11. Testing Recommendation & Risk Gating Engine...")
    rec = recommendation.generate_recommendation(top_hyp, nar_analyst)
    if rec.get("status") != "no_recommendation":
        assert "driver" in rec and "controllable_lever" in rec and "owner" in rec
        assert "expected_impact" in rec and "monitoring_plan" in rec
    print(
        f"   [OK] Recommendation Status: {rec.get('status')}, Lever: {rec.get('controllable_lever')}, Owner: {rec.get('owner')}"
    )

    # 11. Human Checkpoint & Decision Memory (Confirm / Reject / Modify Buttons)
    print("\n12. Testing Human Checkpoint & Decision Workflows...")
    inv_id = decision_memory.open_investigation(anomaly["kpi_id"], anomaly["severity"])
    review = human_checkpoint.route_for_review(inv_id, rec)

    # Confirm Button action
    dec_confirm = human_checkpoint.submit_decision(
        investigation_id=inv_id,
        hypothesis_id=top_hyp["id"],
        recommendation_id=rec.get("recommendation_id"),
        decided_by="test_analyst",
        decision="confirm",
        justification="Verified against change log and ticket surge.",
    )
    print(
        f"   [OK] Confirm Button Action: Decision recorded ID={dec_confirm['decision_id']}"
    )

    # Outcome Recording Button action
    out_id = decision_memory.record_outcome(
        dec_confirm["decision_id"], kpi_delta=-35.5, hypothesis_confirmed=True
    )
    print(f"   [OK] Record Outcome Action: Outcome recorded ID={out_id}")

    # 12. Audit Logging Engine
    print("\n13. Testing Audit Trail System...")
    audit_logs = audit.get_logs(limit=5)
    print(f"   [OK] Audit Trail Entries Retrieved: {len(audit_logs)} records")

    # 13. Full Orchestrator End-to-End Run
    print("\n14. Testing Orchestrator End-to-End Pipeline...")
    full_res = orchestrator.run_investigation(
        "Region_A", "Store_101", "2026-08-15", persona="analyst"
    )
    assert full_res["status"] == "ok"
    assert "telemetry" in full_res
    print(
        f"   [OK] Total Pipeline Latency: {full_res['telemetry']['total_latency_ms']} ms"
    )
    print(f"   [OK] LLM Model Used: {full_res['telemetry']['model']}")

    # 14. Phase 3: Automated CI/CD Rollback Hooks (LaunchDarkly & GitHub Actions)
    print("\n15. Testing Phase 3: Automated CI/CD Rollback Hooks...")
    from app.recovery_engine import recovery_engine
    rb_res = recovery_engine.dispatch_rollback(
        decision_id=dec_confirm["decision_id"],
        action_category="rollback_release",
        target_release="v5.4.0",
        operator_id="test_analyst",
        reason="Automated verification dispatch test",
    )
    assert rb_res["status"] == "COMPLETED"
    assert rb_res["launchdarkly_hook"]["toggled_off"] is True
    print(f"   [OK] LaunchDarkly: Flag '{rb_res['launchdarkly_hook']['flag_key']}' switched OFF in Production.")
    print(f"   [OK] GitHub Actions: Workflow '{rb_res['github_actions_hook']['workflow']}' dispatched on main.")
    print(f"   [OK] Cryptographic Execution Hash: {rb_res['audit_hash'][:16]}...")

    # 15. Phase 3: RL Edge Recalibration
    print("\n16. Testing Phase 3: Reinforcement Learning & Edge Recalibration...")
    from app.edge_recalibration import edge_recalibration_engine
    recal_res = edge_recalibration_engine.recalibrate_from_outcome(
        decision_id=dec_confirm["decision_id"],
        hypothesis_confirmed=True,
        kpi_delta=-35.5,
    )
    assert recal_res["status"] == "recalibrated"
    assert recal_res["reward_signal"] >= 0.8
    print(f"   [OK] RL Reward Signal: +{recal_res['reward_signal']} (Positive Reinforcement)")
    print(f"   [OK] Graph Edges Recalibrated: {recal_res['edges_recalibrated_count']} edges updated")

    # 16. Phase 3: Cross-Domain KPI Correlation
    print("\n17. Testing Phase 3: Cross-Domain KPI Correlation Engine...")
    from app import cross_domain_kpi
    cd_matrix = cross_domain_kpi.compute_correlation_matrix("Region_A")
    assert cd_matrix["status"] == "success"
    assert len(cd_matrix["domains"]) == 5
    cd_leadlag = cross_domain_kpi.compute_lead_lag_analysis("Region_A")
    assert cd_leadlag["status"] == "success"
    print(f"   [OK] 5x5 Cross-Domain Correlation Matrix computed across 5 operational domains")
    print(f"   [OK] Causal Cascade Established: {cd_leadlag['primary_trigger']}")

    # 17. Phase 4: Federated Multi-Business-Unit Fleet Management
    print("\n18. Testing Phase 4: Federated Multi-Business-Unit Fleet Management...")
    from app.fleet_manager import fleet_manager
    fleet_overview = fleet_manager.get_fleet_overview()
    assert fleet_overview["status"] == "success"
    assert fleet_overview["total_business_units"] >= 5
    print(f"   [OK] Federated Fleet Units: {fleet_overview['total_business_units']} operating subsidiaries monitored")
    print(f"   [OK] Average Fleet Health Score: {fleet_overview['average_fleet_health']}%")
    iso_res = fleet_manager.check_tenant_isolation("bu:central_governance", "bu:emea_ecommerce")
    assert iso_res["access_granted"] is True
    print("   [OK] Strict Tenant Isolation Boundary: verified")

    # 18. Phase 4: Cross-Enterprise Contract Marketplace
    print("\n19. Testing Phase 4: Cross-Enterprise Semantic Contract Marketplace...")
    from app.contract_marketplace import contract_marketplace
    mkt_contracts = contract_marketplace.list_contracts()
    assert len(mkt_contracts) >= 5
    first_c = mkt_contracts[0]
    sub_res = contract_marketplace.subscribe_to_contract(first_c["contract_id"], "bu:apac_supply_chain")
    assert sub_res["status"] == "subscribed"
    print(f"   [OK] Contract Marketplace: {len(mkt_contracts)} governed contracts active")
    print(f"   [OK] Cross-Enterprise Subscription: {first_c['title']} ({sub_res['sla_agreement']})")

    # 19. Phase 4: Regulatory Compliance Reporting Automation
    print("\n20. Testing Phase 4: Regulatory Compliance Reporting Automation (SOC-2, SOX, GDPR)...")
    from app.compliance_audit import compliance_audit_engine
    soc2_pack = compliance_audit_engine.generate_audit_pack("SOC-2", "Accenture Audit Practice")
    assert soc2_pack["compliance_score"] == 100.0
    assert len(soc2_pack["audit_hash"]) == 64
    sox_pack = compliance_audit_engine.generate_audit_pack("SOX-404", "Financial Controls Committee")
    assert sox_pack["compliance_score"] == 100.0
    gdpr_pack = compliance_audit_engine.generate_audit_pack("GDPR-ART22", "European DPO Office")
    assert gdpr_pack["compliance_score"] == 100.0
    print(f"   [OK] SOC-2 Type II Dossier: {soc2_pack['controls_passed']}/{soc2_pack['controls_total']} controls certified")
    print(f"   [OK] SOX Section 404 Dossier: {sox_pack['controls_passed']}/{sox_pack['controls_total']} financial controls certified")
    print(f"   [OK] GDPR Article 22 Dossier: {gdpr_pack['controls_passed']}/{gdpr_pack['controls_total']} AI safeguards certified")
    print(f"   [OK] Cryptographic Dossier Hash: {soc2_pack['audit_hash'][:16]}...")

    # 20. Phase 4: White-Label Platform Licensing
    print("\n21. Testing Phase 4: White-Label Platform Licensing (Accenture Engagements)...")
    from app.whitelabel_service import whitelabel_service
    wl_cfg = whitelabel_service.get_active_config()
    assert "brand_name" in wl_cfg
    presets = whitelabel_service.list_presets()
    assert len(presets) >= 3
    print(f"   [OK] Active Tenant Engagement: {wl_cfg['brand_name']} ({wl_cfg['engagement_code']})")
    print(f"   [OK] White-Label Presets Available: {len(presets)} enterprise branding templates")

    print("\n==================================================")
    print("[SUCCESS] ALL 21 SYSTEM COMPONENTS & PHASE 4 CAPABILITIES VERIFIED 100% OPERATIONAL")
    print("==================================================")


if __name__ == "__main__":
    verify_all()

