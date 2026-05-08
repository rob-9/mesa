import Link from "next/link";
import { Icon } from "@/components/icons/Icon";
import { formatRelative } from "@/lib/format";
import type { SignificantEvent } from "@/lib/types";
import { Card } from "./Card";

type ChipTone = { fg: string; bg: string };

const kindLabel: Record<SignificantEvent["kind"], { label: string; tone: ChipTone }> = {
  deliberation_signed: {
    label: "signed",
    tone: { fg: "var(--accent)", bg: "var(--accent-soft)" }
  },
  policy_fired: {
    label: "policy",
    tone: { fg: "var(--amber)", bg: "var(--amber-soft)" }
  },
  agent_deployed: {
    label: "deployed",
    tone: { fg: "var(--fg-2)", bg: "var(--surface-2)" }
  },
  integration_disconnected: {
    label: "offline",
    tone: { fg: "var(--amber)", bg: "var(--amber-soft)" }
  },
  principal_added: {
    label: "principal",
    tone: { fg: "var(--fg-2)", bg: "var(--surface-2)" }
  }
};

export function SignificantEventsCard({ events }: { events: SignificantEvent[] }) {
  return (
    <Card
      title="Significant events"
      eyebrow={`${events.length} TODAY`}
      trailing={
        <Link
          href="/audit"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            color: "var(--fg-3)"
          }}
        >
          Audit log <Icon name="chevron-right" size={12} />
        </Link>
      }
      noPadBody
    >
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "none" }}>
        {events.length === 0 && (
          <div
            style={{
              padding: "32px 16px",
              fontSize: 12,
              color: "var(--fg-4)",
              textAlign: "center",
              lineHeight: 1.5
            }}
          >
            No significant events today.
          </div>
        )}
        {events.map((ev, i) => {
          const meta = kindLabel[ev.kind];
          const isLast = i === events.length - 1;
          const Row = (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "92px minmax(0, 1fr) 52px",
                gap: 12,
                alignItems: "center",
                padding: "11px 16px",
                borderBottom: isLast ? "none" : "1px solid var(--border-row)"
              }}
            >
              <span
                className="mono"
                style={{
                  display: "inline-flex",
                  alignSelf: "center",
                  justifyContent: "center",
                  padding: "3px 8px",
                  borderRadius: "var(--r-pill)",
                  background: meta.tone.bg,
                  color: meta.tone.fg,
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  width: "fit-content"
                }}
              >
                {meta.label}
              </span>
              <span
                title={ev.summary}
                style={{
                  fontSize: 12,
                  color: "var(--fg-1)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {ev.summary}
              </span>
              <span
                className="mono"
                style={{ fontSize: 11, color: "var(--fg-4)", textAlign: "right" }}
              >
                {formatRelative(ev.timestamp)}
              </span>
            </div>
          );
          return ev.href ? (
            <Link key={ev.id} href={ev.href} className="row-link" style={{ display: "block", textDecoration: "none" }}>
              {Row}
            </Link>
          ) : (
            <div key={ev.id}>{Row}</div>
          );
        })}
      </div>
    </Card>
  );
}
