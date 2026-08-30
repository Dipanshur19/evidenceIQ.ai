"""
Pydantic response/request models for the FastAPI layer.
"""

from typing import Optional
from pydantic import BaseModel


class InvestigateRequest(BaseModel):
    region: str
    channel: str
    as_of_date: str
    persona: str = "analyst"


class DecisionRequest(BaseModel):
    investigation_id: str
    hypothesis_id: str
    recommendation_id: Optional[str] = None
    decided_by: str = "analyst"
    decision: str
    justification: str


class OutcomeRequest(BaseModel):
    decision_id: str
    kpi_delta: float
    hypothesis_confirmed: bool
