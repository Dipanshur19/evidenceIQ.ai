import os

from dotenv import load_dotenv

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENV_PATH = os.path.join(BASE_DIR, ".env")
load_dotenv(dotenv_path=ENV_PATH)


LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")  # "gemini", "ollama", or "fallback"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:1.5b")


DATA_DIR = os.path.join(BASE_DIR, "data")
DB_PATH = os.path.join(BASE_DIR, "evidenceiq.db")

ROSSMANN_CSV = os.path.join(DATA_DIR, "rossmann_store_sales.csv")
REVENUE_CSV = ROSSMANN_CSV
CHANGE_LOG_CSV = os.path.join(DATA_DIR, "change_log.csv")
TICKETS_CSV = os.path.join(DATA_DIR, "support_tickets.csv")

# Multi-Model Load Balancer & Failover Priority Chain (Gemini Flash First)
BALANCER_MODEL_CHAIN = [
    {
        "name": "Google Gemini (gemini-2.0-flash)",
        "provider": "gemini",
        "model": "gemini-2.0-flash",
    },
    {
        "name": "Google Gemini (gemini-1.5-flash)",
        "provider": "gemini",
        "model": "gemini-1.5-flash",
    },
    {"name": "Ollama (qwen2.5:1.5b)", "provider": "ollama", "model": "qwen2.5:1.5b"},
    {"name": "Ollama (llama3.2)", "provider": "ollama", "model": "llama3.2"},
    {
        "name": "Deterministic Grounded Engine (Fail-safe)",
        "provider": "fallback",
        "model": "rule_engine_v1",
    },
]


METRIC_DEFINITIONS = {
    "metric:revenue": {
        "display_name": "Regional Revenue",
        "formula": "SUM(revenue_lakh_inr)",
        "unit": "Lakh INR",
        "grain": "daily, per region/channel",
        "allowed_dimensions": ["region", "channel"],
        "owner_team": "finance_team",
        "version": 1,
    },
    "metric:order_volume": {
        "display_name": "Order Volume",
        "formula": "SUM(order_count)",
        "unit": "Orders",
        "grain": "daily, per region/channel",
        "allowed_dimensions": ["region", "channel"],
        "owner_team": "growth_team",
        "version": 1,
    },
    "metric:conversion_rate": {
        "display_name": "Checkout Conversion Rate",
        "formula": "AVG(checkout_conversion_pct)",
        "unit": "%",
        "grain": "daily, per region/channel",
        "allowed_dimensions": ["region", "channel"],
        "owner_team": "product_team",
        "version": 1,
    },
    "metric:ticket_rate": {
        "display_name": "Support Ticket Rate",
        "formula": "COUNT(tickets) / (SUM(orders)/1000)",
        "unit": "tickets/1k orders",
        "grain": "daily, per region/channel",
        "allowed_dimensions": ["region", "channel"],
        "owner_team": "customer_ops",
        "version": 1,
    },
}

SEMANTIC_CONTRACTS = {
    "metric:revenue": {
        "source_of_record": "revenue_daily.csv",
        "refresh_cadence": "daily_at_midnight_utc",
        "minimum_baseline_days": 14,
        "lineage": ["transactions_db -> daily_aggregations -> revenue_daily"],
        "connected_drivers": ["metric:order_volume", "metric:conversion_rate"],
        "role_restrictions": {
            "executive": ["summary", "financial_impact"],
            "analyst": ["full_telemetry", "z_score", "lineage"],
        },
    },
    "metric:order_volume": {
        "source_of_record": "orders_db",
        "refresh_cadence": "hourly",
        "minimum_baseline_days": 14,
        "lineage": ["order_events -> order_aggregations"],
        "connected_drivers": ["metric:conversion_rate"],
        "role_restrictions": {"executive": ["summary"], "analyst": ["full_telemetry"]},
    },
    "metric:conversion_rate": {
        "source_of_record": "analytics_events",
        "refresh_cadence": "realtime",
        "minimum_baseline_days": 14,
        "lineage": ["web_app_logs -> conversion_pipeline"],
        "connected_drivers": ["event:product_release"],
        "role_restrictions": {"executive": ["summary"], "analyst": ["full_telemetry"]},
    },
}

PERSONAS = {
    "executive": {
        "display_name": "Executive / Business Sponsor",
        "narrative_focus": "high_level_business_impact",
        "show_z_scores": False,
        "show_raw_evidence_nodes": False,
    },
    "analyst": {
        "display_name": "Operations / BI Analyst",
        "narrative_focus": "technical_deep_dive",
        "show_z_scores": True,
        "show_raw_evidence_nodes": True,
    },
}

DIMENSIONS = ["region", "channel"]


BASELINE_WINDOW_DAYS = 21
Z_MEDIUM_THRESHOLD = 1.5
Z_HIGH_THRESHOLD = 2.5


EVIDENCE_WEIGHTS = {
    "correlation_strength": 0.30,
    "temporal_alignment": 0.25,
    "independent_corroboration": 0.25,
    "quasi_causal_evidence": 0.20,
    "contradiction_penalty": 0.30,
    "data_quality_penalty": 0.15,
}

CONFIDENCE_BANDS = {"HIGH": 0.75, "MEDIUM": 0.45, "LOW": 0.20}

ALWAYS_REQUIRE_HUMAN_REVIEW = True

ACTION_RISK_TABLE = {
    "rollback_release": {
        "risk": "medium",
        "reversibility": "reversible_within_minutes",
        "always_review": True,
    },
    "pause_campaign": {
        "risk": "low",
        "reversibility": "reversible_within_hours",
        "always_review": True,
    },
    "price_adjustment": {
        "risk": "medium",
        "reversibility": "reversible_within_days",
        "always_review": True,
    },
    "discontinue_product_line": {
        "risk": "high",
        "reversibility": "irreversible",
        "always_review": True,
    },
}
