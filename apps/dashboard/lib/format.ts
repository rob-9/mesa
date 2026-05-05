// Returns short relative-time strings: "2m", "1h", "3d", "<1m", "5w".
// Anchored to a fixed "now" so screenshots are deterministic in the demo build.
export const DEMO_NOW_ISO = "2026-05-05T16:30:00Z";
const DEMO_NOW = new Date(DEMO_NOW_ISO).getTime();

export function formatRelative(iso: string, now: number = DEMO_NOW): string {
  const then = new Date(iso).getTime();
  const diff = Math.max(0, now - then);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "<1m";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d`;
  const wk = Math.floor(day / 7);
  return `${wk}w`;
}

// "14:04" from an ISO timestamp.
export function formatClock(iso: string): string {
  const d = new Date(iso);
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}
