"""
Unit tests for Feature 2: 1-Click Executive Briefing & Audit Log Exporter.
"""

import pytest
from app import briefing_exporter, db, decision_memory, orchestrator


@pytest.fixture(autouse=True)
def reset_database():
    db.reset_db()
    from app import data_layer, event_extraction

    event_extraction.extract_events_from_change_log(data_layer.load_change_log())
    yield


def test_sha256_decision_hash_and_verification():
    decision_payload = {
        "id": "decision:test1234",
        "investigation_id": "investigation:inv1234",
        "decided_by": "Senior Operations Analyst",
        "decided_at": "2026-08-15T10:00:00Z",
        "decision": "CONFIRM",
        "justification": "Confirmed payment gateway issue.",
    }

    hash_val = briefing_exporter.calculate_decision_hash(decision_payload)
    assert len(hash_val) == 64  # Valid SHA-256 length
    assert briefing_exporter.verify_decision_hash(decision_payload, hash_val) is True

    # Tamper test
    tampered_payload = dict(decision_payload)
    tampered_payload["justification"] = "Tampered justification"
    assert briefing_exporter.verify_decision_hash(tampered_payload, hash_val) is False


def test_briefing_payload_assembly():
    inv_id = decision_memory.open_investigation(
        "kpi:revenue_North_India_Online_Store", "HIGH"
    )
    payload = briefing_exporter.build_briefing_payload(inv_id)

    assert payload["investigation_id"] == inv_id
    assert len(payload["diagnostic_matrix"]) >= 4
    assert payload["evidence_score_breakdown"]["evidence_score"] > 0
    assert "executive_summary" in payload["dual_persona_narrative"]
    assert "sha256_hash" in payload["human_checkpoint_decision"]
    assert payload["telemetry_and_lineage_proof"]["estimated_cost_usd"] == 0.00


def test_markdown_and_pdf_generation():
    inv_id = decision_memory.open_investigation(
        "kpi:revenue_North_India_Online_Store", "HIGH"
    )
    payload = briefing_exporter.build_briefing_payload(inv_id)

    md_text = briefing_exporter.generate_markdown_briefing(payload)
    assert "# EvidenceIQ.ai — Executive Audit Briefing" in md_text
    assert "SHA-256" in md_text

    pdf_bytes = briefing_exporter.generate_pdf_briefing(payload)
    assert isinstance(pdf_bytes, bytes)
    assert len(pdf_bytes) > 500  # PDF generated
    assert pdf_bytes.startswith(b"%PDF-")


def test_fail_closed_validation():
    with pytest.raises(ValueError, match="INCOMPLETE_EVIDENCE_EXPORT_BLOCKED"):
        briefing_exporter.build_briefing_payload("non_existent_invalid_inv")
