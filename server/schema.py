"""json schema registry and validator for commitment payloads.

loads every `*.schema.json` under `schemas/commitments/<pack>/` at import time
and exposes lookup by bare type name (e.g. "offer", "license_terms"). bare
names must be unique across packs; we fail loudly at import if they collide
so the conflict can be resolved before any request hits the gate.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator
from jsonschema.exceptions import ValidationError

SCHEMAS_ROOT = Path(__file__).resolve().parents[1] / "schemas" / "commitments"


@dataclass(frozen=True)
class CommitmentSchema:
    type: str           # bare name, e.g. "offer"
    pack: str           # subdirectory, e.g. "core"
    path: Path
    validator: Draft202012Validator


def _load_all() -> dict[str, CommitmentSchema]:
    registry: dict[str, CommitmentSchema] = {}
    for path in sorted(SCHEMAS_ROOT.rglob("*.schema.json")):
        name = path.name.removesuffix(".schema.json")
        # `_common.schema.json` is a $defs holder, not a commitment type.
        if name.startswith("_"):
            continue
        pack = path.parent.name
        schema = json.loads(path.read_text())
        Draft202012Validator.check_schema(schema)
        if name in registry:
            other = registry[name]
            raise RuntimeError(
                f"duplicate commitment type '{name}': "
                f"{other.path} vs {path}. rename one or the registry will be ambiguous."
            )
        registry[name] = CommitmentSchema(
            type=name,
            pack=pack,
            path=path,
            validator=Draft202012Validator(schema),
        )
    return registry


_REGISTRY: dict[str, CommitmentSchema] = _load_all()


def known_types() -> list[str]:
    """all commitment types the server can validate. ordered."""
    return sorted(_REGISTRY.keys())


def get_schema(type_: str) -> CommitmentSchema | None:
    return _REGISTRY.get(type_)


class SchemaValidationError(Exception):
    """raised when a payload fails its commitment schema. carries the first
    validation error message for use in HTTP error bodies."""

    def __init__(self, type_: str, errors: list[ValidationError]):
        first = errors[0]
        super().__init__(f"{type_}: {first.message} (at {list(first.absolute_path)})")
        self.type = type_
        self.errors = errors


def validate(type_: str, payload: dict[str, Any]) -> None:
    schema = get_schema(type_)
    if schema is None:
        raise SchemaValidationError(
            type_, [ValidationError(f"unknown commitment type '{type_}'")]
        )
    errors = sorted(schema.validator.iter_errors(payload), key=lambda e: e.path)
    if errors:
        raise SchemaValidationError(type_, errors)
