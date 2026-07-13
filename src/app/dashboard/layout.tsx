"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LangToggle } from "@/components/LangToggle";
import { useLang } from "@/lib/i18n/context";
import { CommandSwitcher } from "@/components/CommandSwitcher";
import { InstallPwaButton } from "@/components/InstallPwaButton";
import { LinkSpinner } from "@/components/LinkSpinner";
import { VerifyBanner } from "@/components/VerifyBanner";
import { MeProvider, useMe } from "@/lib/useMe";
import { Button } from "@/components/Button";

function Icon({ name }: { name: string }) {
  const p = { className: "side-icon", stroke: "currentColor", strokeWidth: 1.75, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, viewBox: "0 0 24 24" };
  switch (name) {
    case "overview": return <svg {...p}><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>;
    case "clients": return <svg {...p}><circle cx="9" cy="8" r="4"/><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6"/><path d="M17 11a3 3 0 1 0-3-3"/><path d="M22 20a4.5 4.5 0 0 0-5-4"/></svg>;
    case "calendar": return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>;
    case "staff": return <svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "billing": return <svg {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>;
    case "settings": return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>;
    case "logout": return <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>;
    default: return null;
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MeProvider>
      <DashboardShell>{children}</DashboardShell>
    </MeProvider>
  );
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLang();
  const isUr = lang === "ur";
  const { user, firm } = useMe();
  const [drawer, setDrawer] = useState(false);

  // Close the mobile drawer whenever the route changes
  useEffect(() => { setDrawer(false); }, [pathname]);

  const isPrincipal = user?.role === "principal";
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

  const SidebarBody = (
    <>
      <div className="flex items-center justify-between px-2">
        <Link href="/dashboard" className="display font-bold text-xl text-[color:var(--color-pine-deep)]">
          {isUr ? "مُحاسِب" : "Muhasib"}
        </Link>
        <LangToggle />
      </div>
      {firm?.name && <p className="px-2 mt-1 text-xs text-[color:var(--color-ink-soft)] truncate">{firm.name}</p>}

      <button
        onClick={() => { setDrawer(false); window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true })); }}
        className="mt-4 mx-2 flex items-center justify-between gap-2 rounded-md border border-[color:var(--color-rule)] px-3 py-2 text-sm text-[color:var(--color-ink-soft)] hover:border-[color:var(--color-pine)]"
      >
        <span>{isUr ? "کلائنٹ تبدیل کریں" : "Switch client…"}</span>
        <kbd className="mono text-[0.62rem] border border-[color:var(--color-rule)] rounded px-1.5 py-0.5">⌘K</kbd>
      </button>

      <nav className="mt-6 flex flex-col gap-1">
        {nav.map((n) => {
          const active = n.href === "/dashboard" ? pathname === n.href : pathname.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} className="side-link" aria-current={active ? "page" : undefined}>
              <Icon name={n.icon} />
              <span>{isUr ? n.label_ur : n.label_en}</span>
              <LinkSpinner />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6">
        <InstallPwaButton />
        <Button variant="plain" onClick={logout} className="side-link w-full text-left mt-1" loadingText={isUr ? "لاگ آؤٹ ہو رہا ہے…" : "Signing out…"}>
          <Icon name="logout" />
          <span>{isUr ? "لاگ آؤٹ" : "Sign out"}</span>
        </Button>
        {user && <p className="mono text-xs text-[color:var(--color-ink-mute)] mt-4 px-3 truncate">{user.name} · <span className="uppercase">{user.role}</span></p>}
      </div>
    </>
  );

  return (
    <div className="min-h-screen md:grid md:grid-cols-[260px_1fr]">
      <CommandSwitcher />

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[color:var(--color-sheet)] border-b border-[color:var(--color-rule)]">
        <button aria-label="Open menu" onClick={() => setDrawer(true)} className="p-2 -ml-2">
          <svg width="24" height="24" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
        </button>
        <Link href="/dashboard" className="display font-bold text-lg text-[color:var(--color-pine-deep)]">{isUr ? "مُحاسِب" : "Muhasib"}</Link>
        <LangToggle />
      </header>

      {/* Mobile drawer */}
      {drawer && (
        <div className="md:hidden fixed inset-0 z-40" onClick={() => setDrawer(false)}>
          <div className="absolute inset-0 bg-[color:var(--color-ink)]/40" />
          <aside className="absolute inset-y-0 left-0 w-[80vw] max-w-xs bg-[color:var(--color-sheet)] px-4 py-6 flex flex-col overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            {SidebarBody}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex border-r border-[color:var(--color-rule)] bg-[color:var(--color-sheet)] px-4 py-6 md:min-h-screen md:sticky md:top-0 md:h-screen md:flex-col">
        {SidebarBody}
      </aside>

      <main className="px-4 py-6 sm:px-6 sm:py-8 md:px-10 md:py-10 max-w-6xl w-full min-w-0">
        <VerifyBanner />
        {children}
      </main>
    </div>
  );
}
