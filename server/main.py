"""fastapi app entrypoint. wires every router into a single application instance.
imported by uvicorn (`uvicorn server.main:app`) and by the test client.
"""

from fastapi import FastAPI

from server.routers import (
    approvals,
    commitments,
    deliberations,
    health,
    principals,
    ws,
)

app = FastAPI(title="summer", version="0.1.0")

app.include_router(health.router)
app.include_router(principals.router)
app.include_router(commitments.router)
app.include_router(deliberations.router)
app.include_router(approvals.router)
app.include_router(ws.router)
