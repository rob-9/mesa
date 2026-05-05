import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";

interface StatTileProps {
  icon: Parameters<typeof Icon>[0]["name"];
  value: ReactNode;
  label: string;
  accent?: boolean;
}

export function StatTile({ icon, value, label, accent = false }: StatTileProps) {
  const valueColor = accent ? "var(--bg)" : "var(--fg-0)";
  const labelColor = accent ? "rgba(26,23,21,0.72)" : "var(--fg-4)";
  const chipBg = accent ? "rgba(255,255,255,0.18)" : "var(--surface-2)";
  const chipColor = accent ? "var(--bg)" : "var(--fg-3)";

  return (
    <div
      style={{
        position: "relative",
        padding: 16,
        background: accent ? "var(--accent)" : "var(--surface-1)",
        border: accent ? "1px solid transparent" : "1px solid var(--surface-2)",
        borderRadius: "var(--r-card)"
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "var(--r-inner)",
          background: chipBg,
          color: chipColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Icon name={icon} size={14} />
      </div>
      <div
        className="mono"
        style={{
          marginTop: 16,
          fontSize: 26,
          fontWeight: 600,
          letterSpacing: "-0.02em",
          lineHeight: 1.05,
          color: valueColor
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 4, fontSize: 12, color: labelColor }}>{label}</div>
    </div>
  );
}
