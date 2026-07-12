"use client";
import { useEffect, useState } from "react";

/** Live countdown to the FBR 72-hour edit/cancel window closing. */
export function Countdown({ until }: { until: string | Date | null | undefined }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  if (!until) return null;
  const ms = new Date(until).getTime() - now;
  if (ms <= 0) return <span className="mono text-xs text-[color:var(--color-ink-mute)]">edit window closed</span>;
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const urgent = h < 12;
  return (
    <span className={`mono text-xs ${urgent ? "text-[color:var(--color-stamp)]" : "text-[color:var(--color-ink-soft)]"}`}>
      edit window: {h}h {m}m left
    </span>
  );
}
