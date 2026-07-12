"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ClientStatusBadge } from "@/components/ui";
import { pushRecentClient } from "@/components/CommandSwitcher";

type ClientLite = { _id: string; businessName: string; ntn: string; status: string; fbrMode: string };

export default function ClientWorkspaceLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const id = params.id as string;
  const [client, setClient] = useState<ClientLite | null>(null);

  useEffect(() => {
    fetch(`/api/clients/${id}`).then((r) => r.json()).then((d) => {
      if (d.client) {
        setClient(d.client);
        pushRecentClient({ _id: d.client._id, businessName: d.client.businessName });
      }
    }).catch(() => {});
  }, [id]);

  const base = `/dashboard/clients/${id}`;
  const tabs = [
    { href: base, label: "Overview" },
    { href: `${base}/invoices`, label: "Invoices" },
    { href: `${base}/buyers`, label: "Buyers" },
    { href: `${base}/documents`, label: "Documents" },
    { href: `${base}/deadlines`, label: "Deadlines" },
    { href: `${base}/settings`, label: "Settings" },
  ];

  return (
    <div>
      {/* Sticky current-client indicator — prevents filing for the wrong client */}
      <div className="client-subnav sticky top-0 z-20 -mx-6 md:-mx-10 px-6 md:px-10 py-3 bg-[color:var(--color-sheet)] border-b border-[color:var(--color-rule)] mb-6">
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/dashboard/clients" className="mono text-xs text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-pine)]">← Clients</Link>
            <span className="display font-bold text-lg truncate">{client?.businessName || "…"}</span>
            {client && <ClientStatusBadge status={client.status} />}
            {client && <span className="mono text-[0.6rem] uppercase tracking-[0.12em] px-2 py-0.5 rounded border border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)]">{client.fbrMode === "pral" ? "FBR Live" : "Sandbox"}</span>}
          </div>
          {client?.ntn && <span className="mono text-xs text-[color:var(--color-ink-soft)]">NTN {client.ntn}</span>}
        </div>
        <nav className="flex gap-1 mt-3 overflow-x-auto">
          {tabs.map((t) => {
            const active = t.href === base ? pathname === base : pathname.startsWith(t.href);
            return (
              <Link key={t.href} href={t.href}
                className={`mono text-xs uppercase tracking-[0.08em] px-3 py-2 rounded-md whitespace-nowrap ${active ? "bg-[color:var(--color-pine)] text-white" : "text-[color:var(--color-ink-soft)] hover:bg-[color:var(--color-pine-tint)]"}`}>
                {t.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
