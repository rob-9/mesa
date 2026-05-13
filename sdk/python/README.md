# mesa-sdk (python)

python client for the [mesa](../../README.md) server.

## install

```
pip install -e sdk/python
```

## quickstart

```python
from mesa_sdk import Envelope, Forbidden, Keypair, MesaClient

kp = Keypair.generate()

with MesaClient("http://localhost:8000") as client:
    # 1. register — ops still needs to grant capabilities via PUT /principals/{id}/capabilities
    me = client.principals.create(org="acme", public_key=kp.public_key_hex)

    # 2. sign an offer
    env = Envelope(
        type="offer",
        emitted_by=me.id,
        payload={"summary": "license $40k/yr", "terms": {"fee_total_usd": 40000}},
    ).sign(kp)

    # 3. submit through the gate (signature → authority → schema → policy)
    try:
        c = client.commitments.create(env)
        print(c.status, c.decision.action)         # "active" or "flagged"
        for fired in c.decision.applied:
            print(fired["policy_name"], fired["action"])
    except Forbidden as e:
        # authority denied OR policy blocked — `e.code` discriminates
        print(e.code, e.detail)
```

## what's covered

| capability                                | status |
|-------------------------------------------|--------|
| `GET /health`                             | ✓      |
| `POST /principals`                        | ✓      |
| `GET /principals`, `GET /principals/{id}` | ✓      |
| `PUT /principals/{id}/capabilities`       | ✓ (admin) |
| `POST /commitments`                       | ✓      |
| ed25519 keypair (`Keypair`)               | ✓      |
| canonical-JSON envelope + signing (`Envelope`) | ✓ |
| typed errors (`Forbidden`, `Unauthorized`, `NotFound`, `Conflict`, `BadRequest`, `MesaError`) | ✓ |
| async client                              | —      |
| websocket subscribe                       | —      |
| `/deliberations` routes                   | — (server stub) |
| jwt capability tokens                     | — (server stub) |

## errors

non-2xx responses raise typed exceptions:

- `Unauthorized` — 401 (signature failure, unknown principal)
- `Forbidden` — 403 (authority denied, policy block, admin gate)
- `NotFound` — 404
- `Conflict` — 409 (e.g. duplicate `public_key`)
- `BadRequest` — other 4xx (422, malformed payload)
- `MesaError` — 5xx / network / unmapped

each carries `.status_code`, `.body`, and (when the server returned structured detail) `.code` and `.detail` for programmatic dispatch.

## granting capabilities (admin)

```python
# requires the X-Admin-Token header — only meaningful from an operator-side client.
import httpx
httpx.put(
    f"http://localhost:8000/principals/{me.id}/capabilities",
    headers={"X-Admin-Token": "<MESA_ADMIN_TOKEN>"},
    json={"capabilities": ["offer", "counter"]},
)
```

the SDK also exposes `client.principals.set_capabilities(id, [...])` which sends the same request — pair it with an httpx transport that adds the header, or set the header on a custom `httpx.Client` passed via `MesaClient(http=...)`.

## tests

```
cd sdk/python
pytest
```

tests run against the real fastapi handlers via `fastapi.testclient.TestClient` backed by an in-memory sqlite db; no docker, no network.
