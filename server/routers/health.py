"""liveness probe. returns 200 ok when the process is up.
used by docker, kubernetes, and load balancers.
"""

from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
