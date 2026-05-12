import pytest

from mesa_sdk.keys import Keypair


def test_generate_produces_distinct_keypairs():
    a = Keypair.generate()
    b = Keypair.generate()
    assert a.private_key_hex != b.private_key_hex
    assert a.public_key_hex != b.public_key_hex


def test_public_and_private_hex_are_64_chars():
    kp = Keypair.generate()
    assert len(kp.public_key_hex) == 64
    assert len(kp.private_key_hex) == 64
    int(kp.public_key_hex, 16)
    int(kp.private_key_hex, 16)


def test_sign_and_verify_round_trip():
    kp = Keypair.generate()
    msg = b"hello mesa"
    sig = kp.sign(msg)
    assert len(sig) == 64
    assert kp.verify(msg, sig) is True


def test_verify_rejects_tampered_message():
    kp = Keypair.generate()
    sig = kp.sign(b"original")
    assert kp.verify(b"tampered", sig) is False


def test_verify_rejects_wrong_signer():
    a = Keypair.generate()
    b = Keypair.generate()
    sig = a.sign(b"msg")
    assert b.verify(b"msg", sig) is False


def test_from_hex_round_trip():
    original = Keypair.generate()
    restored = Keypair.from_hex(original.private_key_hex)
    assert restored.private_key_hex == original.private_key_hex
    assert restored.public_key_hex == original.public_key_hex
    sig = original.sign(b"x")
    assert restored.verify(b"x", sig) is True


def test_from_hex_rejects_non_hex():
    with pytest.raises(ValueError):
        Keypair.from_hex("not-hex")


def test_from_hex_rejects_wrong_length():
    with pytest.raises(ValueError):
        Keypair.from_hex("ab" * 16)


def test_repr_does_not_leak_private_key():
    kp = Keypair.generate()
    text = repr(kp)
    assert "redacted" in text
    assert kp.private_key_hex not in text
    assert repr(kp.private_key) not in text
    assert kp.public_key_hex in text
