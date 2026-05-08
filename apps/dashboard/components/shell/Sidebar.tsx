"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons/Icon";

type NavItem = { href: string; label: string; icon: Parameters<typeof Icon>[0]["name"] };

const primaryItems: NavItem[] = [
  { href: "/", label: "Overview", icon: "compass" },
  { href: "/deliberations", label: "Deliberations", icon: "list" },
  { href: "/agents", label: "Agents", icon: "robot" }
];

const secondaryItems: NavItem[] = [
  { href: "/counterparties", label: "Counterparties", icon: "building" },
  { href: "/policies", label: "Policies", icon: "scales" },
  { href: "/audit", label: "Audit", icon: "scroll" },
  { href: "/analytics", label: "Analytics", icon: "chart-bar" }
];

const settingsItem: NavItem = { href: "/settings", label: "Settings", icon: "gear" };

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={active ? undefined : "nav-item"}
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
}

function Divider() {
  return (
    <div
      aria-hidden
      style={{
        height: 1,
        background: "var(--surface-2)",
        margin: "8px 6px"
      }}
    />
  );
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
        height: "100%",
        overflowY: "auto"
      }}
    >
      <Link
        href="/"
        aria-label="Mesa — Overview"
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
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0
          }}
        >
          <img
            src="/mesa-logo.png"
            alt=""
            width={32}
            height={32}
            style={{ display: "block", objectFit: "contain" }}
          />
        </span>
        <span style={{ fontWeight: 600, fontSize: 13, color: "var(--fg-0)", letterSpacing: "-0.01em" }}>
          mesa
        </span>
        <span style={{ color: "var(--fg-5)", fontSize: 11, marginLeft: "auto" }}>X</span>
      </Link>

      <Link
        href="/agents/new"
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

      <nav aria-label="Primary" style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {primaryItems.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
        <Divider />
        {secondaryItems.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      <nav aria-label="Settings" style={{ display: "flex", flexDirection: "column", gap: 1, marginBottom: 8 }}>
        <Divider />
        <NavLink item={settingsItem} active={isActive(pathname, settingsItem.href)} />
      </nav>

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
