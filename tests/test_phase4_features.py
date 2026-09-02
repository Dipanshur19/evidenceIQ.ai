"""
Test Suite for Phase 4 Roadmap Implementations:
1. Federated Multi-Business-Unit Fleet Management & Tenant Isolation
2. Cross-Enterprise Semantic Contract Marketplace
3. Regulatory Compliance Reporting Automation (SOC-2 Type II, SOX 404, GDPR Art. 22)
4. White-Label Platform Licensing for Accenture Engagements
"""

import sys
import os
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import (
    db,
    fleet_manager,
    contract_marketplace,
    compliance_audit,
    whitelabel_service,
)


@pytest.fixture(autouse=True)
def reset_database_environment():
    db.reset_db()
    fleet_manager.fleet_manager.ensure_default_units_seeded()
    contract_marketplace.contract_marketplace.ensure_default_contracts_seeded()
    compliance_audit.compliance_audit_engine.ensure_initial_audit_packs()
    whitelabel_service.whitelabel_service.ensure_default_config_seeded()
    yield


def test_federated_fleet_overview_and_units():
    manager = fleet_manager.fleet_manager
    overview = manager.get_fleet_overview()

    assert overview["status"] == "success"
    assert overview["total_business_units"] >= 5
    assert overview["average_fleet_health"] > 70.0
    assert overview["total_governed_kpis"] >= 100
    assert overview["total_revenue_at_risk_usd"] >= 400000.0

    units = manager.list_business_units()
    assert len(units) >= 5
    na_unit = next(u for u in units if u["bu_id"] == "bu:north_america_retail")
    assert na_unit["health_score"] >= 95.0
    assert na_unit["tier"] == "Tier 1 (Enterprise)"


def test_register_new_business_unit():
    manager = fleet_manager.fleet_manager
    reg_res = manager.register_business_unit(
        bu_id="bu:anz_commercial_banking",
        name="ANZ Commercial Banking Fleet",
        region="Australia & NZ",
        tier="Tier 1 (Enterprise)",
        api_endpoint="https://anz-banking.fleet.evidenceiq.ai/v1",
    )

    assert reg_res["status"] == "registered"
    assert reg_res["bu_id"] == "bu:anz_commercial_banking"
    assert reg_res["governance_mode"] == "FEDERATED_STRICT"

    units = manager.list_business_units()
    assert any(u["bu_id"] == "bu:anz_commercial_banking" for u in units)


def test_fleet_heartbeat_ping_and_tenant_isolation():
    manager = fleet_manager.fleet_manager

    # 1. Heartbeat Ping
    ping_res = manager.ping_heartbeat("bu:north_america_retail")
    assert ping_res["status"] == "ONLINE"
    assert ping_res["tls_version"] == "TLS 1.3"
    assert ping_res["latency_ms"] <= 50

    # 2. Tenant Boundary Isolation Check
    # Same tenant / central allowed
    perm_res = manager.check_tenant_isolation("bu:central_governance", "bu:emea_ecommerce")
    assert perm_res["access_granted"] is True
    assert perm_res["audit_action"] == "PERMIT"

    # Cross-tenant direct query denied under strict isolation
    denied_res = manager.check_tenant_isolation("bu:north_america_retail", "bu:emea_ecommerce")
    assert denied_res["access_granted"] is False
    assert denied_res["audit_action"] == "DENIED_TENANT_ISOLATION_RULE"


def test_marketplace_list_and_publish_contract():
    market = contract_marketplace.contract_marketplace

    contracts = market.list_contracts()
    assert len(contracts) >= 5

    # Filter by SLA tier
    mission_critical = market.list_contracts(sla_tier="Mission Critical")
    assert len(mission_critical) >= 2
    assert all("Mission Critical" in c["sla_tier"] for c in mission_critical)

    # Publish new contract
    pub_res = market.publish_contract(
        metric_id="metric:carbon_intensity_esg",
        title="Enterprise Scope 1 & 2 Carbon Intensity Standard",
        publisher_bu="bu:apac_supply_chain",
        version="1.0.0",
        sla_tier="Standard (99.0%)",
        contract_schema={
            "formula": "Total_CO2_Emissions_MT / Total_Gross_Revenue_Lakh",
            "allowed_dimensions": ["region", "facility_type"],
            "sla_latency_minutes": 1440,
            "variance_tolerance_pct": 5.0,
            "owner": "Chief Sustainability Officer (CSO)",
        },
    )

    assert pub_res["status"] == "published"
    assert pub_res["contract_id"] == "contract:carbon_intensity_esg_v1_0_0"
    assert pub_res["publisher_bu"] == "bu:apac_supply_chain"


def test_marketplace_subscribe_to_contract():
    market = contract_marketplace.contract_marketplace

    contracts = market.list_contracts()
    target_contract = contracts[0]
    initial_subscribers = target_contract["subscriber_count"]

    sub_res = market.subscribe_to_contract(
        contract_id=target_contract["contract_id"],
        subscriber_bu="bu:latam_fintech",
    )

    assert sub_res["status"] == "subscribed"
    assert sub_res["new_subscriber_count"] == initial_subscribers + 1
    assert "sla_agreement" in sub_res


def test_compliance_audit_pack_generation_and_sha256():
    engine = compliance_audit.compliance_audit_engine

    # 1. Test SOC-2 Type II Audit Pack
    soc2_pack = engine.generate_audit_pack(
        standard="SOC-2",
        auditor_identity="Accenture Security practice (ISO 27001 / SOC-2 Assessor)",
    )
    assert soc2_pack["standard"] == "SOC-2"
    assert soc2_pack["compliance_score"] == 100.0
    assert soc2_pack["controls_passed"] == soc2_pack["controls_total"]
    assert len(soc2_pack["audit_hash"]) == 64  # SHA-256
    assert soc2_pack["certification_status"] == "CERTIFIED_FULLY_COMPLIANT"

    # 2. Test SOX-404 Audit Pack
    sox_pack = engine.generate_audit_pack(
        standard="SOX-404",
        auditor_identity="Enterprise Financial Audit Committee (PCAOB Compliance)",
    )
    assert sox_pack["standard"] == "SOX-404"
    assert sox_pack["compliance_score"] == 100.0
    assert len(sox_pack["audit_hash"]) == 64

    # 3. Test GDPR Article 22 Audit Pack
    gdpr_pack = engine.generate_audit_pack(
        standard="GDPR-ART22",
        auditor_identity="Data Protection Officer (DPO Europe)",
    )
    assert gdpr_pack["standard"] == "GDPR-ART22"
    assert gdpr_pack["compliance_score"] == 100.0
    assert len(gdpr_pack["audit_hash"]) == 64

    # Validate listing
    all_packs = engine.list_audit_packs()
    assert len(all_packs) >= 3


def test_compliance_markdown_export():
    engine = compliance_audit.compliance_audit_engine
    packs = engine.list_audit_packs()
    dossier_id = packs[0]["dossier_id"]

    md_text = engine.generate_markdown_dossier(dossier_id)
    assert "# Regulatory Compliance Audit Dossier" in md_text
    assert "Cryptographic Proof (SHA-256):" in md_text
    assert "Verified Control Matrix" in md_text
    assert "CERTIFICATE OF AUDIT VERIFICATION" in md_text


def test_whitelabel_config_and_presets():
    service = whitelabel_service.whitelabel_service

    # Active config
    cfg = service.get_active_config()
    assert "brand_name" in cfg
    assert "primary_color" in cfg

    # Presets
    presets = service.list_presets()
    assert len(presets) >= 3
    assert any("Accenture" in p["brand_name"] for p in presets)

    # Update config
    update_res = service.update_config(
        tenant_id="tenant:accenture_global",
        brand_name="Accenture Strategic BI Suite",
        preset_name="Diamond Practice Client Engagement",
        primary_color="#A100FF",
        secondary_color="#000000",
        logo_symbol=">",
        engagement_code="ACN-STRATEGY-2026",
        custom_domain="strategy-bi.accenture.com",
    )

    assert update_res["status"] == "updated"
    assert update_res["brand_name"] == "Accenture Strategic BI Suite"
    assert update_res["engagement_code"] == "ACN-STRATEGY-2026"

    # Verify retrieved active
    new_cfg = service.get_active_config()
    assert new_cfg["brand_name"] == "Accenture Strategic BI Suite"
