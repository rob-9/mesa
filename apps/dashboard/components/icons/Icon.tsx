type IconName =
  | "compass"
  | "list"
  | "robot"
  | "building"
  | "scales"
  | "scroll"
  | "gear"
  | "briefcase"
  | "agent"
  | "clock"
  | "alert"
  | "bell"
  | "search"
  | "plus"
  | "check"
  | "x"
  | "chevron-right"
  | "chevron-up"
  | "chevron-down"
  | "chart-bar"
  | "key"
  | "copy"
  | "filter"
  | "slack"
  | "mail"
  | "webhook"
  | "shield";

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

// 24x24 viewBox, stroke-1.5, currentColor — drops directly into any token-tinted parent.
export function Icon({ name, size = 16, className }: IconProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className
  };
  switch (name) {
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5l-2 5-5 2 2-5z" />
        </svg>
      );
    case "list":
      return (
        <svg {...common}>
          <line x1="8" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="8" y1="18" x2="20" y2="18" />
          <circle cx="4" cy="6" r="0.8" fill="currentColor" />
          <circle cx="4" cy="12" r="0.8" fill="currentColor" />
          <circle cx="4" cy="18" r="0.8" fill="currentColor" />
        </svg>
      );
    case "robot":
      return (
        <svg {...common}>
          <rect x="5" y="8" width="14" height="11" rx="2" />
          <path d="M12 8V5" />
          <circle cx="12" cy="4" r="1" />
          <circle cx="9" cy="13" r="1" fill="currentColor" />
          <circle cx="15" cy="13" r="1" fill="currentColor" />
          <line x1="3" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="21" y2="12" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <rect x="4" y="4" width="16" height="17" rx="1" />
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="14" x2="20" y2="14" />
          <line x1="10" y1="4" x2="10" y2="21" />
        </svg>
      );
    case "scales":
      return (
        <svg {...common}>
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="6" y1="20" x2="18" y2="20" />
          <path d="M5 8h14" />
          <path d="M3 14l2-6 2 6a2 2 0 01-4 0z" />
          <path d="M17 14l2-6 2 6a2 2 0 01-4 0z" />
        </svg>
      );
    case "scroll":
      return (
        <svg {...common}>
          <path d="M5 5h11a2 2 0 012 2v9a2 2 0 002 2H8a2 2 0 01-2-2V7a2 2 0 00-2-2z" />
          <line x1="9" y1="9" x2="15" y2="9" />
          <line x1="9" y1="13" x2="15" y2="13" />
        </svg>
      );
    case "gear":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.05a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.05a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.05a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      );
    case "briefcase":
      return (
        <svg {...common}>
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2" />
        </svg>
      );
    case "agent":
      return (
        <svg {...common}>
          <circle cx="12" cy="9" r="3.5" />
          <path d="M5 21a7 7 0 0114 0" />
          <circle cx="9" cy="9" r="0.6" fill="currentColor" />
          <circle cx="15" cy="9" r="0.6" fill="currentColor" />
        </svg>
      );
    case "clock":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <polyline points="12 7 12 12 15 14" />
        </svg>
      );
    case "alert":
      return (
        <svg {...common}>
          <path d="M12 3l10 17H2z" />
          <line x1="12" y1="10" x2="12" y2="14" />
          <circle cx="12" cy="17" r="0.6" fill="currentColor" />
        </svg>
      );
    case "bell":
      return (
        <svg {...common}>
          <path d="M6 8a6 6 0 0112 0c0 7 3 8 3 8H3s3-1 3-8" />
          <path d="M10.5 21a2 2 0 003 0" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      );
    case "plus":
      return (
        <svg {...common}>
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      );
    case "check":
      return (
        <svg {...common}>
          <polyline points="5 12 10 17 19 7" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      );
    case "chevron-right":
      return (
        <svg {...common}>
          <polyline points="9 6 15 12 9 18" />
        </svg>
      );
    case "chevron-up":
      return (
        <svg {...common}>
          <polyline points="6 15 12 9 18 15" />
        </svg>
      );
    case "chevron-down":
      return (
        <svg {...common}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      );
    case "chart-bar":
      return (
        <svg {...common}>
          <line x1="4" y1="20" x2="20" y2="20" />
          <rect x="6" y="11" width="3" height="9" />
          <rect x="11" y="6" width="3" height="14" />
          <rect x="16" y="14" width="3" height="6" />
        </svg>
      );
    case "key":
      return (
        <svg {...common}>
          <circle cx="8" cy="15" r="4" />
          <path d="M11 13l9-9" />
          <path d="M17 7l3 3" />
          <path d="M14 10l2 2" />
        </svg>
      );
    case "copy":
      return (
        <svg {...common}>
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V6a2 2 0 012-2h9" />
        </svg>
      );
    case "filter":
      return (
        <svg {...common}>
          <path d="M4 5h16l-6 8v6l-4-2v-4z" />
        </svg>
      );
    case "slack":
      return (
        <svg {...common}>
          <rect x="4" y="10" width="6" height="3" rx="1.5" />
          <rect x="14" y="11" width="6" height="3" rx="1.5" />
          <rect x="11" y="4" width="3" height="6" rx="1.5" />
          <rect x="10" y="14" width="3" height="6" rx="1.5" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <polyline points="3 8 12 14 21 8" />
        </svg>
      );
    case "webhook":
      return (
        <svg {...common}>
          <circle cx="7" cy="17" r="2.5" />
          <circle cx="17" cy="17" r="2.5" />
          <circle cx="12" cy="6" r="2.5" />
          <path d="M9.5 17h5" />
          <path d="M11 8.5l-3 5" />
          <path d="M13 8.5l3 5" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
          <polyline points="9 12 11 14 15 10" />
        </svg>
      );
  }
}
