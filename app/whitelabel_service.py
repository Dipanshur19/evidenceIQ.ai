"""
Phase 4: White-Label Platform Licensing for Accenture Consulting Engagements.
Enables instant tenant re-branding, custom client palettes, engagement tracking codes,
and dedicated enterprise portal hostnames.
"""

from datetime import datetime, timezone
from typing import Dict, List, Any
from . import db


BRANDING_PRESETS = [
    {
        "tenant_id": "tenant:accenture_diamond",
        "brand_name": "Accenture KPI Intelligence Suite",
        "preset_name": "Accenture Diamond Practice",
        "primary_color": "#A100FF",
        "secondary_color": "#8B5CF6",
        "logo_symbol": ">",
        "engagement_code": "ACN-ENG-2026-DIAMOND-01",
        "custom_domain": "kpi-intelligence.accenture.com",
    },
    {
        "tenant_id": "tenant:nordic_retail",
        "brand_name": "Nordic Commerce Intelligence Hub",
        "preset_name": "Retail Fleet Operations",
        "primary_color": "#0284C7",
        "secondary_color": "#10B981",
        "logo_symbol": "⬡",
        "engagement_code": "ACN-ENG-2026-NORDIC-RETAIL",
        "custom_domain": "kpi.nordicretailgroup.com",
    },
    {
        "tenant_id": "tenant:apex_fintech",
        "brand_name": "Apex Fleet Intelligence Engine",
        "preset_name": "Banking & Fintech Tier 1",
        "primary_color": "#10B981",
        "secondary_color": "#F59E0B",
        "logo_symbol": "⚡",
        "engagement_code": "ACN-ENG-2026-APEX-FIN",
        "custom_domain": "intelligence.apexfintech.com",
    },
]


class WhiteLabelService:
    def __init__(self):
        self.ensure_default_config_seeded()

    def ensure_default_config_seeded(self):
        """Seeds default Accenture Diamond configuration into whitelabel_config table if empty."""
        with db.get_conn() as conn:
            count = conn.execute("SELECT COUNT(*) FROM whitelabel_config").fetchone()[0]
            if count == 0:
                now_iso = datetime.now(timezone.utc).isoformat()
                default = BRANDING_PRESETS[0]
                conn.execute(
                    """INSERT OR REPLACE INTO whitelabel_config
                       (tenant_id, brand_name, preset_name, primary_color, secondary_color,
                        logo_symbol, engagement_code, custom_domain, updated_at)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                    (
                        default["tenant_id"],
                        default["brand_name"],
                        default["preset_name"],
                        default["primary_color"],
                        default["secondary_color"],
                        default["logo_symbol"],
                        default["engagement_code"],
                        default["custom_domain"],
                        now_iso,
                    ),
                )

    def get_active_config(self) -> Dict[str, Any]:
        """Returns the currently active enterprise white-label branding configuration."""
        self.ensure_default_config_seeded()
        with db.get_conn() as conn:
            row = conn.execute("SELECT * FROM whitelabel_config LIMIT 1").fetchone()
            if row:
                return dict(row)
        return BRANDING_PRESETS[0]

    def update_config(
        self,
        tenant_id: str,
        brand_name: str,
        preset_name: str = "Custom Enterprise Engagement",
        primary_color: str = "#A100FF",
        secondary_color: str = "#8B5CF6",
        logo_symbol: str = ">",
        engagement_code: str = "ACN-CUSTOM-2026",
        custom_domain: str = "custom.evidenceiq.ai",
    ) -> Dict[str, Any]:
        """Updates and persists client white-label branding parameters."""
        now_iso = datetime.now(timezone.utc).isoformat()
        with db.get_conn() as conn:
            conn.execute("DELETE FROM whitelabel_config")
            conn.execute(
                """INSERT INTO whitelabel_config
                   (tenant_id, brand_name, preset_name, primary_color, secondary_color,
                    logo_symbol, engagement_code, custom_domain, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    tenant_id,
                    brand_name,
                    preset_name,
                    primary_color,
                    secondary_color,
                    logo_symbol,
                    engagement_code,
                    custom_domain,
                    now_iso,
                ),
            )
        return {
            "status": "updated",
            "tenant_id": tenant_id,
            "brand_name": brand_name,
            "preset_name": preset_name,
            "primary_color": primary_color,
            "secondary_color": secondary_color,
            "logo_symbol": logo_symbol,
            "engagement_code": engagement_code,
            "custom_domain": custom_domain,
            "updated_at": now_iso,
        }

    def list_presets(self) -> List[Dict[str, Any]]:
        """Returns the pre-configured Accenture client branding templates."""
        return BRANDING_PRESETS


whitelabel_service = WhiteLabelService()
