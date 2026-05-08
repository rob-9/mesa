# Overview tab redesign — search / chips / top cards / tabbed table

**Date:** 2026-05-08
**Scope:** `apps/dashboard` Overview page (`app/page.tsx`) and `components/overview/`
**Status:** Design — pending implementation plan
**Reference:** User-provided screenshot of external job dashboard. We mimic the structural pattern, not the content or color palette.

## Problem

The current Overview tab is a four-card operational-health grid (`FleetNavbar` + `RiskPulseCard`, `AgentFleetCard`, `SignificantEventsCard`, `ConnectivityCard`). The user wants the page restructured into the four-zone pattern from the reference: search bar, filter chip strip, "top X" colored card row, and a tabbed table — while preserving the underlying overview data (agents, events, risk, integrations) and the existing dark color scheme with Claude-orange accent.

## Direction

Overview becomes a single vertical flow:

1. Page header (kept).
2. Search bar.
3. Filter / KPI chip strip (replaces the two right-column cards).
4. "Top agents" row of five tinted cards.
5. Tabbed activity table with one tab per entity type plus an "All" tab.

The page stays inside `AppShell`. Color tokens in `globals.css` are unchanged. No new dependencies. No data layer changes — the page still calls `getOverview()` and consumes the existing `OverviewData` shape.

## Layout

```
┌─ AppShell ─────────────────────────────────┐
│  Overview                                  │
│  Operational health across…                │
├────────────────────────────────────────────┤
│  🔍  Search agents, deliberations, events  │
├────────────────────────────────────────────┤
│  [Flagged 3] [Policy 24h 7] [Stale 1]      │
│  [Integrations 8/9 ▾] [State ▾] [×Clear]   │
├────────────────────────────────────────────┤
│  Top agents                  [View fleet →]│
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐                  │
│  └──┘ └──┘ └──┘ └──┘ └──┘                  │
├────────────────────────────────────────────┤
│  All activity            [search …]        │
│  [All N] [Agents N] [Events N] [Integ. N]  │
│  ─────────────────────────────────────────│
│  ▢ table rows…                             │
└────────────────────────────────────────────┘
```

## Components

All new components live in `apps/dashboard/components/overview/`.

### `OverviewSearchBar.tsx` (client)

- Full-width pill input, leading magnifier icon (use existing icon set under `components/icons/` if available, otherwise inline SVG).
- Background `--surface-1`, hairline border `--border-row`, focus ring `--accent-ring`.
- Controlled by parent. Empty by default. No autocomplete.
- Placeholder: `Search agents, deliberations, events…`.

### `OverviewFilterStrip.tsx` (client)

- Pill-shaped chips, two visual groups separated by a small divider.
- **KPI chips (read-only display, click-to-filter):**
  - `Flagged {n}` — amber tint (`--amber-soft` background, `--amber` text). Click filters table to flagged items (events whose kind is `policy_fired` and agents in `blocked` state).
  - `Policy fires 24h {n}` — accent tint (`--accent-soft` / `--accent`). Click switches table to Events tab filtered by `policy_fired`.
  - `Stale >7d {n}` — neutral (`--surface-2` / `--fg-3`). Click filters to agents whose `lastActivity` is older than 7 days.
- **Filter chips (dropdown):**
  - `Integrations {connected}/{total} ▾` — opens a popover with the full integration list and connect/disconnect status.
  - `State ▾` — multi-select for `negotiating | idle | blocked`.
  - `× Clear` — resets all chip-driven filters.
- Active chips render with `--accent` foreground and a 1px `--accent-ring` outline.

### `TopAgentsRow.tsx` + `TopAgentCard.tsx` (server)

- Row uses `display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: 10px;`.
- Section title `Top agents` with right-side link `View fleet →` to `/agents`.
- Agents sorted by `lastActivity` desc, take first 5. If fewer than 5 agents exist, render only what's available; row remains 5 columns and empty cells are skipped (not rendered as placeholders).
- Card layout:
  - Top row: small role-and-time chip on left (`{role} · {relative time}`), activity ring on right.
  - Title block: agent name (large, `--fg-0`), deliberation title beneath in `--fg-3`.
  - Bottom row: counterparty / source badge on left, `View →` pill on right.
- Card click navigates to `/agents/{id}`.
- Card background tint encodes **state** (replaces the random pastels in the reference):
  - `negotiating` → `--accent-soft` background, `--accent-ring` border
  - `idle` → `--surface-2` background, `--border-row` border
  - `blocked` → `--amber-soft` background, 1px `--amber` border
- The percentage ring shows policies-attached / total-policies for the agent. Falls back to "—" if the data isn't present in `AgentStatus`. (We'll wire this off `AgentDetail` if it's already loaded; otherwise the ring renders without a percentage.)

### `ActivityTable.tsx` (client)

- Replaces `AgentFleetCard`, `SignificantEventsCard`, and the table portion of `ConnectivityCard`.
- Tabs: `All`, `Agents`, `Events`, `Integrations`. Each tab shows a count badge.
- Selected tab uses `--surface-2` background and `--accent` underline; inactive tabs use `--fg-3`.
- Right-aligned secondary search input scoped to the table; combines with the global search bar (intersection).
- One shared `<table>` element with per-tab column configs:
  - **All** — Type icon · Subject · Meta · Time. Rows are unioned; sort by time desc. `Subject` for an agent is `{name} — {deliberation}`, for an event is `{summary}`, for an integration is `{name} ({status})`.
  - **Agents** — Agent · Role · Deliberation · State pill · Last activity.
  - **Events** — Kind icon · Summary · Time · `→` link if `href`.
  - **Integrations** — Name · Description · Status pill (`Connected` / `Disconnected`).
- Sticky header (`position: sticky; top: 0;` inside scrollable parent). Row hover background `--surface-2`. Hairline `--border-row` between rows.
- Empty state per tab shows a single-line muted message, no illustration.

### `OverviewBody.tsx` (client)

- Wrapper that owns search-query, active-tab, and active-filter state.
- Receives the full `OverviewData` from the server page and feeds the four child sections.
- Search query and chip filters apply to `ActivityTable`. Tab and chip clicks update local state only — no URL state for v1 (a follow-up may move to `searchParams`).

## Page composition

`apps/dashboard/app/page.tsx` becomes:

```tsx
export default async function OverviewPage() {
  const data = await getOverview();
  return (
    <AppShell>
      <PageHeader title="Overview" subtitle="Operational health across …" />
      <OverviewBody data={data} />
    </AppShell>
  );
}
```

`OverviewBody` renders, in order: `OverviewSearchBar`, `OverviewFilterStrip`, `TopAgentsRow`, `ActivityTable`.

The header `<h1>` + subtitle currently lives inline in `app/page.tsx`. Reuse the existing `PageHeader` primitive if its API matches; otherwise leave the inline header.

## Files removed from this page (kept in repo)

The following components are no longer imported by `app/page.tsx`. They stay in `components/overview/` in case they're reused elsewhere; we do **not** delete them in this change:

- `FleetNavbar.tsx`
- `RiskPulseCard.tsx`
- `AgentFleetCard.tsx`
- `SignificantEventsCard.tsx`
- `ConnectivityCard.tsx`

A follow-up cleanup task can delete them after confirming no other consumer.

## Color and styling

- All colors come from existing tokens in `app/globals.css`. No new tokens added.
- "Pastel" reference colors translate to dark-themed tinted surfaces:
  - Negotiating → `--accent-soft`
  - Idle → `--surface-2`
  - Blocked → `--amber-soft`
- Radii: cards use `--r-card`, chips use `--r-pill`, inner elements use `--r-inner`.
- Typography: existing site sans, monospaced numerals (`--font-mono`) only for percentages and counts.

## Out of scope

- URL-state for filters / tab / search (defer to follow-up).
- Real backend wiring (still consuming `fixtureOverview()`).
- New keyboard shortcuts.
- Mobile responsive breakpoints below the existing dashboard min-width.
- Deleting the unused legacy components.

## Testing

- Visual: load `/`, confirm four-zone layout matches the reference structurally; confirm tints derive from state, not random.
- Interaction: typing in the global search filters the table across tabs; chip click toggles active state and applies filter; tab switch swaps columns; clicking a top-card navigates to `/agents/{id}`.
- Empty: with zero agents, top row collapses gracefully; with zero rows in a tab, empty state renders.
- Type check (`tsc --noEmit`) and the project's lint command must pass.
