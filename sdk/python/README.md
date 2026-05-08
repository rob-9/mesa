# mesa-sdk (python)

python client for the [mesa](../../README.md) server.

## install

```
pip install -e sdk/python
```

## quickstart

```python
from mesa_sdk import Envelope, Keypair, MesaClient

kp = Keypair.generate()

with MesaClient("http://localhost:8000") as client:
    client.health()                                                  # {"status": "ok"}

    me = client.principals.create(org="acme", public_key=kp.public_key_hex)
    client.principals.get(me.id)
    client.principals.list()

    # signed event envelope, ready for /deliberations when it lands
    event = Envelope(
        type="commitment.proposed",
        emitted_by=me.id,
        payload={"summary": "first offer"},
    ).sign(kp)
```

## what's covered

| capability         | status |
|--------------------|--------|
| `GET /health`      | ✓      |
| `POST /principals` | ✓      |
| `GET /principals`, `GET /principals/{id}` | ✓ |
| ed25519 keypair (`Keypair`) | ✓ |
| canonical-JSON event envelope + signing (`Envelope`) | ✓ |
| typed errors (`NotFound`, `Conflict`, `Unauthorized`, `BadRequest`, `MesaError`) | ✓ |
| async client | — |
| websocket subscribe | — |
| `/deliberations` routes | — (server stub) |
| jwt capability tokens | — (server stub) |

## errors

non-2xx responses raise:

- `NotFound` — 404
- `Conflict` — 409 (e.g. duplicate `public_key`)
- `Unauthorized` — 401
- `BadRequest` — other 4xx
- `MesaError` — 5xx / network / unmapped

each carries `.status_code` and `.body`.

## tests

```
cd sdk/python
pytest
```

tests run against the real fastapi handlers via `fastapi.testclient.TestClient`
backed by an in-memory sqlite db; no docker, no network.
