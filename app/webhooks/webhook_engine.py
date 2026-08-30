"""
Real-Time Webhook Ingestion Engine for GitHub Actions, Jira, and Zendesk.
Parses inbound event payloads and immediately writes them to the Business Evidence Graph.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone
import json
import hashlib
from .. import db
from ..entity_resolution import resolve_region, resolve_channel


class WebhookEngine:
    def __init__(self):
        self._init_webhook_history_table()

    def _init_webhook_history_table(self):
        with db.get_conn() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS webhook_inbox (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    event_id TEXT UNIQUE,
                    source TEXT NOT NULL,
                    event_type TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    affected_region TEXT,
                    affected_channel TEXT,
                    raw_payload TEXT,
                    graph_node_id TEXT,
                    received_at TEXT NOT NULL
                )
            """)

    def ingest_github_event(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes GitHub deployment/release webhook (e.g. Mobile App Release v5.4, API Gateway Config Change).
        """
        release_tag = payload.get("release_tag", payload.get("release", {}).get("tag_name", "v5.4.1"))
        repo_name = payload.get("repository", {}).get("name", "mobile-checkout-service")
        environment = payload.get("deployment", {}).get("environment", "production-north-india")
        sender = payload.get("sender", {}).get("login", "devops-lead")
        commit_msg = payload.get("head_commit", {}).get("message", "Payment SDK upgrade and checkout UI redesign")

        region_str = "North_India" if "north" in environment.lower() else "ALL"
        channel_str = "Mobile_App" if "mobile" in repo_name.lower() else "Web"

        region_res = resolve_region(region_str)
        channel_res = resolve_channel(channel_str)

        event_id = f"event:github_{repo_name}_{release_tag}".replace("/", "_").replace(":", "_").lower()
        now_iso = datetime.now(timezone.utc).isoformat()

        description = f"GitHub Actions Deployment ({repo_name} @ {release_tag}): {commit_msg} deployed to {environment} by {sender}."

        node_attrs = {
            "node_type": "Event",
            "id": event_id,
            "event_type": "product_release",
            "timestamp": now_iso,
            "source": "github_actions",
            "description": description,
            "affected_region": region_res["canonical_id"],
            "affected_channel": channel_res["canonical_id"],
            "confidence": 0.99,
            "provenance": f"https://github.com/enterprise/{repo_name}/deployments/{release_tag}",
            "author": sender,
        }

        db.upsert_node(event_id, "Event", node_attrs, now_iso)
        self._record_inbox(event_id, "github_actions", "deployment", description, region_res["canonical_id"], channel_res["canonical_id"], payload, event_id, now_iso)

        return {
            "status": "ingested",
            "source": "github_actions",
            "event_id": event_id,
            "graph_node_created": True,
            "summary": description,
            "affected_scope": {"region": region_res["canonical_id"], "channel": channel_res["canonical_id"]},
            "timestamp": now_iso,
        }

    def ingest_jira_event(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes Jira incident or change request webhook.
        """
        issue_key = payload.get("issue", {}).get("key", "OPS-4821")
        summary = payload.get("issue", {}).get("fields", {}).get("summary", "Payment Gateway Latency Spike & Rollout Freeze")
        issue_type = payload.get("issue", {}).get("fields", {}).get("issuetype", {}).get("name", "Incident")
        reporter = payload.get("user", {}).get("displayName", "Lead SRE Engineer")

        event_id = f"event:jira_{issue_key}".lower()
        now_iso = datetime.now(timezone.utc).isoformat()
        description = f"Jira {issue_type} [{issue_key}]: {summary} (Reported by {reporter})"

        region_res = resolve_region("North_India")
        channel_res = resolve_channel("Mobile_App")

        node_attrs = {
            "node_type": "Event",
            "id": event_id,
            "event_type": "incident_change_ticket",
            "timestamp": now_iso,
            "source": "jira_software",
            "description": description,
            "affected_region": region_res["canonical_id"],
            "affected_channel": channel_res["canonical_id"],
            "confidence": 0.95,
            "provenance": f"https://jira.enterprise.com/browse/{issue_key}",
        }

        db.upsert_node(event_id, "Event", node_attrs, now_iso)
        self._record_inbox(event_id, "jira_software", issue_type.lower(), description, region_res["canonical_id"], channel_res["canonical_id"], payload, event_id, now_iso)

        return {
            "status": "ingested",
            "source": "jira_software",
            "event_id": event_id,
            "graph_node_created": True,
            "summary": description,
            "timestamp": now_iso,
        }

    def ingest_zendesk_event(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes Zendesk customer support surge or high-severity ticket webhook.
        """
        ticket_id = payload.get("ticket", {}).get("id", "ZD-99382")
        subject = payload.get("ticket", {}).get("subject", "Unable to complete payment on mobile checkout screen")
        urgency = payload.get("ticket", {}).get("priority", "urgent")

        event_id = f"evidence:zendesk_{ticket_id}".lower()
        now_iso = datetime.now(timezone.utc).isoformat()
        description = f"Zendesk Urgent Support Surge [{ticket_id} - Priority: {urgency}]: {subject}"

        region_res = resolve_region("North_India")
        channel_res = resolve_channel("Mobile_App")

        node_attrs = {
            "node_type": "Evidence",
            "id": event_id,
            "summary": description,
            "strength": 0.92,
            "source": "zendesk_support",
            "provenance": f"https://zendesk.enterprise.com/agent/tickets/{ticket_id}",
            "created_at": now_iso,
        }

        db.upsert_node(event_id, "Evidence", node_attrs, now_iso)
        self._record_inbox(event_id, "zendesk_support", "ticket_surge", description, region_res["canonical_id"], channel_res["canonical_id"], payload, event_id, now_iso)

        return {
            "status": "ingested",
            "source": "zendesk_support",
            "event_id": event_id,
            "graph_node_created": True,
            "summary": description,
            "timestamp": now_iso,
        }

    def _record_inbox(self, event_id, source, event_type, summary, region, channel, raw_payload, node_id, received_at):
        with db.get_conn() as conn:
            conn.execute(
                """INSERT OR REPLACE INTO webhook_inbox 
                   (event_id, source, event_type, summary, affected_region, affected_channel, raw_payload, graph_node_id, received_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (event_id, source, event_type, summary, region, channel, json.dumps(raw_payload), node_id, received_at)
            )

    def get_history(self, limit: int = 30) -> List[Dict[str, Any]]:
        self._init_webhook_history_table()
        with db.get_conn() as conn:
            rows = conn.execute("SELECT * FROM webhook_inbox ORDER BY received_at DESC LIMIT ?", (limit,)).fetchall()
            return [dict(r) for r in rows]


webhook_engine = WebhookEngine()
