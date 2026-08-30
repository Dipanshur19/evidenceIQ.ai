"""
Graph Builder & Topology Manager:
Maintains the complete Relational Business Evidence Graph binding
KPIs, Entities, Events, Evidence, Hypotheses, and Human Decisions.
"""

from datetime import datetime, timezone, date
import json
from . import db


def ensure_complete_graph_topology():
    """
    Ensures that a rich, fully-interconnected evidence graph exists with
    all node types and directed typed edges.
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    # 1. Ensure Benchmark KPI Nodes
    kpi_nodes = [
        {
            "id": "kpi:revenue_region_a_storetype_a",
            "type": "KPI",
            "attrs": {
                "metric_id": "metric:revenue",
                "display_name": "Revenue: Region A (StoreType A)",
                "observed_value": 24.65,
                "expected_value": 42.50,
                "delta_pct": -42.0,
                "z_score": -3.42,
                "severity": "CRITICAL",
                "affected_region": "Region_A",
                "affected_channel": "StoreType_A",
                "unit": "Lakh INR (₹)",
            }
        },
        {
            "id": "kpi:rossmann_sales_store_101",
            "type": "KPI",
            "attrs": {
                "metric_id": "metric:revenue",
                "display_name": "Store 101 Daily Sales",
                "observed_value": 3373.0,
                "expected_value": 10528.5,
                "delta_pct": -67.96,
                "z_score": -2.005,
                "severity": "HIGH",
                "affected_region": "North_India",
                "affected_channel": "Mobile_App",
                "unit": "Lakh INR (₹)",
            }
        }
    ]
    for k in kpi_nodes:
        db.upsert_node(k["id"], "KPI", k["attrs"], now_iso)

    # 2. Ensure Entities
    entity_nodes = [
        {
            "id": "entity:region_north_india",
            "type": "Entity",
            "attrs": {
                "name": "North India Geographic Cluster",
                "type": "Geographic Cluster",
                "store_count": 48,
                "primary_warehouse": "WH_DELHI_CENTRAL",
            }
        },
        {
            "id": "entity:channel_mobile_app",
            "type": "Entity",
            "attrs": {
                "name": "Mobile App / Digital POS Channel",
                "type": "Digital Channel",
                "active_devices": 142000,
            }
        }
    ]
    for e in entity_nodes:
        db.upsert_node(e["id"], "Entity", e["attrs"], now_iso)

    # 3. Ensure Events
    event_nodes = [
        {
            "id": "event:mobile_app_release_v5_4",
            "type": "Event",
            "attrs": {
                "event_type": "product_release",
                "description": "Mobile Checkout Redesign & Payment SDK v5.4 Deployment",
                "timestamp": "2026-08-12T09:00:00Z",
                "source": "github_actions",
                "affected_region": "North_India",
                "affected_channel": "Mobile_App",
                "author": "devops-lead",
            }
        },
        {
            "id": "event:pricing_update_east",
            "type": "Event",
            "attrs": {
                "event_type": "price_change",
                "description": "Quarterly Base Price Revision across East Category",
                "timestamp": "2026-08-05T00:00:00Z",
                "source": "erp_pricing_service",
                "affected_region": "East_India",
                "affected_channel": "Retail_Outlet",
            }
        }
    ]
    for ev in event_nodes:
        db.upsert_node(ev["id"], "Event", ev["attrs"], now_iso)

    # 4. Ensure Evidence Nodes
    evidence_nodes = [
        {
            "id": "evidence:ticket_spike_region_a_storetype_a_2026-08-15",
            "type": "Evidence",
            "attrs": {
                "summary": "Customer Support Surge: 8 Tickets reporting POS barcode / payment gateway timeouts",
                "strength": 0.88,
                "source": "zendesk_support",
                "cluster_topic": "payment_timeout",
            }
        },
        {
            "id": "evidence:did_control_parallel_trend",
            "type": "Evidence",
            "attrs": {
                "summary": "Quasi-Causal DiD: South India control group remained stable (+0.2% variance)",
                "strength": 0.95,
                "source": "difference_in_differences",
                "parallel_trend_valid": True,
            }
        }
    ]
    for ev in evidence_nodes:
        db.upsert_node(ev["id"], "Evidence", ev["attrs"], now_iso)

    # 5. Ensure Hypothesis Nodes
    hypothesis_nodes = [
        {
            "id": "hypothesis:checkout_flow_v5_4",
            "type": "Hypothesis",
            "attrs": {
                "statement": "Mobile checkout flow redesign (v5.4) caused POS/payment gateway timeouts",
                "evidence_score": 0.850,
                "confidence_band": "HIGH",
                "status": "active_investigation",
            }
        }
    ]
    for h in hypothesis_nodes:
        db.upsert_node(h["id"], "Hypothesis", h["attrs"], now_iso)

    # 6. Ensure Decision Nodes
    decision_nodes = [
        {
            "id": "decision:rollback_v5_4_checkout",
            "type": "Decision",
            "attrs": {
                "action": "Roll back Mobile Checkout v5.4 to v5.3.2 stable build",
                "decision": "CONFIRM",
                "decided_by": "Senior Operations Analyst",
                "risk": "MEDIUM",
                "expected_recovery": "₹1,935L revenue recovery within 10 minutes",
            }
        }
    ]
    for d in decision_nodes:
        db.upsert_node(d["id"], "Decision", d["attrs"], now_iso)

    # 7. Seed Relational Causal Graph Edges
    causal_edges = [
        # Event PRECEDES KPI
        ("PRECEDES", "event:mobile_app_release_v5_4", "kpi:revenue_region_a_storetype_a", 0.95, "temporal_lag_match"),
        ("PRECEDES", "event:mobile_app_release_v5_4", "kpi:rossmann_sales_store_101", 0.92, "temporal_lag_match"),
        ("PRECEDES", "event_github_mobile-checkout-service_v5.4.1", "kpi:revenue_region_a_storetype_a", 0.98, "ci_cd_deployment_event"),
        ("PRECEDES", "event:jira_ops-9102", "kpi:revenue_region_a_storetype_a", 0.94, "sre_incident_ticket"),

        # Evidence CORROBORATES Hypothesis / Event
        ("CORROBORATES", "evidence:ticket_spike_region_a_storetype_a_2026-08-15", "hypothesis:checkout_flow_v5_4", 0.88, "tfidf_topic_cluster"),
        ("CORROBORATES", "evidence:zendesk_zd-10492", "hypothesis:checkout_flow_v5_4", 0.91, "zendesk_customer_surge"),
        ("CORROBORATES", "evidence:did_control_parallel_trend", "hypothesis:checkout_flow_v5_4", 0.95, "quasi_causal_did"),

        # Hypothesis EXPLAINS KPI
        ("EXPLAINS", "hypothesis:checkout_flow_v5_4", "kpi:revenue_region_a_storetype_a", 0.85, "6_factor_evidence_scoring"),
        ("EXPLAINS", "hypothesis:checkout_flow_v5_4", "kpi:rossmann_sales_store_101", 0.85, "shapley_attribution"),

        # Decision RESOLVES Hypothesis
        ("RESOLVES", "decision:rollback_v5_4_checkout", "hypothesis:checkout_flow_v5_4", 0.96, "human_checkpoint_confirmation"),

        # Entity AFFECTS KPI
        ("AFFECTS", "entity:region_north_india", "kpi:revenue_region_a_storetype_a", 0.80, "geographic_membership"),
        ("AFFECTS", "entity:channel_mobile_app", "kpi:revenue_region_a_storetype_a", 0.85, "sales_channel_membership"),
    ]

    with db.get_conn() as conn:
        for edge_type, from_id, to_id, conf, method in causal_edges:
            # Check if edge exists
            exists = conn.execute(
                "SELECT id FROM graph_edge WHERE edge_type = ? AND from_id = ? AND to_id = ?",
                (edge_type, from_id, to_id)
            ).fetchone()
            if not exists:
                conn.execute(
                    """INSERT INTO graph_edge 
                       (edge_type, from_id, to_id, confidence, methodology, provenance, created_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (edge_type, from_id, to_id, conf, method, "graph_builder", now_iso)
                )


def upsert_kpi_node(
    kpi_id: str,
    metric_id: str,
    dimension_scope: dict,
    observed_value: float,
    expected_value: float,
):
    attrs = {
        "node_type": "KPI",
        "id": kpi_id,
        "metric_id": metric_id,
        "dimension_scope": dimension_scope,
        "observed_value": observed_value,
        "expected_value": expected_value,
    }
    db.upsert_node(kpi_id, "KPI", attrs, datetime.now(timezone.utc).isoformat())


def link_events_to_kpi(
    kpi_id: str, dimension_scope: dict, window_start: str, window_end: str
):
    ensure_complete_graph_topology()
    events = db.get_nodes_by_type("Event")
    linked = []
    for ev in events:
        a = ev["attrs"] if isinstance(ev["attrs"], dict) else json.loads(ev["attrs"])
        region_match = dimension_scope.get("region") is None or a.get(
            "affected_region"
        ) == dimension_scope.get("region")
        channel_match = dimension_scope.get("channel") is None or a.get(
            "affected_channel"
        ) == dimension_scope.get("channel")
        if not (region_match and channel_match):
            continue
        ev_ts = a.get("timestamp", "")[:10]
        if ev_ts > window_end:
            continue
        lag_days = 2
        try:
            lag_days = (date.fromisoformat(window_end) - date.fromisoformat(ev_ts)).days
        except Exception:
            lag_days = 2
        if lag_days < 0:
            continue
        confidence = max(0.99 - 0.05 * max(lag_days - 5, 0), 0.1)
        db.add_edge(
            "PRECEDES",
            ev["id"],
            kpi_id,
            round(confidence, 3),
            methodology="lag_window_match",
            provenance="graph_builder",
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        linked.append(
            {
                "event_id": ev["id"],
                "lag_days": lag_days,
                "confidence": round(confidence, 3),
            }
        )
    return linked
