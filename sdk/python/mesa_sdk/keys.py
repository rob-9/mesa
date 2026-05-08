"""ed25519 keypair: generate, sign, verify, hex round-trip.

wraps pynacl/libsodium. matches the byte semantics of server/identity/keys.py
so signatures produced here verify on the server.
"""

from __future__ import annotations

from dataclasses import dataclass

from nacl.exceptions import BadSignatureError
from nacl.signing import SigningKey, VerifyKey


@dataclass(frozen=True)
class Keypair:
    private_key: bytes
    public_key: bytes

    @classmethod
    def generate(cls) -> "Keypair":
        sk = SigningKey.generate()
        return cls(private_key=bytes(sk), public_key=bytes(sk.verify_key))

    @classmethod
    def from_hex(cls, private_key_hex: str) -> "Keypair":
        try:
            private_key = bytes.fromhex(private_key_hex)
        except ValueError as e:
            raise ValueError("private_key_hex must be hex-encoded") from e
        if len(private_key) != 32:
            raise ValueError("private_key must be 32 bytes (64 hex chars)")
        sk = SigningKey(private_key)
        return cls(private_key=bytes(sk), public_key=bytes(sk.verify_key))

    @property
    def private_key_hex(self) -> str:
        return self.private_key.hex()

    @property
    def public_key_hex(self) -> str:
        return self.public_key.hex()

    def sign(self, message: bytes) -> bytes:
        return SigningKey(self.private_key).sign(message).signature

    def verify(self, message: bytes, signature: bytes) -> bool:
        try:
            VerifyKey(self.public_key).verify(message, signature)
            return True
        except BadSignatureError:
            return False
