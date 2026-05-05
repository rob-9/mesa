import type { ReactNode } from "react";
import { Icon } from "@/components/icons/Icon";

interface ComingSoonProps {
  title: string;
  icon: Parameters<typeof Icon>[0]["name"];
  children?: ReactNode;
}

export function ComingSoon({ title, icon, children }: ComingSoonProps) {
  return (
    <>
      <h1
        style={{
          margin: 0,
          fontSize: 30,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          fontWeight: 600,
          color: "var(--fg-0)"
        }}
      >
        {title}
      </h1>
      <div
        style={{
          marginTop: 28,
          background: "var(--surface-1)",
          border: "1px solid var(--surface-2)",
          borderRadius: "var(--r-card)",
          padding: "60px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center"
        }}
      >
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: "var(--r-inner)",
            background: "var(--surface-2)",
            color: "var(--fg-3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16
          }}
        >
          <Icon name={icon} size={22} />
        </span>
        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--fg-1)", marginBottom: 6 }}>
          {title} · coming soon
        </div>
        <div style={{ fontSize: 13, color: "var(--fg-4)", maxWidth: 420 }}>{children}</div>
      </div>
    </>
  );
}
