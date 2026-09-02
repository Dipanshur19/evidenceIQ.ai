import os
import yaml

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
SEMANTIC_CONTRACTS_YAML = os.path.join(DATA_DIR, "semantic_contracts.yaml")
CROSS_DOMAIN_CSV = os.path.join(DATA_DIR, "cross_domain_kpis.csv")

# ---------------------------------------------------------------------------
# Load Governed Semantic Contracts from YAML (Single Source of Truth)
# ---------------------------------------------------------------------------
def _load_yaml_contracts():
    """Load semantic contracts from the checked-in YAML file."""
    try:
        with open(SEMANTIC_CONTRACTS_YAML, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    except FileNotFoundError:
        return {}

_yaml_contracts = _load_yaml_contracts()

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

# ---------------------------------------------------------------------------
# Metric Definitions — sourced from YAML semantic contracts
# ---------------------------------------------------------------------------
def _build_metric_definitions_from_yaml(yaml_data: dict) -> dict:
    """Convert YAML metric definitions to the existing Python dict format."""
    metrics = yaml_data.get("metrics", {})
    result = {}
    for metric_id, m in metrics.items():
        result[metric_id] = {
            "display_name": m.get("display_name", metric_id),
            "formula": m.get("formula", ""),
            "unit": m.get("unit", ""),
            "grain": m.get("grain", ""),
            "allowed_dimensions": m.get("allowed_dimensions", []),
            "synonyms": m.get("synonyms", []),
            "owner_team": m.get("owner_team", ""),
            "owner_role": m.get("owner_role", ""),
            "version": m.get("version", 1),
            "priority_weight": m.get("priority_weight", 0.5),
        }
    return result

METRIC_DEFINITIONS = _build_metric_definitions_from_yaml(_yaml_contracts) or {
    "metric:revenue": {
        "display_name": "Regional Revenue",
        "formula": "SUM(Sales)",
        "unit": "INR",
        "grain": "daily, per region/channel",
        "allowed_dimensions": ["region", "channel"],
        "synonyms": ["revenue", "sales", "turnover"],
        "owner_team": "finance_team",
        "owner_role": "CFO",
        "version": 1,
        "priority_weight": 1.0,
    },
    "metric:order_volume": {
        "display_name": "Order Volume",
        "formula": "COUNT(DISTINCT order_id)",
        "unit": "Orders",
        "grain": "daily, per region/channel",
        "allowed_dimensions": ["region", "channel"],
        "synonyms": ["orders", "order count"],
        "owner_team": "growth_team",
        "owner_role": "Growth Marketing Lead",
        "version": 1,
        "priority_weight": 0.8,
    },
    "metric:conversion_rate": {
        "display_name": "Checkout Conversion Rate",
        "formula": "AVG(checkout_conversion_pct)",
        "unit": "%",
        "grain": "daily, per region/channel",
        "allowed_dimensions": ["region", "channel"],
        "synonyms": ["conversion", "checkout rate"],
        "owner_team": "product_team",
        "owner_role": "VP Product",
        "version": 1,
        "priority_weight": 0.9,
    },
    "metric:ticket_rate": {
        "display_name": "Support Ticket Rate",
        "formula": "COUNT(tickets) / (SUM(orders)/1000)",
        "unit": "tickets/1k orders",
        "grain": "daily, per region/channel",
        "allowed_dimensions": ["region", "channel"],
        "synonyms": ["ticket rate", "complaint rate"],
        "owner_team": "customer_ops",
        "owner_role": "Customer Ops Director",
        "version": 1,
        "priority_weight": 0.6,
    },
    "metric:customer_traffic": {
        "display_name": "Customer Traffic / Footfall",
        "formula": "SUM(Customers)",
        "unit": "Visitors",
        "grain": "daily, per region/channel/store",
        "allowed_dimensions": ["region", "channel", "store"],
        "synonyms": ["footfall", "traffic", "visitors"],
        "owner_team": "growth_team",
        "owner_role": "Growth Marketing Lead",
        "version": 1,
        "priority_weight": 0.7,
    },
}

# ---------------------------------------------------------------------------
# Semantic Contracts — sourced from YAML
# ---------------------------------------------------------------------------
def _build_semantic_contracts_from_yaml(yaml_data: dict) -> dict:
    """Convert YAML semantic contracts to the existing Python dict format."""
    metrics = yaml_data.get("metrics", {})
    result = {}
    for metric_id, m in metrics.items():
        result[metric_id] = {
            "source_of_record": m.get("source_of_record", ""),
            "refresh_cadence": m.get("refresh_cadence", "unknown"),
            "typical_latency_hours": m.get("typical_latency_hours", 0),
            "minimum_baseline_days": m.get("minimum_baseline_days", 14),
            "lineage": m.get("lineage", []),
            "connected_drivers": m.get("connected_kpis", []),
            "thresholds": m.get("thresholds", {}),
            "role_access": m.get("role_access", {}),
        }
    return result

SEMANTIC_CONTRACTS = _build_semantic_contracts_from_yaml(_yaml_contracts) or {
    "metric:revenue": {
        "source_of_record": "rossmann_store_sales.csv",
        "refresh_cadence": "daily_at_midnight_utc",
        "typical_latency_hours": 0,
        "minimum_baseline_days": 14,
        "lineage": ["transactions_db -> daily_aggregations -> rossmann_store_sales.csv"],
        "connected_drivers": ["metric:order_volume", "metric:conversion_rate"],
        "thresholds": {"z_medium": 1.5, "z_high": 2.5},
        "role_access": {
            "executive": {"visible_fields": ["summary", "financial_impact"]},
            "analyst": {"visible_fields": ["*"]},
        },
    },
}

# ---------------------------------------------------------------------------
# Persona Definitions — sourced from YAML roles
# ---------------------------------------------------------------------------
def _build_personas_from_yaml(yaml_data: dict) -> dict:
    """Convert YAML role definitions to persona config."""
    roles = yaml_data.get("roles", {})
    result = {}
    for role_id, r in roles.items():
        result[role_id] = {
            "display_name": r.get("display_name", role_id),
            "narrative_focus": r.get("narrative_focus", "technical_deep_dive"),
            "show_z_scores": r.get("show_z_scores", True),
            "show_raw_evidence_nodes": r.get("show_raw_evidence_nodes", True),
            "data_scope": r.get("data_scope", "all_regions"),
            "can_approve_actions": r.get("can_approve_actions", []),
        }
    return result

PERSONAS = _build_personas_from_yaml(_yaml_contracts) or {
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

# ---------------------------------------------------------------------------
# Action Risk Table — sourced from YAML
# ---------------------------------------------------------------------------
def _build_action_risk_from_yaml(yaml_data: dict) -> dict:
    """Convert YAML action risk table to Python dict."""
    actions = yaml_data.get("action_risk_table", {})
    result = {}
    for action_id, a in actions.items():
        result[action_id] = {
            "risk": a.get("risk", "unknown"),
            "reversibility": a.get("reversibility", "unknown"),
            "always_review": a.get("always_requires_review", True),
            "authorized_roles": a.get("authorized_roles", []),
            "escalation_required_above": a.get("escalation_required_above", "medium"),
        }
    return result

ACTION_RISK_TABLE = _build_action_risk_from_yaml(_yaml_contracts) or {
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

DIMENSIONS = ["region", "channel"]

# ---------------------------------------------------------------------------
# Detection Thresholds
# ---------------------------------------------------------------------------
BASELINE_WINDOW_DAYS = 21
Z_MEDIUM_THRESHOLD = 1.5
Z_HIGH_THRESHOLD = 2.5

# Materiality two-gate thresholds
BUSINESS_IMPACT_MINIMUM_INR = 10000  # Minimum absolute INR delta to be considered material
MATERIALITY_REQUIRE_BOTH_GATES = True  # Must pass BOTH statistical AND business impact gates

# ---------------------------------------------------------------------------
# Evidence Weights — can be updated by feedback loop
# ---------------------------------------------------------------------------
def _build_evidence_weights_from_yaml(yaml_data: dict) -> dict:
    return yaml_data.get("evidence_weights", {})

EVIDENCE_WEIGHTS = _build_evidence_weights_from_yaml(_yaml_contracts) or {
    "correlation_strength": 0.30,
    "temporal_alignment": 0.25,
    "independent_corroboration": 0.25,
    "quasi_causal_evidence": 0.20,
    "contradiction_penalty": 0.30,
    "data_quality_penalty": 0.15,
}

# ---------------------------------------------------------------------------
# Confidence Bands
# ---------------------------------------------------------------------------
def _build_confidence_bands_from_yaml(yaml_data: dict) -> dict:
    bands = yaml_data.get("confidence_bands", {})
    return {k: v.get("threshold", 0.0) for k, v in bands.items()} if bands else {}

CONFIDENCE_BANDS = _build_confidence_bands_from_yaml(_yaml_contracts) or {
    "HIGH": 0.75, "MEDIUM": 0.45, "LOW": 0.20
}

ALWAYS_REQUIRE_HUMAN_REVIEW = True

# ---------------------------------------------------------------------------
# Full YAML contracts (for API serving)
# ---------------------------------------------------------------------------
def get_raw_yaml_contracts() -> dict:
    """Return the full parsed YAML contracts for the API endpoint."""
    return _yaml_contracts
