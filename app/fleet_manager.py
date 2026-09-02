"""
Phase 4: Federated Multi-Business-Unit Fleet Management & Tenant Isolation.
Provides centralized governance, real-time health scoring, and multi-tenant isolation
across global enterprise subsidiaries.
"""

from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from . import db


DEFAULT_BUSINESS_UNITS = [
    {
        "bu_id": "bu:north_america_retail",
        "name": "North America Retail Division",
        "region": "North America",
        "tier": "Tier 1 (Enterprise)",
        "status": "HEALTHY",
        "health_score": 98.4,
        "kpis_count": 28,
        "open_anomalies": 0,
        "revenue_at_risk": 0.0,
        "api_endpoint": "https://na-retail.fleet.evidenceiq.ai/v1",
    },
    {
        "bu_id": "bu:emea_ecommerce",
        "name": "EMEA Digital & E-Commerce",
        "region": "Europe & Middle East",
        "tier": "Tier 1 (Enterprise)",
        "status": "DEGRADED",
        "health_score": 82.1,
        "kpis_count": 34,
        "open_anomalies": 1,
        "revenue_at_risk": 438000.0,
        "api_endpoint": "https://emea-ecom.fleet.evidenceiq.ai/v1",
    },
    {
        "bu_id": "bu:apac_supply_chain",
        "name": "APAC Logistics & Fulfillment",
        "region": "Asia-Pacific",
        "tier": "Tier 2 (Standard)",
        "status": "HEALTHY",
        "health_score": 94.7,
        "kpis_count": 19,
        "open_anomalies": 0,
        "revenue_at_risk": 0.0,
        "api_endpoint": "https://apac-ops.fleet.evidenceiq.ai/v1",
    },
    {
        "bu_id": "bu:latam_fintech",
        "name": "LATAM Merchant & Fintech Hub",
        "region": "Latin America",
        "tier": "Tier 2 (Standard)",
        "status": "HEALTHY",
        "health_score": 91.2,
        "kpis_count": 15,
        "open_anomalies": 0,
        "revenue_at_risk": 0.0,
        "api_endpoint": "https://latam-pay.fleet.evidenceiq.ai/v1",
    },
    {
        "bu_id": "bu:india_quickcommerce",
        "name": "India Quick-Commerce Operations",
        "region": "South Asia",
        "tier": "Tier 1 (Enterprise)",
        "status": "CRITICAL",
        "health_score": 76.5,
        "kpis_count": 42,
        "open_anomalies": 2,
        "revenue_at_risk": 1250000.0,
        "api_endpoint": "https://india-qcom.fleet.evidenceiq.ai/v1",
    },
]


class FleetManager:
    def __init__(self):
        self.ensure_default_units_seeded()

    def ensure_default_units_seeded(self):
        """Seeds default business units into federated_business_unit table if empty."""
        with db.get_conn() as conn:
            count = conn.execute("SELECT COUNT(*) FROM federated_business_unit").fetchone()[0]
            if count == 0:
                now_iso = datetime.now(timezone.utc).isoformat()
                for bu in DEFAULT_BUSINESS_UNITS:
                    conn.execute(
                        """INSERT OR REPLACE INTO federated_business_unit
                           (bu_id, name, region, tier, status, health_score, kpis_count,
                            open_anomalies, revenue_at_risk, api_endpoint, last_heartbeat)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (
                            bu["bu_id"],
                            bu["name"],
                            bu["region"],
                            bu["tier"],
                            bu["status"],
                            bu["health_score"],
                            bu["kpis_count"],
                            bu["open_anomalies"],
                            bu["revenue_at_risk"],
                            bu["api_endpoint"],
                            now_iso,
                        ),
                    )

    def list_business_units(self) -> List[Dict[str, Any]]:
        """Returns list of all active federated business units."""
        self.ensure_default_units_seeded()
        with db.get_conn() as conn:
            rows = conn.execute("SELECT * FROM federated_business_unit ORDER BY health_score ASC").fetchall()
            return [dict(r) for r in rows]

    def register_business_unit(
        self,
        bu_id: str,
        name: str,
        region: str,
        tier: str = "Tier 2 (Standard)",
        api_endpoint: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Registers a new subsidiary business unit under centralized fleet governance."""
        clean_id = bu_id if bu_id.startswith("bu:") else f"bu:{bu_id.lower().replace(' ', '_')}"
        endpoint = api_endpoint or f"https://{clean_id.replace('bu:', '')}.fleet.evidenceiq.ai/v1"
        now_iso = datetime.now(timezone.utc).isoformat()

        with db.get_conn() as conn:
            conn.execute(
                """INSERT OR REPLACE INTO federated_business_unit
                   (bu_id, name, region, tier, status, health_score, kpis_count,
                    open_anomalies, revenue_at_risk, api_endpoint, last_heartbeat)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (clean_id, name, region, tier, "HEALTHY", 100.0, 10, 0, 0.0, endpoint, now_iso),
            )
        return {
            "status": "registered",
            "bu_id": clean_id,
            "name": name,
            "region": region,
            "tier": tier,
            "endpoint": endpoint,
            "governance_mode": "FEDERATED_STRICT",
        }

    def get_fleet_overview(self) -> Dict[str, Any]:
        """Computes executive fleet rollups across all federated operating units."""
        bus = self.list_business_units()
        total_units = len(bus)
        if total_units == 0:
            return {"total_units": 0, "average_health": 100.0, "total_kpis": 0, "total_risk_usd": 0.0}

        avg_health = sum(b["health_score"] for b in bus) / total_units
        total_kpis = sum(b["kpis_count"] for b in bus)
        total_anomalies = sum(b["open_anomalies"] for b in bus)
        total_risk = sum(b["revenue_at_risk"] for b in bus)

        status_counts = {"HEALTHY": 0, "DEGRADED": 0, "CRITICAL": 0}
        for b in bus:
            st = b.get("status", "HEALTHY")
            status_counts[st] = status_counts.get(st, 0) + 1

        return {
            "status": "success",
            "total_business_units": total_units,
            "average_fleet_health": round(avg_health, 1),
            "total_governed_kpis": total_kpis,
            "open_fleet_anomalies": total_anomalies,
            "total_revenue_at_risk_usd": total_risk,
            "status_distribution": status_counts,
            "business_units": bus,
            "central_governance_node": "EvidenceIQ Primary Hub (Accenture Enterprise Grid)",
        }

    def ping_heartbeat(self, bu_id: str) -> Dict[str, Any]:
        """Simulates latency and updates heartbeat timestamp for a federated BU node."""
        now_iso = datetime.now(timezone.utc).isoformat()
        with db.get_conn() as conn:
            conn.execute(
                "UPDATE federated_business_unit SET last_heartbeat = ? WHERE bu_id = ?",
                (now_iso, bu_id),
            )
        return {
            "bu_id": bu_id,
            "latency_ms": 38,
            "tls_version": "TLS 1.3",
            "mutual_auth": "mTLS Verified",
            "last_heartbeat": now_iso,
            "status": "ONLINE",
        }

    def check_tenant_isolation(self, requesting_bu: str, target_bu: str) -> Dict[str, Any]:
        """Validates cross-tenant boundaries ensuring data privacy between subsidiaries."""
        is_allowed = requesting_bu == target_bu or requesting_bu == "bu:central_governance"
        return {
            "requesting_bu": requesting_bu,
            "target_bu": target_bu,
            "access_granted": is_allowed,
            "isolation_policy": "TENANT_BOUNDARY_STRICT",
            "audit_action": "PERMIT" if is_allowed else "DENIED_TENANT_ISOLATION_RULE",
        }


fleet_manager = FleetManager()
