import Link from "next/link";

const navItems = [
  { label: "Deliberations", href: "/deliberations", active: true },
  { label: "Counterparties", href: "#", active: false, disabled: true },
  { label: "Audit", href: "#", active: false, disabled: true }
];

export function TopBar() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "18px 32px",
        maxWidth: 1400,
        width: "100%",
        margin: "0 auto"
      }}
    >
      <Link href="/deliberations" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          aria-hidden
          style={{
            width: 24,
            height: 24,
            borderRadius: 8,
            background: "linear-gradient(135deg, #d97757, #b25a3f)"
          }}
        />
        <span style={{ fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em", color: "var(--fg-0)" }}>
          summer
        </span>
        <span style={{ color: "var(--fg-5)", fontSize: 13, marginLeft: 4 }}>/ acme corp</span>
      </Link>

      <nav
        style={{
          display: "flex",
          gap: 4,
          background: "var(--surface-1)",
          borderRadius: "var(--r-pill)",
          padding: 4
        }}
      >
        {navItems.map((item) =>
          item.disabled ? (
            <span
              key={item.label}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--r-pill)",
                color: "var(--fg-5)",
                fontSize: 12,
                cursor: "default"
              }}
              aria-disabled="true"
            >
              {item.label}
            </span>
          ) : (
            <Link
              key={item.label}
              href={item.href}
              style={{
                padding: "6px 14px",
                borderRadius: "var(--r-pill)",
                background: item.active ? "var(--surface-2)" : "transparent",
                color: item.active ? "var(--fg-0)" : "var(--fg-3)",
                fontSize: 12
              }}
            >
              {item.label}
            </Link>
          )
        )}
      </nav>

      <div
        aria-hidden
        style={{
          width: 30,
          height: 30,
          borderRadius: "var(--r-pill)",
          background: "var(--surface-2)"
        }}
      />
    </header>
  );
}
