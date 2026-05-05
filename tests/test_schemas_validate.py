"""Every schema in schemas/commitments/ must be valid JSON Schema."""
from __future__ import annotations

import json
from pathlib import Path

import pytest
from jsonschema import Draft202012Validator

SCHEMAS_ROOT = Path(__file__).resolve().parents[1] / "schemas" / "commitments"


def _schema_files() -> list[Path]:
    return sorted(SCHEMAS_ROOT.rglob("*.schema.json"))


@pytest.mark.parametrize("schema_path", _schema_files(), ids=lambda p: str(p.relative_to(SCHEMAS_ROOT)))
def test_schema_is_valid_json_schema(schema_path: Path) -> None:
    schema = json.loads(schema_path.read_text())
    Draft202012Validator.check_schema(schema)


def test_schemas_directory_is_not_empty() -> None:
    assert _schema_files(), "no schemas found under schemas/commitments/"


FIXTURES_ROOT = Path(__file__).resolve().parent / "fixtures" / "commitments"

EXAMPLE_TO_SCHEMA = {
    "offer.example.json": SCHEMAS_ROOT / "core" / "offer.schema.json",
    "license_terms.example.json": SCHEMAS_ROOT / "datasharing" / "license_terms.schema.json",
}


@pytest.mark.parametrize("example_name,schema_path", list(EXAMPLE_TO_SCHEMA.items()))
def test_example_conforms_to_schema(example_name: str, schema_path: Path) -> None:
    example = json.loads((FIXTURES_ROOT / example_name).read_text())
    schema = json.loads(schema_path.read_text())
    Draft202012Validator(schema).validate(example)
