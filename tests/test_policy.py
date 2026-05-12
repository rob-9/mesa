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


def test_custom_predicate_registration():
    register_predicate("always_true", lambda commitment, params: True)
    register_predicate("always_false", lambda commitment, params: False)
    # registry is global; this only proves register doesn't throw.
    # the integration with evaluate is covered by the named-predicate tests above.


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
