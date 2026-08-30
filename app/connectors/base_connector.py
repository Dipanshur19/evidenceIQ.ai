"""
Base Enterprise Data Warehouse Connector Interface.
Standardizes schema introspection, authentication testing, and KPI timeseries querying.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import pandas as pd


class BaseConnector(ABC):
    def __init__(self, connector_id: str, name: str, connector_type: str, config: Dict[str, Any]):
        self.connector_id = connector_id
        self.name = name
        self.connector_type = connector_type
        self.config = config
        self.is_connected = False
        self.last_sync_time: Optional[str] = None
        self.last_error: Optional[str] = None

    @abstractmethod
    def test_connection(self) -> Dict[str, Any]:
        """Verify credentials and ping the data warehouse."""
        pass

    @abstractmethod
    def introspect_schema(self) -> Dict[str, Any]:
        """Fetch available databases, schemas, tables, and metric columns."""
        pass

    @abstractmethod
    def fetch_kpi_series(self, metric_id: str, dimension_scope: Dict[str, Any], start_date: str, end_date: str) -> pd.DataFrame:
        """Query aggregated KPI timeseries from the warehouse."""
        pass

    def get_status(self) -> Dict[str, Any]:
        return {
            "connector_id": self.connector_id,
            "name": self.name,
            "connector_type": self.connector_type,
            "is_connected": self.is_connected,
            "last_sync_time": self.last_sync_time,
            "last_error": self.last_error,
            "host_masked": self.config.get("host") or self.config.get("account") or "cloud.enterprise.com",
            "database": self.config.get("database", "ANALYTICS_PROD"),
        }
