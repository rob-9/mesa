"""policy engine tests.

covers the named-predicate registry and the aggregation rules in
evaluate(principal, commitment) -> Decision.
"""

import pytest

from server.models import Commitment, Policy, Principal
from server.policy import Decision, evaluate, register_predicate


def _principal(**kw) -> Principal:
    pid = kw.get("id", "p1")
    return Principal(
        id=pid,
        org=kw.get("org", "acme"),
        # public_key has a UNIQUE constraint; derive a distinct one per id.
        public_key=(pid + "0" * 64)[:64].replace("-", "0"),
    )


def _commitment(*, type: str = "offer", payload: dict | None = None) -> Commitment:
    return Commitment(
        id="c1",
        type=type,
        principal_id="p1",
        payload=payload or {},
        signature="x" * 128,
    )


def test_no_policies_allows(db_session):
    p = _principal()
    db_session.add(p)
    db_session.commit()
    d = evaluate(db_session, p, _commitment())
    assert d.action == "allow"
    assert d.applied == []


def test_disabled_policy_skipped(db_session):
    p = _principal()
    db_session.add(p)
    db_session.add(
        Policy(
            id="po1",
            name="cap",
            scope_kind="global",
            predicate_name="term_months_over_cap",
            params={"cap": 12},
            action="block",
            enabled=False,
        )
    )
    db_session.commit()
    d = evaluate(db_session, p, _commitment(payload={"terms": {"term_months": 24}}))
    assert d.action == "allow"


def test_block_wins_over_flag(db_session):
    p = _principal()
    db_session.add(p)
    db_session.add(
        Policy(
            id="flag1",
            name="flag",
            scope_kind="global",
            predicate_name="term_months_over_cap",
            params={"cap": 12},
            action="flag",
            enabled=True,
        )
    )
    db_session.add(
        Policy(
            id="block1",
            name="block",
            scope_kind="global",
            predicate_name="spend_over_cap",
            params={"cap": 1000},
            action="block",
            enabled=True,
        )
    )
    db_session.commit()
    d = evaluate(
        db_session,
        p,
        _commitment(payload={"terms": {"term_months": 24, "fee_total_usd": 5000}}),
    )
    assert d.action == "block"
    assert "block1" in [a["policy_id"] for a in d.applied]


def test_term_months_over_cap_predicate(db_session):
    p = _principal()
    db_session.add(p)
    db_session.add(
        Policy(
            id="po1",
            name="term cap",
            scope_kind="global",
            predicate_name="term_months_over_cap",
            params={"cap": 36},
            action="flag",
            enabled=True,
        )
    )
    db_session.commit()
    triggered = evaluate(db_session, p, _commitment(payload={"terms": {"term_months": 48}}))
    assert triggered.action == "flag"
    ok = evaluate(db_session, p, _commitment(payload={"terms": {"term_months": 12}}))
    assert ok.action == "allow"


def test_spend_over_cap_predicate(db_session):
    p = _principal()
    db_session.add(p)
    db_session.add(
        Policy(
            id="po1",
            name="spend cap",
            scope_kind="global",
            predicate_name="spend_over_cap",
            params={"cap": 250000},
            action="block",
            enabled=True,
        )
    )
    db_session.commit()
    triggered = evaluate(
        db_session, p, _commitment(payload={"terms": {"fee_total_usd": 300000}})
    )
    assert triggered.action == "block"
    ok = evaluate(
        db_session, p, _commitment(payload={"terms": {"fee_total_usd": 100000}})
    )
    assert ok.action == "allow"


def test_scope_mentions_pii_without_dpa(db_session):
    p = _principal()
    db_session.add(p)
    db_session.add(
        Policy(
            id="po1",
            name="pii needs dpa",
            scope_kind="global",
            predicate_name="scope_mentions_pii_without_dpa",
            params={},
            action="block",
            enabled=True,
        )
    )
    db_session.commit()

    with_pii_no_dpa = evaluate(
        db_session, p, _commitment(payload={"terms": {"scope": ["PII", "billing"]}})
    )
    assert with_pii_no_dpa.action == "block"

    with_pii_dpa = evaluate(
        db_session,
        p,
        _commitment(
            payload={"terms": {"scope": ["PII"], "dpa_attached": True}},
        ),
    )
    assert with_pii_dpa.action == "allow"

    no_pii = evaluate(
        db_session, p, _commitment(payload={"terms": {"scope": ["billing"]}})
    )
    assert no_pii.action == "allow"


def test_agent_scope_only_matches_named_agent(db_session):
    p1 = _principal(id="agent-a")
    p2 = _principal(id="agent-b")
    db_session.add_all([p1, p2])
    db_session.add(
        Policy(
            id="po1",
            name="agent-a only",
            scope_kind="agent",
            scope_ref="agent-a",
            predicate_name="agent_discount_over_cap",
            params={"cap": 25},
            action="flag",
            enabled=True,
        )
    )
    db_session.commit()

    on_a = evaluate(
        db_session, p1, _commitment(payload={"terms": {"discount_pct": 40}})
    )
    assert on_a.action == "flag"

    on_b = evaluate(
        db_session, p2, _commitment(payload={"terms": {"discount_pct": 40}})
    )
    assert on_b.action == "allow"


def test_unknown_predicate_raises_at_eval(db_session):
    p = _principal()
    db_session.add(p)
    db_session.add(
        Policy(
            id="po1",
            name="garbage",
            scope_kind="global",
            predicate_name="never_registered",
            params={},
            action="block",
            enabled=True,
        )
    )
    db_session.commit()
    with pytest.raises(KeyError):
        evaluate(db_session, p, _commitment())


def test_decision_carries_applied_policies(db_session):
    p = _principal()
    db_session.add(p)
    db_session.add_all(
        [
            Policy(
                id="flag1",
                name="term",
                scope_kind="global",
                predicate_name="term_months_over_cap",
                params={"cap": 12},
                action="flag",
                enabled=True,
            ),
            Policy(
                id="flag2",
                name="spend",
                scope_kind="global",
                predicate_name="spend_over_cap",
                params={"cap": 1000},
                action="flag",
                enabled=True,
            ),
        ]
    )
    db_session.commit()
    d = evaluate(
        db_session,
        p,
        _commitment(payload={"terms": {"term_months": 24, "fee_total_usd": 5000}}),
    )
    assert d.action == "flag"
    ids = {a["policy_id"] for a in d.applied}
    assert ids == {"flag1", "flag2"}


def test_custom_predicate_runs_through_evaluate(db_session):
    """register a one-off predicate and prove evaluate() picks it up.
    the conftest snapshot/restore fixture cleans up after this test."""
    register_predicate("always_true", lambda commitment, params: True)
    p = _principal()
    db_session.add(p)
    db_session.add(
        Policy(
            id="po1",
            name="custom",
            scope_kind="global",
            predicate_name="always_true",
            params={},
            action="flag",
            enabled=True,
        )
    )
    db_session.commit()
    d = evaluate(db_session, p, _commitment())
    assert d.action == "flag"
    assert d.applied[0]["policy_name"] == "custom"


def test_hits_counter_incremented_when_policy_fires(db_session):
    p = _principal()
    db_session.add(p)
    pol = Policy(
        id="po1",
        name="cap",
        scope_kind="global",
        predicate_name="term_months_over_cap",
        params={"cap": 12},
        action="flag",
        enabled=True,
    )
    db_session.add(pol)
    db_session.commit()
    before = pol.hits30d
    evaluate(db_session, p, _commitment(payload={"terms": {"term_months": 24}}))
    db_session.refresh(pol)
    assert pol.hits30d == before + 1


def test_decision_dataclass_shape():
    d = Decision(action="allow", applied=[])
    assert d.action == "allow"
    assert d.applied == []


def test_predicates_fail_closed_on_non_dict_terms(db_session):
    """if `terms` isn't a dict, predicates must return False (not raise)."""
    p = _principal()
    db_session.add(p)
    db_session.add_all(
        [
            Policy(
                id="po1",
                name="term cap",
                scope_kind="global",
                predicate_name="term_months_over_cap",
                params={"cap": 12},
                action="block",
                enabled=True,
            ),
            Policy(
                id="po2",
                name="spend cap",
                scope_kind="global",
                predicate_name="spend_over_cap",
                params={"cap": 1000},
                action="block",
                enabled=True,
            ),
            Policy(
                id="po3",
                name="pii",
                scope_kind="global",
                predicate_name="scope_mentions_pii_without_dpa",
                params={},
                action="block",
                enabled=True,
            ),
            Policy(
                id="po4",
                name="discount",
                scope_kind="global",
                predicate_name="agent_discount_over_cap",
                params={"cap": 25},
                action="block",
                enabled=True,
            ),
        ]
    )
    db_session.commit()
    # terms is a string, not a dict — every predicate should swallow this
    d = evaluate(db_session, p, _commitment(payload={"terms": "garbage"}))
    assert d.action == "allow"


def test_predicates_fail_closed_on_missing_payload(db_session):
    p = _principal()
    db_session.add(p)
    db_session.add(
        Policy(
            id="po1",
            name="term cap",
            scope_kind="global",
            predicate_name="term_months_over_cap",
            params={"cap": 12},
            action="flag",
            enabled=True,
        )
    )
    db_session.commit()
    # payload is None / missing keys — predicate returns False, allow
    d = evaluate(db_session, p, _commitment(payload={}))
    assert d.action == "allow"


def test_predicate_rejects_boolean_as_numeric(db_session):
    """bool is a subclass of int in python — don't let True/False slip past
    isinstance(int) checks and trigger numeric predicates."""
    p = _principal()
    db_session.add(p)
    db_session.add(
        Policy(
            id="po1",
            name="term cap",
            scope_kind="global",
            predicate_name="term_months_over_cap",
            params={"cap": 0},
            action="block",
            enabled=True,
        )
    )
    db_session.commit()
    # term=True == int(1) > 0 would block if not guarded
    d = evaluate(db_session, p, _commitment(payload={"terms": {"term_months": True}}))
    assert d.action == "allow"
