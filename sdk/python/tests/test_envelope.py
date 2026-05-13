import pytest

from mesa_sdk.envelope import Envelope
from mesa_sdk.keys import Keypair


def _envelope() -> Envelope:
    return Envelope(
        type="commitment.proposed",
        emitted_by="principal-abc",
        payload={"summary": "an offer", "terms": ["a", "b"]},
        parent_id=None,
        id="evt-1",
        timestamp="2026-05-08T00:00:00Z",
    )


def test_canonical_bytes_are_deterministic_under_key_reorder():
    e1 = Envelope(
        type="t",
        emitted_by="p",
        payload={"a": 1, "b": 2},
        parent_id=None,
        id="evt-1",
        timestamp="2026-05-08T00:00:00Z",
    )
    e2 = Envelope(
        type="t",
        emitted_by="p",
        payload={"b": 2, "a": 1},
        parent_id=None,
        id="evt-1",
        timestamp="2026-05-08T00:00:00Z",
    )
    assert e1.canonical_bytes() == e2.canonical_bytes()


def test_canonical_bytes_exclude_signature_field():
    e = _envelope()
    bytes_before = e.canonical_bytes()
    signed = e.sign(Keypair.generate())
    assert "signature" in signed
    e_with_sig = Envelope(**{k: v for k, v in signed.items() if k != "signature"})
    assert e_with_sig.canonical_bytes() == bytes_before


def test_sign_returns_dict_with_hex_signature():
    kp = Keypair.generate()
    signed = _envelope().sign(kp)
    assert set(signed.keys()) == {
        "id",
        "parent_id",
        "timestamp",
        "type",
        "emitted_by",
        "deliberation_id",
        "payload",
        "signature",
    }
    assert len(signed["signature"]) == 128
    int(signed["signature"], 16)


def test_signature_verifies_against_signer_public_key():
    kp = Keypair.generate()
    e = _envelope()
    signed = e.sign(kp)
    sig = bytes.fromhex(signed["signature"])
    assert kp.verify(e.canonical_bytes(), sig) is True


def test_mutating_payload_after_signing_breaks_verification():
    kp = Keypair.generate()
    e = _envelope()
    signed = e.sign(kp)
    sig = bytes.fromhex(signed["signature"])
    tampered = Envelope(
        type=signed["type"],
        emitted_by=signed["emitted_by"],
        payload={**signed["payload"], "summary": "different"},
        parent_id=signed["parent_id"],
        id=signed["id"],
        timestamp=signed["timestamp"],
    )
    assert kp.verify(tampered.canonical_bytes(), sig) is False


def test_default_id_and_timestamp_are_filled_in():
    e = Envelope(type="t", emitted_by="p", payload={})
    assert e.id
    assert e.timestamp


def test_canonical_bytes_refuses_nan_and_infinity():
    for bad in (float("nan"), float("inf"), float("-inf")):
        e = Envelope(type="t", emitted_by="p", payload={"x": bad})
        with pytest.raises(ValueError):
            e.canonical_bytes()
