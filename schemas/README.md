# Schemas

JSON Schema definitions for commitment events. Transcript turns are not
validated and have no schema here.

## Layout

- `commitments/core/` — vertical-agnostic types every deliberation can use
  (`offer`, `counter`, `amendment`, `approval`, `signoff`,
  `participant_joined`)
- `commitments/datasharing/` — vertical pack for the data licensing wedge
  (`license_terms`, `scope_clause`, `opt_out_delta`, `usage_restriction`,
  `dpa_reference`)
- `commitments/core/_common.schema.json` — shared sub-schemas referenced
  by every commitment

## File Convention

One file per commitment type. Filename matches the commitment `type`
field: `offer.schema.json` defines the body for `type: "offer"`.

Each schema:
- uses JSON Schema draft 2020-12
- has a `$id` of the form
  `https://summer.dev/schemas/commitments/<pack>/<name>.schema.json`
- defines only the `body` shape; envelope fields (`id`, `actor`,
  `timestamp`, `derived_from`, `type`) live in `_common.schema.json` and
  are enforced by the server, not by per-type schemas

## Adding a Vertical

Create `commitments/<pack-name>/` with one file per commitment type and
register the pack in the schema registry (server-side, separate task).
Do not modify `core/` to add vertical-specific fields.
