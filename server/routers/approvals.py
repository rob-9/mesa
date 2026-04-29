"""approval routes for human principals. populated alongside issue #18."""

from fastapi import APIRouter

router = APIRouter(prefix="/approvals", tags=["approvals"])
