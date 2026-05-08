import pytest

from mesa_sdk import Keypair, MesaClient
from mesa_sdk.errors import Conflict, NotFound
from mesa_sdk.models import Principal


def test_health(sdk_client: MesaClient):
    assert sdk_client.health() == {"status": "ok"}


def test_create_principal_returns_typed_model(sdk_client: MesaClient):
    kp = Keypair.generate()
    p = sdk_client.principals.create(org="acme", public_key=kp.public_key_hex)
    assert isinstance(p, Principal)
    assert p.org == "acme"
    assert p.public_key == kp.public_key_hex
    assert p.id


def test_get_principal_round_trip(sdk_client: MesaClient):
    kp = Keypair.generate()
    created = sdk_client.principals.create(org="acme", public_key=kp.public_key_hex)
    fetched = sdk_client.principals.get(created.id)
    assert fetched.id == created.id
    assert fetched.public_key == created.public_key


def test_get_principal_missing_raises_not_found(sdk_client: MesaClient):
    with pytest.raises(NotFound):
        sdk_client.principals.get("does-not-exist")


def test_duplicate_public_key_raises_conflict(sdk_client: MesaClient):
    kp = Keypair.generate()
    sdk_client.principals.create(org="acme", public_key=kp.public_key_hex)
    with pytest.raises(Conflict):
        sdk_client.principals.create(org="acme-2", public_key=kp.public_key_hex)


def test_list_principals(sdk_client: MesaClient):
    kp1 = Keypair.generate()
    kp2 = Keypair.generate()
    sdk_client.principals.create(org="a", public_key=kp1.public_key_hex)
    sdk_client.principals.create(org="b", public_key=kp2.public_key_hex)
    listed = sdk_client.principals.list()
    assert len(listed) == 2
    assert all(isinstance(p, Principal) for p in listed)
    assert {p.org for p in listed} == {"a", "b"}


def test_signature_from_sdk_verifies_with_server_keys(sdk_client: MesaClient):
    """sanity-check that mesa_sdk.Keypair.sign produces a signature the server's
    own ed25519 verify accepts. confirms wire compatibility."""
    from server.identity.keys import verify as server_verify

    kp = Keypair.generate()
    msg = b"some bytes the server will eventually validate"
    sig = kp.sign(msg)
    assert server_verify(msg, sig, kp.public_key) is True
