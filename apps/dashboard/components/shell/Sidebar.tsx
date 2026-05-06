"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons/Icon";

type NavItem = { href: string; label: string; icon: Parameters<typeof Icon>[0]["name"] };

const items: NavItem[] = [
  { href: "/", label: "Overview", icon: "compass" },
  { href: "/deliberations", label: "Deliberations", icon: "list" },
  { href: "/agents", label: "Agents", icon: "robot" },
  { href: "/counterparties", label: "Counterparties", icon: "building" },
  { href: "/policies", label: "Policies", icon: "scales" },
  { href: "/audit", label: "Audit", icon: "scroll" },
  { href: "/settings", label: "Settings", icon: "gear" }
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const pathname = usePathname() ?? "/";
  return (
    <aside
      style={{
        background: "var(--surface-1)",
        borderRight: "1px solid var(--surface-2)",
        display: "flex",
        flexDirection: "column",
        padding: "16px 12px",
        height: "100vh",
        overflowY: "auto"
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 6px",
          marginBottom: 14,
          textDecoration: "none"
        }}
      >
        <span
          aria-hidden
          style={{
            width: 20,
            height: 20,
            borderRadius: 6,
            background: "linear-gradient(135deg, var(--accent), #b25a3f)",
            flexShrink: 0
          }}
        />
        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--fg-0)", letterSpacing: "-0.01em" }}>
          summer
        </span>
        <span style={{ color: "var(--fg-5)", fontSize: 11, marginLeft: "auto" }}>X</span>
      </Link>

      <Link
        href="/agents"
        className="deploy-cta"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 32,
          marginBottom: 14,
          padding: "0 14px 0 28px", // reserve gutter for the absolute '+' icon
          background: "var(--accent)",
          color: "var(--bg)",
          borderRadius: "var(--r-pill)",
          fontSize: 12,
          fontWeight: 500,
          textDecoration: "none"
        }}
      >
        <Icon name="plus" size={13} className="deploy-cta-icon" />
        <span>Deploy Agent</span>
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 9,
                height: 30,
                padding: "0 10px",
                borderRadius: 8,
                background: active ? "var(--surface-2)" : "transparent",
                color: active ? "var(--fg-0)" : "var(--fg-3)",
                fontSize: 12,
                textDecoration: "none"
              }}
            >
              {active && (
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 2,
                    height: 14,
                    background: "var(--accent)",
                    borderRadius: 2
                  }}
                />
              )}
              <Icon name={item.icon} size={14} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "10px 4px 0",
          borderTop: "1px solid var(--surface-2)"
        }}
      >
        <span
          aria-hidden
          style={{
            width: 26,
            height: 26,
            borderRadius: "var(--r-pill)",
            background: "linear-gradient(135deg, var(--surface-3), var(--surface-2))",
            color: "var(--fg-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            fontWeight: 600,
            flexShrink: 0
          }}
        >
          RJ
        </span>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2, minWidth: 0 }}>
          <span style={{ color: "var(--fg-1)", fontSize: 12, fontWeight: 500 }}>Robert Ji</span>
          <span style={{ color: "var(--fg-5)", fontSize: 10 }}>Ops · X</span>
        </div>
      </div>
    </aside>
  );
}
