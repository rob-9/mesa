"""pydantic models mirroring the server's wire shapes.

defined in the sdk so consumers don't depend on `server.*`. mirrors
server/routers/principals.py request/response schemas.
"""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class PrincipalCreate(BaseModel):
    org: str = Field(min_length=1, max_length=255)
    public_key: str = Field(min_length=64, max_length=64)


class Principal(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    org: str
    public_key: str
    created_at: datetime
