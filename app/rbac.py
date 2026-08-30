"""
Role-Based Access Control (RBAC) Module (Round 2, Objective 8, Min Expectation #7).

Enforces row-level, column-level, and domain-level security at the semantic layer
so filtering happens once, centrally, and is respected identically regardless of
which tool or persona's narrative consumes the data.

Pattern follows Power BI / Snowflake RLS model:
- Workspace roles control who gets in
- RLS (via policy) controls what they see once inside
- Sensitivity labels protect exported content

Method type: deterministic_business_rules
"""

import yaml
import os
from . import config


# Role definitions with RLS policies
ROLE_DEFINITIONS = {
    "executive": {
        "display_name": "Executive / Business Sponsor",
        "data_scope": "all_regions",
        "row_filter": None,  # No row filter — sees all regions
        "field_access": {
            "visible": ["display_name", "observed_value", "expected_value", "delta_pct",
                        "severity", "recommendation", "confidence_band"],
            "hidden": ["z_score", "sigma", "lineage", "scoring_breakdown",
                       "method_type", "raw_evidence_nodes"],
        },
        "can_approve_actions": ["pause_campaign", "discontinue_product_line"],
        "sensitivity_label": "CONFIDENTIAL",
        "narrative_focus": "high_level_business_impact",
    },
    "analyst": {
        "display_name": "Operations / BI Analyst",
        "data_scope": "all_regions",
        "row_filter": None,
        "field_access": {
            "visible": ["*"],  # Full access
            "hidden": [],
        },
        "can_approve_actions": ["rollback_release", "pause_campaign", "price_adjustment"],
        "sensitivity_label": "INTERNAL",
        "narrative_focus": "technical_deep_dive",
    },
    "regional_manager": {
        "display_name": "Regional Operations Manager",
        "data_scope": "own_region_only",
        "row_filter": "region = current_user_region",
        "field_access": {
            "visible": ["display_name", "observed_value", "delta_pct", "severity",
                        "recommendation", "confidence_band", "parameters_inspected"],
            "hidden": ["z_score", "sigma", "lineage", "scoring_breakdown"],
        },
        "can_approve_actions": ["increase_inventory"],
        "sensitivity_label": "INTERNAL",
        "narrative_focus": "regional_operational_impact",
    },
}

# Simulated user-role-region mapping (in production, from identity provider)
USER_PROFILES = {
    "admin@evidenceiq.ai": {"role": "analyst", "region": None, "name": "System Admin"},
    "cfo@evidenceiq.ai": {"role": "executive", "region": None, "name": "Chief Financial Officer"},
    "analyst@evidenceiq.ai": {"role": "analyst", "region": None, "name": "Senior BI Analyst"},
    "manager_north@evidenceiq.ai": {"role": "regional_manager", "region": "Region_A", "name": "North Region Manager"},
    "manager_south@evidenceiq.ai": {"role": "regional_manager", "region": "Region_B", "name": "South Region Manager"},
    "manager_east@evidenceiq.ai": {"role": "regional_manager", "region": "Region_C", "name": "East Region Manager"},
    "manager_west@evidenceiq.ai": {"role": "regional_manager", "region": "Region_D", "name": "West Region Manager"},
}


def get_user_profile(user_id: str = "analyst@evidenceiq.ai") -> dict:
    """Get user profile with role and region assignment."""
    profile = USER_PROFILES.get(user_id, {"role": "analyst", "region": None, "name": "Default Analyst"})
    role_def = ROLE_DEFINITIONS.get(profile["role"], ROLE_DEFINITIONS["analyst"])
    return {
        "user_id": user_id,
        "role": profile["role"],
        "region": profile.get("region"),
        "name": profile.get("name", user_id),
        "role_definition": role_def,
    }


def enforce_row_level_security(data: dict, user_id: str = "analyst@evidenceiq.ai") -> dict:
    """
    Apply Row-Level Security (RLS) to investigation output.
    Regional managers only see data for their assigned region.
    """
    profile = get_user_profile(user_id)
    role = profile["role"]
    user_region = profile.get("region")
    role_def = profile["role_definition"]

    if role_def["data_scope"] == "own_region_only" and user_region:
        # Filter anomaly data to user's region
        anomaly = data.get("anomaly", {})
        dim_scope = anomaly.get("dimension_scope", {})
        data_region = dim_scope.get("region", "")

        # Map region names
        region_map = {
            "Region_A": "Region_A", "North_India": "Region_A",
            "Region_B": "Region_B", "South_India": "Region_B",
            "Region_C": "Region_C", "East_India": "Region_C",
            "Region_D": "Region_D", "West_India": "Region_D",
        }
        normalized_data_region = region_map.get(data_region, data_region)
        normalized_user_region = region_map.get(user_region, user_region)

        if normalized_data_region != normalized_user_region:
            return {
                "status": "access_denied",
                "reason": f"Row-Level Security: User '{profile['name']}' (role: {role}) "
                          f"is restricted to {user_region} data. Requested data is for {data_region}.",
                "user_region": user_region,
                "requested_region": data_region,
                "method_type": "deterministic_business_rules",
                "rbac_enforced": True,
            }

    # Apply field-level filtering
    filtered_data = _apply_field_level_security(data, role_def)
    filtered_data["rbac_metadata"] = {
        "user_id": user_id,
        "role": role,
        "data_scope": role_def["data_scope"],
        "sensitivity_label": role_def["sensitivity_label"],
        "fields_hidden": role_def["field_access"]["hidden"],
        "rbac_enforced": True,
        "method_type": "deterministic_business_rules",
    }

    return filtered_data


def _apply_field_level_security(data: dict, role_def: dict) -> dict:
    """Remove hidden fields from output based on role definition."""
    hidden = set(role_def["field_access"]["hidden"])
    if not hidden or "*" in role_def["field_access"]["visible"]:
        return data  # Full access

    filtered = {}
    for key, value in data.items():
        if key in hidden:
            continue
        if isinstance(value, dict):
            # Recursively filter nested dicts
            inner = {}
            for k, v in value.items():
                if k not in hidden:
                    inner[k] = v
            filtered[key] = inner
        else:
            filtered[key] = value

    return filtered


def check_action_authorization(user_id: str, action_category: str) -> dict:
    """
    Check if a user is authorized to approve a given action category.
    High-risk/irreversible actions always route to human review
    independent of model confidence.
    """
    profile = get_user_profile(user_id)
    role_def = profile["role_definition"]
    can_approve = role_def.get("can_approve_actions", [])

    authorized = action_category in can_approve

    return {
        "user_id": user_id,
        "role": profile["role"],
        "action_category": action_category,
        "authorized": authorized,
        "reason": f"Role '{profile['role']}' {'can' if authorized else 'cannot'} approve '{action_category}'.",
        "escalation_needed": not authorized,
        "escalate_to": "executive" if not authorized else None,
        "method_type": "deterministic_business_rules",
    }


def list_roles() -> list:
    """List all role definitions for the RBAC configuration UI."""
    roles = []
    for role_id, role_def in ROLE_DEFINITIONS.items():
        roles.append({
            "role_id": role_id,
            "display_name": role_def["display_name"],
            "data_scope": role_def["data_scope"],
            "row_filter": role_def["row_filter"],
            "can_approve_actions": role_def.get("can_approve_actions", []),
            "sensitivity_label": role_def["sensitivity_label"],
            "narrative_focus": role_def["narrative_focus"],
            "hidden_fields_count": len(role_def["field_access"]["hidden"]),
        })
    return roles


def list_users() -> list:
    """List all user profiles."""
    users = []
    for uid, profile in USER_PROFILES.items():
        users.append({
            "user_id": uid,
            "name": profile["name"],
            "role": profile["role"],
            "region": profile.get("region"),
        })
    return users
