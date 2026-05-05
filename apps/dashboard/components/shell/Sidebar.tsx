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
        width: 240,
        flexShrink: 0,
        background: "var(--surface-1)",
        borderRight: "1px solid var(--surface-2)",
        display: "flex",
        flexDirection: "column",
        padding: "20px 14px",
        position: "sticky",
        top: 0,
        height: "100vh"
      }}
    >
      <Link
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "4px 8px",
          marginBottom: 18,
          textDecoration: "none"
        }}
      >
        <span
          aria-hidden
          style={{
            width: 24,
            height: 24,
            borderRadius: "var(--r-inner)",
            background: "linear-gradient(135deg, var(--accent), #b25a3f)"
          }}
        />
        <span style={{ fontWeight: 600, fontSize: 14, color: "var(--fg-0)", letterSpacing: "-0.01em" }}>
          summer
        </span>
        <span style={{ color: "var(--fg-5)", fontSize: 12, marginLeft: "auto" }}>X</span>
      </Link>

      <Link
        href="/agents"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          height: 36,
          marginBottom: 18,
          background: "var(--accent)",
          color: "var(--bg)",
          borderRadius: "var(--r-pill)",
          fontSize: 13,
          fontWeight: 500,
          textDecoration: "none"
        }}
      >
        <Icon name="plus" size={14} />
        Deploy Agent
      </Link>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                gap: 10,
                height: 34,
                padding: "0 12px",
                borderRadius: "var(--r-inner)",
                background: active ? "var(--surface-2)" : "transparent",
                color: active ? "var(--fg-0)" : "var(--fg-3)",
                fontSize: 13,
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
                    height: 16,
                    background: "var(--accent)",
                    borderRadius: 2
                  }}
                />
              )}
              <Icon name={item.icon} size={16} />
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
          gap: 10,
          padding: "12px 6px 0",
          borderTop: "1px solid var(--surface-2)"
        }}
      >
        <span
          aria-hidden
          style={{
            width: 28,
            height: 28,
            borderRadius: "var(--r-pill)",
            background: "linear-gradient(135deg, var(--surface-3), var(--surface-2))",
            color: "var(--fg-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 600
          }}
        >
          RJ
        </span>
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
          <span style={{ color: "var(--fg-1)", fontSize: 13, fontWeight: 500 }}>Robert Ji</span>
          <span style={{ color: "var(--fg-5)", fontSize: 11 }}>Ops · X</span>
        </div>
      </div>
    </aside>
  );
}
