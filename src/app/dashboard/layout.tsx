"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LangToggle } from "@/components/LangToggle";
import { useLang } from "@/lib/i18n/context";
import { CommandSwitcher } from "@/components/CommandSwitcher";

function Icon({ name }: { name: string }) {
  const p = { className: "side-icon", stroke: "currentColor", strokeWidth: 1.75, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };
  switch (name) {
    case "overview":
      return <svg {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>;
    case "clients":
      return <svg {...p}><circle cx="9" cy="8" r="4"/><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6"/><path d="M17 11a3 3 0 1 0-3-3"/><path d="M22 20a4.5 4.5 0 0 0-5-4"/></svg>;
    case "calendar":
      return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
    case "staff":
      return <svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "billing":
      return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>;
    case "settings":
      return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case "logout":
      return <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>;
    default: return null;
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLang();
  const isUr = lang === "ur";
  const [me, setMe] = useState<{ name: string; role: string; firm: string } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) setMe({ name: d.user.name, role: d.user.role, firm: d.firm?.name || "" });
    }).catch(() => {});
  }, []);

  const isPrincipal = me?.role === "principal";
  const nav = [
    { href: "/dashboard", icon: "overview", label_en: "Overview", label_ur: "خلاصہ", show: true },
    { href: "/dashboard/clients", icon: "clients", label_en: "Clients", label_ur: "کلائنٹس", show: true },
    { href: "/dashboard/calendar", icon: "calendar", label_en: "Calendar", label_ur: "کیلنڈر", show: true },
    { href: "/dashboard/staff", icon: "staff", label_en: "Staff", label_ur: "اسٹاف", show: isPrincipal },
    { href: "/dashboard/billing", icon: "billing", label_en: "Billing", label_ur: "بلنگ", show: isPrincipal },
    { href: "/dashboard/settings", icon: "settings", label_en: "Firm settings", label_ur: "ترتیبات", show: true },
  ].filter((n) => n.show);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <CommandSwitcher />
      <aside className="border-b md:border-b-0 md:border-r border-[color:var(--color-rule)] bg-[color:var(--color-sheet)] px-4 py-6 md:min-h-screen md:sticky md:top-0 md:h-screen md:flex md:flex-col">
        <div className="flex items-center justify-between px-2">
          <Link href="/dashboard" className="display font-bold text-xl text-[color:var(--color-pine-deep)]">
            {isUr ? "مُحاسِب" : "Muhasib"}
          </Link>
          <LangToggle />
        </div>
        {me?.firm && <p className="px-2 mt-1 text-xs text-[color:var(--color-ink-soft)] truncate">{me.firm}</p>}

        <button
          onClick={() => { const e = new KeyboardEvent("keydown", { key: "k", metaKey: true }); window.dispatchEvent(e); }}
          className="mt-4 mx-2 flex items-center justify-between gap-2 rounded-md border border-[color:var(--color-rule)] px-3 py-2 text-sm text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-pine)]"
        >
          <span>{isUr ? "کلائنٹ تبدیل کریں" : "Switch client…"}</span>
          <kbd className="mono text-[0.62rem] border border-[color:var(--color-rule)] rounded px-1.5 py-0.5">⌘K</kbd>
        </button>

        <nav className="mt-6 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
          {nav.map((n) => {
            const active = n.href === "/dashboard" ? pathname === n.href : pathname.startsWith(n.href);
            return (
              <Link key={n.href} href={n.href} className="side-link" aria-current={active ? "page" : undefined}>
                <Icon name={n.icon} />
                <span>{isUr ? n.label_ur : n.label_en}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 hidden md:block">
          <button onClick={logout} className="side-link w-full text-left">
            <Icon name="logout" />
            <span>{isUr ? "لاگ آؤٹ" : "Sign out"}</span>
          </button>
          {me && (
            <p className="mono text-xs text-[color:var(--color-ink-mute)] mt-4 px-3">
              {me.name} · <span className="uppercase">{me.role}</span>
            </p>
          )}
        </div>

        <button onClick={logout} className="md:hidden mono text-xs uppercase tracking-[0.12em] text-[color:var(--color-ink-soft)] mt-4 hover:text-[color:var(--color-stamp)] px-2 self-start">
          {isUr ? "لاگ آؤٹ" : "Sign out"}
        </button>
      </aside>

      <main className="px-6 py-10 md:px-10 max-w-6xl w-full">{children}</main>
    </div>
  );
}
