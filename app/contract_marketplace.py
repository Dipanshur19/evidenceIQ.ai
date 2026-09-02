"""
Phase 4: Cross-Enterprise Semantic Contract Marketplace.
Allows federated subsidiaries to publish, discover, subscribe to, and version
governed metric contracts with contractual SLA guarantees.
"""

import json
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
from . import db


DEFAULT_CONTRACTS = [
    {
        "contract_id": "contract:revenue_gaap_v2",
        "metric_id": "metric:revenue",
        "version": "2.4.0",
        "title": "GAAP Reconciled Sales Revenue Standard",
        "publisher_bu": "bu:north_america_retail",
        "sla_tier": "Mission Critical (99.9%)",
        "subscriber_count": 14,
        "contract_schema": {
            "formula": "SUM(gross_revenue_lakh) - SUM(returns_and_refunds)",
            "allowed_dimensions": ["region", "channel", "store_tier"],
            "sla_latency_minutes": 15,
            "variance_tolerance_pct": 0.01,
            "owner": "Enterprise Financial Controller",
        },
    },
    {
        "contract_id": "contract:customer_nps_cxo_v3",
        "metric_id": "metric:nps",
        "version": "3.1.0",
        "title": "CX Global Net Promoter Score Protocol",
        "publisher_bu": "bu:emea_ecommerce",
        "sla_tier": "Standard (99.0%)",
        "subscriber_count": 8,
        "contract_schema": {
            "formula": "(Promoters - Detractors) / Total_Respondents * 100",
            "allowed_dimensions": ["region", "touchpoint", "customer_segment"],
            "sla_latency_minutes": 120,
            "variance_tolerance_pct": 2.5,
            "owner": "Chief Experience Officer (CXO)",
        },
    },
    {
        "contract_id": "contract:inventory_turns_ifrs_v1",
        "metric_id": "metric:inventory_turnover",
        "version": "1.2.0",
        "title": "IFRS-15 Inventory Turnover & Stock Velocity",
        "publisher_bu": "bu:apac_supply_chain",
        "sla_tier": "Standard (99.0%)",
        "subscriber_count": 6,
        "contract_schema": {
            "formula": "COGS_Rolling_30d / Average_Warehouse_Asset_Value",
            "allowed_dimensions": ["region", "warehouse_id", "category"],
            "sla_latency_minutes": 360,
            "variance_tolerance_pct": 5.0,
            "owner": "VP Global Supply Chain",
        },
    },
    {
        "contract_id": "contract:saas_net_retention_v2",
        "metric_id": "metric:churn",
        "version": "2.0.1",
        "title": "Subscription Net Revenue Retention (NRR)",
        "publisher_bu": "bu:latam_fintech",
        "sla_tier": "Mission Critical (99.9%)",
        "subscriber_count": 11,
        "contract_schema": {
            "formula": "(Ending_ARR + Expansion - Churn - Contraction) / Starting_ARR * 100",
            "allowed_dimensions": ["region", "subscription_tier", "tenure_cohort"],
            "sla_latency_minutes": 60,
            "variance_tolerance_pct": 0.5,
            "owner": "VP Customer Retention & Lifecycle",
        },
    },
    {
        "contract_id": "contract:cart_abandonment_friction_v1",
        "metric_id": "metric:conversion_rate",
        "version": "1.0.0",
        "title": "Checkout Step Dropoff & Friction Index",
        "publisher_bu": "bu:india_quickcommerce",
        "sla_tier": "Analytics Only",
        "subscriber_count": 5,
        "contract_schema": {
            "formula": "100 - (checkouts_completed / cart_creations * 100)",
            "allowed_dimensions": ["region", "app_platform", "payment_method"],
            "sla_latency_minutes": 5,
            "variance_tolerance_pct": 3.0,
            "owner": "Principal Product Manager (Growth)",
        },
    },
]


class ContractMarketplace:
    def __init__(self):
        self.ensure_default_contracts_seeded()

    def ensure_default_contracts_seeded(self):
        """Seeds default marketplace contracts into marketplace_contract table if empty."""
        with db.get_conn() as conn:
            count = conn.execute("SELECT COUNT(*) FROM marketplace_contract").fetchone()[0]
            if count == 0:
                now_iso = datetime.now(timezone.utc).isoformat()
                for c in DEFAULT_CONTRACTS:
                    conn.execute(
                        """INSERT OR REPLACE INTO marketplace_contract
                           (contract_id, metric_id, version, title, publisher_bu, sla_tier,
                            contract_schema, subscriber_count, published_at, is_deprecated)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (
                            c["contract_id"],
                            c["metric_id"],
                            c["version"],
                            c["title"],
                            c["publisher_bu"],
                            c["sla_tier"],
                            json.dumps(c["contract_schema"]),
                            c["subscriber_count"],
                            now_iso,
                            0,
                        ),
                    )

    def list_contracts(
        self, search: Optional[str] = None, sla_tier: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Returns active marketplace contracts with optional query/tier filtering."""
        self.ensure_default_contracts_seeded()
        with db.get_conn() as conn:
            query = "SELECT * FROM marketplace_contract WHERE is_deprecated = 0"
            params = []
            if sla_tier:
                query += " AND sla_tier LIKE ?"
                params.append(f"%{sla_tier}%")
            if search:
                query += " AND (title LIKE ? OR metric_id LIKE ? OR publisher_bu LIKE ?)"
                params.extend([f"%{search}%", f"%{search}%", f"%{search}%"])

            query += " ORDER BY subscriber_count DESC"
            rows = conn.execute(query, params).fetchall()

            out = []
            for r in rows:
                item = dict(r)
                try:
                    item["contract_schema"] = json.loads(item["contract_schema"])
                except Exception:
                    pass
                out.append(item)
            return out

    def publish_contract(
        self,
        metric_id: str,
        title: str,
        publisher_bu: str,
        version: str = "1.0.0",
        sla_tier: str = "Standard (99.0%)",
        contract_schema: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Publishes a new governed contract to the enterprise marketplace."""
        clean_metric = metric_id if metric_id.startswith("metric:") else f"metric:{metric_id}"
        contract_id = f"contract:{clean_metric.replace('metric:', '')}_v{version.replace('.', '_')}"
        now_iso = datetime.now(timezone.utc).isoformat()
        schema_dict = contract_schema or {
            "formula": "Governed standard mathematical definition",
            "allowed_dimensions": ["region", "channel"],
            "sla_latency_minutes": 60,
            "variance_tolerance_pct": 1.0,
            "owner": publisher_bu,
        }

        with db.get_conn() as conn:
            conn.execute(
                """INSERT OR REPLACE INTO marketplace_contract
                   (contract_id, metric_id, version, title, publisher_bu, sla_tier,
                    contract_schema, subscriber_count, published_at, is_deprecated)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    contract_id,
                    clean_metric,
                    version,
                    title,
                    publisher_bu,
                    sla_tier,
                    json.dumps(schema_dict),
                    1,
                    now_iso,
                    0,
                ),
            )

        return {
            "status": "published",
            "contract_id": contract_id,
            "metric_id": clean_metric,
            "title": title,
            "publisher_bu": publisher_bu,
            "version": version,
            "sla_tier": sla_tier,
            "published_at": now_iso,
        }

    def subscribe_to_contract(self, contract_id: str, subscriber_bu: str) -> Dict[str, Any]:
        """Subscribes an operating business unit to a published contract and bumps subscriber count."""
        now_iso = datetime.now(timezone.utc).isoformat()
        with db.get_conn() as conn:
            conn.execute(
                "UPDATE marketplace_contract SET subscriber_count = subscriber_count + 1 WHERE contract_id = ?",
                (contract_id,),
            )
            row = conn.execute(
                "SELECT * FROM marketplace_contract WHERE contract_id = ?", (contract_id,)
            ).fetchone()

        if not row:
            return {"status": "error", "message": f"Contract '{contract_id}' not found."}

        return {
            "status": "subscribed",
            "contract_id": contract_id,
            "subscriber_bu": subscriber_bu,
            "new_subscriber_count": row["subscriber_count"],
            "sla_agreement": row["sla_tier"],
            "timestamp": now_iso,
        }


contract_marketplace = ContractMarketplace()
