"""principals routes: register, get, list. populated in issue #2."""

from fastapi import APIRouter

router = APIRouter(prefix="/principals", tags=["principals"])
