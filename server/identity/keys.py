"""ed25519 keypair generation, sign, verify."""

from nacl.exceptions import BadSignatureError
from nacl.signing import SigningKey, VerifyKey


def generate_keypair() -> tuple[bytes, bytes]:
    """returns (private_key, public_key), each 32 bytes."""
    sk = SigningKey.generate()
    return bytes(sk), bytes(sk.verify_key)


def sign(message: bytes, private_key: bytes) -> bytes:
    """returns 64-byte ed25519 signature."""
    return SigningKey(private_key).sign(message).signature


def verify(message: bytes, signature: bytes, public_key: bytes) -> bool:
    try:
        VerifyKey(public_key).verify(message, signature)
        return True
    except BadSignatureError:
        return False
