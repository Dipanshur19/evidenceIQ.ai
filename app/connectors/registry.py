"""
Central Enterprise Connector Registry & Health Manager.
Manages data warehouse connector instances and schema discovery.
"""

from typing import Dict, List, Any, Optional
from .base_connector import BaseConnector
from .snowflake_connector import SnowflakeConnector
from .bigquery_connector import BigQueryConnector
from .databricks_connector import DatabricksConnector
from .saphana_connector import SapHanaConnector


class ConnectorRegistry:
    def __init__(self):
        self._connectors: Dict[str, BaseConnector] = {}
        self._init_default_connectors()

    def _init_default_connectors(self):
        self.register(SnowflakeConnector())
        self.register(BigQueryConnector())
        self.register(DatabricksConnector())
        self.register(SapHanaConnector())

    def register(self, connector: BaseConnector):
        self._connectors[connector.connector_id] = connector

    def get(self, connector_id: str) -> Optional[BaseConnector]:
        return self._connectors.get(connector_id)

    def list_connectors(self) -> List[Dict[str, Any]]:
        return [c.get_status() for c in self._connectors.values()]

    def test_connector(self, connector_id: str) -> Dict[str, Any]:
        c = self.get(connector_id)
        if not c:
            return {"status": "error", "message": f"Connector '{connector_id}' not found."}
        return c.test_connection()

    def introspect_connector(self, connector_id: str) -> Dict[str, Any]:
        c = self.get(connector_id)
        if not c:
            return {"status": "error", "message": f"Connector '{connector_id}' not found."}
        return c.introspect_schema()


# Global singleton registry
connector_registry = ConnectorRegistry()
