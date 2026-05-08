import Link from "next/link";
import type { AgentStatus } from "@/lib/types";
import { TopAgentCard } from "./TopAgentCard";

export function TopAgentsRow({ agents }: { agents: AgentStatus[] }) {
  const top = [...agents]
    .sort(
      (a, b) =>
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    )
    .slice(0, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, flexShrink: 0 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline"
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 14,
            fontWeight: 600,
            color: "var(--fg-1)",
            letterSpacing: "-0.005em"
          }}
        >
          Top agents
        </h2>
        <Link
          href="/agents"
          style={{
            fontSize: 12,
            color: "var(--fg-3)",
            textDecoration: "none"
          }}
        >
          View fleet →
        </Link>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 10
        }}
      >
        {top.map((agent) => (
          <TopAgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
