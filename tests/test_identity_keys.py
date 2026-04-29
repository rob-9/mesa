from server.identity.keys import generate_keypair, sign, verify


def test_generate_keypair_lengths():
    sk, pk = generate_keypair()
    assert len(sk) == 32
    assert len(pk) == 32


def test_sign_verify_roundtrip():
    sk, pk = generate_keypair()
    msg = b"hello summer"
    sig = sign(msg, sk)
    assert verify(msg, sig, pk) is True


def test_signature_is_64_bytes():
    sk, _ = generate_keypair()
    sig = sign(b"x", sk)
    assert len(sig) == 64


def test_verify_rejects_tampered_message():
    sk, pk = generate_keypair()
    sig = sign(b"original", sk)
    assert verify(b"tampered", sig, pk) is False


def test_verify_rejects_wrong_key():
    sk1, _ = generate_keypair()
    _, pk2 = generate_keypair()
    sig = sign(b"msg", sk1)
    assert verify(b"msg", sig, pk2) is False
