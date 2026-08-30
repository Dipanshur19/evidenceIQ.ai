"""
Multi-Tenant Workspace & SSO SAML/OIDC Integration.
Provides tenant-isolated namespaces and SSO identity claims parsing.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone


class TenantManager:
    def __init__(self):
        self.tenants = {
            "tenant_accenture_retail": {
                "tenant_id": "tenant_accenture_retail",
                "name": "Accenture Retail Solutions (APAC)",
                "plan": "Enterprise Tier",
                "sso_provider": "Okta Enterprise (SAML 2.0)",
                "domains": ["accenture.com", "retail.accenture.com"],
                "data_region": "ap-south-1 (Mumbai)",
                "created_at": "2026-01-10T00:00:00Z",
                "active_users": 48,
                "kpis_monitored": 12,
            },
            "tenant_global_cpg": {
                "tenant_id": "tenant_global_cpg",
                "name": "Global CPG & Omnichannel Corp",
                "plan": "Enterprise Tier",
                "sso_provider": "Azure Active Directory (OIDC)",
                "domains": ["globalcpg.com"],
                "data_region": "eu-west-1 (Frankfurt)",
                "created_at": "2026-02-15T00:00:00Z",
                "active_users": 115,
                "kpis_monitored": 34,
            },
        }

    def list_tenants(self) -> List[Dict[str, Any]]:
        return list(self.tenants.values())

    def get_tenant(self, tenant_id: str) -> Dict[str, Any]:
        return self.tenants.get(tenant_id, self.tenants["tenant_accenture_retail"])

    def parse_sso_claims(self, sso_token: str) -> Dict[str, Any]:
        """
        Simulates parsing a verified SAML 2.0 / OIDC JWT token from Okta or Azure AD.
        """
        return {
            "sub": "usr_998124_senior_analyst",
            "email": "analyst@accenture.com",
            "name": "Senior Operations Analyst",
            "tenant_id": "tenant_accenture_retail",
            "roles": ["analyst", "investigator"],
            "idp": "Okta SAML 2.0",
            "mfa_verified": True,
            "session_expires_at": datetime.now(timezone.utc).isoformat(),
        }


tenant_manager = TenantManager()
