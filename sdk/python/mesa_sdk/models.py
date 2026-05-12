"""pydantic models mirroring the server's wire shapes.

defined in the sdk so consumers don't depend on `server.*`. mirrors
server/routers/{principals,commitments}.py request/response schemas.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class PrincipalCreate(BaseModel):
    org: str = Field(min_length=1, max_length=255)
    public_key: str = Field(min_length=64, max_length=64)


class Principal(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org: str
    public_key: str
    capabilities: list[str] = Field(default_factory=list)
    created_at: datetime


class Decision(BaseModel):
    """policy gate verdict returned alongside a successfully-created commitment.

    action: "allow" | "flag" | "route" (block aborts with 403; never returned here)
    applied: list of policies that fired, each with policy_id/name/action/route_to.
    """

    action: str
    applied: list[dict[str, Any]] = Field(default_factory=list)


class Commitment(BaseModel):
    id: str
    type: str
    principal_id: str
    status: str
    decision: Decision
