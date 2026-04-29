from fastapi import FastAPI

from server.routers import approvals, deliberations, health, principals, ws

app = FastAPI(title="summer", version="0.1.0")

app.include_router(health.router)
app.include_router(principals.router)
app.include_router(deliberations.router)
app.include_router(approvals.router)
app.include_router(ws.router)
