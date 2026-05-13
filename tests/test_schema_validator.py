"""tests for the commitment-schema registry + validate()."""

import pytest

from server.schema import (
    SchemaValidationError,
    get_schema,
    known_types,
    validate,
)


def test_known_types_includes_core_and_datasharing():
    types = known_types()
    assert "offer" in types
    assert "license_terms" in types
    # _common.schema.json is a defs holder, not a type
    assert "_common" not in types


def test_get_schema_returns_pack_path_for_known_type():
    s = get_schema("offer")
    assert s is not None
    assert s.pack == "core"
    assert s.path.name == "offer.schema.json"


def test_validate_passes_for_valid_offer():
    validate("offer", {"summary": "demo", "terms": {}})


def test_validate_rejects_missing_required_field():
    with pytest.raises(SchemaValidationError) as exc:
        validate("offer", {"terms": {}})
    assert "summary" in str(exc.value).lower() or "required" in str(exc.value).lower()


def test_validate_rejects_additional_property():
    with pytest.raises(SchemaValidationError):
        validate("offer", {"summary": "x", "terms": {}, "unknown_field": 1})


def test_validate_unknown_type_raises():
    with pytest.raises(SchemaValidationError):
        validate("not_a_real_type", {})


def test_validate_collects_multiple_errors():
    # empty payload is missing both required fields (`summary` and `terms`)
    with pytest.raises(SchemaValidationError) as exc:
        validate("offer", {})
    err = exc.value
    assert err.type == "offer"
    assert len(err.errors) >= 2
    fields = {str(e.message) for e in err.errors}
    assert any("summary" in m for m in fields)
    assert any("terms" in m for m in fields)
