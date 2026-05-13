"""end-to-end sdk tests for the deliberations namespace."""

from __future__ import annotations

import pytest

from mesa_sdk import (
    Deliberation,
    Envelope,
    Forbidden,
    Keypair,
    MesaClient,
    Turn,
)
from mesa_sdk.errors import BadRequest, NotFound


def _register(client: MesaClient, capabilities: list[str]) -> tuple[Keypair, str]:
    kp = Keypair.generate()
    p = client.principals.create(org="acme", public_key=kp.public_key_hex)
    if capabilities:
        client.principals.set_capabilities(p.id, capabilities)
    return kp, p.id


def test_open_deliberation(sdk_client: MesaClient):
    d = sdk_client.deliberations.open(title="Q4 license")
    assert isinstance(d, Deliberation)
    assert d.title == "Q4 license"
    assert d.status == "open"
    assert d.stage == "offer"


def test_get_deliberation_embeds_turns_and_commitments(sdk_client: MesaClient):
    kp, principal_id = _register(sdk_client, capabilities=["offer"])
    d = sdk_client.deliberations.open(title="round trip")

    turn_env = Envelope(
        type="turn",
        emitted_by=principal_id,
        deliberation_id=d.id,
        payload={"content": "hello"},
    ).sign(kp)
    sdk_client.deliberations.append_turn(d.id, turn_env)

    commit_env = Envelope(
        type="offer",
        emitted_by=principal_id,
        deliberation_id=d.id,
        payload={"summary": "first offer", "terms": {}},
    ).sign(kp)
    sdk_client.commitments.create(commit_env)

    detail = sdk_client.deliberations.get(d.id)
    assert len(detail.turns) == 1
    assert detail.turns[0].content == "hello"
    assert isinstance(detail.turns[0], Turn)
    assert len(detail.commitments) == 1
    assert detail.commitments[0].type == "offer"


def test_list_deliberations(sdk_client: MesaClient):
    sdk_client.deliberations.open(title="a")
    sdk_client.deliberations.open(title="b")
    all_d = sdk_client.deliberations.list()
    assert {d.title for d in all_d} == {"a", "b"}


def test_list_deliberations_status_filter(sdk_client: MesaClient):
    d_open = sdk_client.deliberations.open(title="o")
    d_closed = sdk_client.deliberations.open(title="c")
    sdk_client.deliberations.close(d_closed.id)

    open_only = sdk_client.deliberations.list(status="open")
    assert {x.id for x in open_only} == {d_open.id}


def test_append_turn_appears_in_get(sdk_client: MesaClient):
    kp, principal_id = _register(sdk_client, capabilities=[])
    d = sdk_client.deliberations.open(title="x")
    env = Envelope(
        type="turn",
        emitted_by=principal_id,
        deliberation_id=d.id,
        payload={"content": "hi"},
    ).sign(kp)
    t = sdk_client.deliberations.append_turn(d.id, env)
    assert t.index == 0
    assert t.content == "hi"


def test_commitment_rejected_on_closed_deliberation(sdk_client: MesaClient):
    kp, principal_id = _register(sdk_client, capabilities=["offer"])
    d = sdk_client.deliberations.open(title="x")
    sdk_client.deliberations.close(d.id)
    env = Envelope(
        type="offer",
        emitted_by=principal_id,
        deliberation_id=d.id,
        payload={"summary": "x", "terms": {}},
    ).sign(kp)
    with pytest.raises(Forbidden) as exc:
        sdk_client.commitments.create(env)
    assert exc.value.code == "deliberation_closed"


def test_commitment_rejected_on_unknown_deliberation(sdk_client: MesaClient):
    kp, principal_id = _register(sdk_client, capabilities=["offer"])
    env = Envelope(
        type="offer",
        emitted_by=principal_id,
        deliberation_id="does-not-exist",
        payload={"summary": "x", "terms": {}},
    ).sign(kp)
    with pytest.raises(BadRequest) as exc:
        sdk_client.commitments.create(env)
    assert exc.value.status_code == 422
    assert exc.value.code == "unknown_deliberation"


def test_get_deliberation_unknown_raises_not_found(sdk_client: MesaClient):
    with pytest.raises(NotFound):
        sdk_client.deliberations.get("does-not-exist")
