"use client";
import { useState } from "react";
import Link from "next/link";
import { useLang } from "@/lib/i18n/context";

/**
 * Left-side hamburger menu for the public landing page: free tools live
 * here (Penalty calculator, Invoice № checker) so the top nav stays
 * uncluttered for the primary sign-in/sign-up actions.
 */
export function LandingSidebar() {
  const [open, setOpen] = useState(false);
  const { t } = useLang();

  const links = [
    { href: "/tools/penalty-calculator", label: t("nav_penalty"), icon: "calc" },
    { href: "/tools/irn-validator", label: t("nav_irn"), icon: "check" },
  ];

  return (
    <>
      <button
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="p-2 -ml-2 rounded-md text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-pine)] hover:bg-[color:var(--color-pine-tint)] transition-colors"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-[color:var(--color-ink)]/40" />
          <aside
            className="absolute inset-y-0 left-0 w-[78vw] max-w-xs bg-[color:var(--color-sheet)] px-5 py-6 flex flex-col shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <span className="display font-bold text-lg text-[color:var(--color-pine-deep)]">Mohasib</span>
              <button aria-label="Close menu" onClick={() => setOpen(false)} className="p-1.5 text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-stamp)]">
                <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="mono text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--color-ink-mute)] mb-3">Free tools</p>
            <nav className="flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="side-link">
                  <ToolIcon name={l.icon} />
                  <span>{l.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

function ToolIcon({ name }: { name: string }) {
  const p = { className: "side-icon", stroke: "currentColor", strokeWidth: 1.75, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };
  if (name === "calc") return <svg {...p}><rect x="4" y="2" width="16" height="20" rx="2" /><path d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" /></svg>;
  return <svg {...p}><path d="M9 12l2 2 4-4" /><circle cx="12" cy="12" r="9" /></svg>;
}
