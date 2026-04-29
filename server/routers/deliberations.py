"""deliberations routes: open, get, list, append event, query events."""

from fastapi import APIRouter

router = APIRouter(prefix="/deliberations", tags=["deliberations"])
