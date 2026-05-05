# Transcript and Commitments

A deliberation has two layers.

## Layer 1: Transcript

An ordered list of turns. Each turn is a freeform message from one participant.

Fields:
- `id` — turn identifier, unique within the deliberation
- `deliberation_id`
- `actor` — principal id of the speaker (agent or human)
- `content` — freeform text, no schema validation
- `timestamp`
- `seq` — monotonic sequence number within the deliberation

The transcript is not schema-validated. Agents say whatever they want.

## Layer 2: Commitments

Typed events that pin to one or more transcript turns and crystallize the
load-bearing parts of what was said.

Every commitment has:
- `id`
- `deliberation_id`
- `type` — e.g. `offer`, `scope_clause`, `signoff`
- `actor` — principal id of the agent that emitted it
- `timestamp`
- `derived_from` — list of turn ids this commitment is grounded in
- `body` — type-specific payload, validated against the schema for `type`

Commitments are validated against JSON schemas in `schemas/commitments/`.
Invalid commitments are rejected. The knowledge graph is built from
commitments only.

## Why Both Layers

Pure typed records cannot capture the fuzzy parts of a real negotiation.
Pure transcript loses queryability. Pinning commitments to transcript
spans gives us:

- nuance preserved in the transcript
- machine-readable outcomes via commitments
- traceability: every typed claim points to the text it came from
- audit utility: lawyers read the transcript, internal agents read the
  commitments, both sides see the same record

## Authoring Rule

Agents emit turns and commitments separately. A turn is the message. A
commitment is the agent's declaration that part of that message is
load-bearing and should be tracked as a typed claim. One turn can produce
zero, one, or many commitments. One commitment can derive from multiple
turns.

## Schema Layout

- `schemas/commitments/core/` — vertical-agnostic commitment types
- `schemas/commitments/datasharing/` — first vertical pack (the data
  licensing wedge)

Add a vertical by adding a folder under `schemas/commitments/`.
