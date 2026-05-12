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

from sqlalchemy import or_, select
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
    """
    rules = session.scalars(
        select(Policy)
        .where(Policy.enabled.is_(True))
        .where(
            or_(
                Policy.scope_kind == "global",
                (Policy.scope_kind == "agent") & (Policy.scope_ref == principal.id),
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


def _term_months_over_cap(commitment: Commitment, params: dict[str, Any]) -> bool:
    cap = params.get("cap")
    term = (commitment.payload or {}).get("terms", {}).get("term_months")
    return cap is not None and isinstance(term, (int, float)) and term > cap


def _spend_over_cap(commitment: Commitment, params: dict[str, Any]) -> bool:
    cap = params.get("cap")
    fee = (commitment.payload or {}).get("terms", {}).get("fee_total_usd")
    return cap is not None and isinstance(fee, (int, float)) and fee > cap


def _scope_mentions_pii_without_dpa(
    commitment: Commitment, params: dict[str, Any]
) -> bool:
    terms = (commitment.payload or {}).get("terms", {})
    scope = terms.get("scope") or []
    has_pii = any(isinstance(s, str) and s.upper() == "PII" for s in scope)
    return has_pii and not bool(terms.get("dpa_attached"))


def _agent_discount_over_cap(commitment: Commitment, params: dict[str, Any]) -> bool:
    cap = params.get("cap")
    discount = (commitment.payload or {}).get("terms", {}).get("discount_pct")
    return cap is not None and isinstance(discount, (int, float)) and discount > cap


register_predicate("term_months_over_cap", _term_months_over_cap)
register_predicate("spend_over_cap", _spend_over_cap)
register_predicate("scope_mentions_pii_without_dpa", _scope_mentions_pii_without_dpa)
register_predicate("agent_discount_over_cap", _agent_discount_over_cap)
