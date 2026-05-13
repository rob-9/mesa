"""policy engine. evaluates incoming commitments against named-predicate rules.

design notes:
- predicates are python callables registered by name. policy rows reference a
  predicate by name + params, so policy authoring is data-driven without a DSL.
- rule scope (global/agent/counterparty) filters which rules run for a given
  (principal, commitment). counterparty scope is stored but not matched in
  v0.1 — the server has no counterparty model yet, so any counterparty-scoped
  policy is effectively dormant.
- when multiple rules fire, the strongest action wins: block > route > flag > allow.
- hits30d counter on each matched, enabled policy is incremented every time it
  fires. this is the v0.1 truth for the dashboard's hit counter. the "30d"
  window is purely cosmetic until we add a rotation job.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Callable

from sqlalchemy import and_, or_, select
from sqlalchemy.orm import Session

from server.models import Commitment, Policy, Principal

Predicate = Callable[[Commitment, dict[str, Any]], bool]

_PREDICATES: dict[str, Predicate] = {}


_ACTION_PRIORITY = {"allow": 0, "flag": 1, "route": 2, "block": 3}


@dataclass
class Decision:
    """aggregate verdict from evaluating all matching rules.

    action — strongest action across all fired policies (block > route > flag > allow).
    applied — every policy that fired, with its action and route_to. ordering not
              meaningful. consumers should check `action` for the overall verdict
              and `applied` for which specific rules to surface to the user.
    """

    action: str
    applied: list[dict[str, Any]] = field(default_factory=list)


def register_predicate(name: str, fn: Predicate) -> None:
    """register or override a predicate. idempotent."""
    _PREDICATES[name] = fn


def _get_predicate(name: str) -> Predicate:
    try:
        return _PREDICATES[name]
    except KeyError as e:
        raise KeyError(f"no policy predicate registered with name '{name}'") from e


def evaluate(session: Session, principal: Principal, commitment: Commitment) -> Decision:
    """run all enabled, in-scope policies against a commitment and aggregate.

    side effect: increments hits30d on each policy that fires. callers should
    not assume the session is flushed — this function flushes its own writes
    but leaves commit responsibility to the caller.

    perf note: this re-queries every enabled policy on every request. fine
    while policy counts are small (dozens). once we cross a few hundred or
    request rates climb, cache the rule set in-process (invalidate on the
    eventual /policies CRUD endpoints' writes) and only re-hit the DB to
    increment hits30d.
    """
    rules = session.scalars(
        select(Policy)
        .where(Policy.enabled.is_(True))
        .where(
            or_(
                Policy.scope_kind == "global",
                and_(
                    Policy.scope_kind == "agent",
                    Policy.scope_ref == principal.id,
                ),
                # counterparty scope is dormant in v0.1
            )
        )
    ).all()

    applied: list[dict[str, Any]] = []
    strongest = "allow"

    for rule in rules:
        predicate = _get_predicate(rule.predicate_name)
        if not predicate(commitment, rule.params or {}):
            continue
        rule.hits30d = (rule.hits30d or 0) + 1
        applied.append(
            {
                "policy_id": rule.id,
                "policy_name": rule.name,
                "action": rule.action,
                "route_to": rule.route_to,
            }
        )
        if _ACTION_PRIORITY[rule.action] > _ACTION_PRIORITY[strongest]:
            strongest = rule.action

    session.flush()
    return Decision(action=strongest, applied=applied)


# ─── built-in predicates ───────────────────────────────────────────────────
#
# all predicates fail closed (return False) on unexpected shapes. since
# `block` is the strongest action, "did not fire" is the safer error mode —
# a `block` rule that should have triggered but didn't due to a type
# mismatch is still caught by the type's json schema upstream.


def _terms(commitment: Commitment) -> dict[str, Any]:
    payload = commitment.payload or {}
    terms = payload.get("terms")
    return terms if isinstance(terms, dict) else {}


def _term_months_over_cap(commitment: Commitment, params: dict[str, Any]) -> bool:
    cap = params.get("cap")
    term = _terms(commitment).get("term_months")
    return (
        isinstance(cap, (int, float))
        and isinstance(term, (int, float))
        and not isinstance(term, bool)
        and term > cap
    )


def _spend_over_cap(commitment: Commitment, params: dict[str, Any]) -> bool:
    cap = params.get("cap")
    fee = _terms(commitment).get("fee_total_usd")
    return (
        isinstance(cap, (int, float))
        and isinstance(fee, (int, float))
        and not isinstance(fee, bool)
        and fee > cap
    )


def _scope_mentions_pii_without_dpa(
    commitment: Commitment, params: dict[str, Any]
) -> bool:
    terms = _terms(commitment)
    scope = terms.get("scope")
    if not isinstance(scope, list):
        return False
    has_pii = any(isinstance(s, str) and s.upper() == "PII" for s in scope)
    return has_pii and not bool(terms.get("dpa_attached"))


def _agent_discount_over_cap(commitment: Commitment, params: dict[str, Any]) -> bool:
    cap = params.get("cap")
    discount = _terms(commitment).get("discount_pct")
    return (
        isinstance(cap, (int, float))
        and isinstance(discount, (int, float))
        and not isinstance(discount, bool)
        and discount > cap
    )


register_predicate("term_months_over_cap", _term_months_over_cap)
register_predicate("spend_over_cap", _spend_over_cap)
register_predicate("scope_mentions_pii_without_dpa", _scope_mentions_pii_without_dpa)
register_predicate("agent_discount_over_cap", _agent_discount_over_cap)
