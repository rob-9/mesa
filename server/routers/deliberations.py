"""deliberations routes: open, get, list, append event, query events.
populated in issue #14.
"""

from fastapi import APIRouter

router = APIRouter(prefix="/deliberations", tags=["deliberations"])
