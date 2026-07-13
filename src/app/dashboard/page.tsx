"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageTitle, HealthDot } from "@/components/ui";
import { useMe } from "@/lib/useMe";

type Fire = { id: string; invoiceRef?: string; title?: string; client: string; clientId: string; reason?: string; editableUntil?: string; dueDate?: string; overdue?: boolean };
type Stats = {
  clientCount: number;
  health: { green: number; yellow: number; red: number };
  invoiceTotals: { draft: number; accepted: number; rejected: number };
  fires: { rejections: Fire[]; windowsClosing: Fire[]; deadlinesSoon: Fire[] };
  thisWeek: Fire[];
};
type Staff = { _id: string; name: string };

function fmtDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

export default function Overview() {
  const { user } = useMe();
  const isPrincipal = user?.role === "principal";
  const [stats, setStats] = useState<Stats | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [filter, setFilter] = useState("");

  const load = useCallback((staffId: string) => {
    const url = staffId ? `/api/stats?staff=${staffId}` : "/api/stats";
    fetch(url).then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    if (isPrincipal) fetch("/api/firm/staff").then((r) => r.json()).then((sd) => setStaff(sd.staff || [])).catch(() => {});
  }, [isPrincipal]);
  useEffect(() => { load(filter); }, [filter, load]);

  const h = stats?.health;
  const totalFires = stats ? stats.fires.rejections.length + stats.fires.windowsClosing.length + stats.fires.deadlinesSoon.length : 0;

  return (
    <div>
      <PageTitle
        kicker="Command centre"
        title="Where every client stands"
        sub="Your whole book of clients in one view — what's on fire today, what's due this week, and who's healthy."
        action={
          isPrincipal ? (
            <select className="field !py-2 max-w-[200px]" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="">All staff</option>
              {staff.map((s) => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          ) : null
        }
      />

      {/* Health strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="mono text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-soft)]">Clients</p>
          <p className="mono text-3xl font-medium mt-2">{stats?.clientCount ?? "—"}</p>
        </div>
        <div className="card p-5">
          <p className="mono text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-soft)] flex items-center gap-2"><HealthDot tone="green" /> Healthy</p>
          <p className="mono text-3xl font-medium mt-2">{h?.green ?? "—"}</p>
        </div>
        <div className="card p-5">
          <p className="mono text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-soft)] flex items-center gap-2"><HealthDot tone="yellow" /> Watch</p>
          <p className="mono text-3xl font-medium mt-2">{h?.yellow ?? "—"}</p>
        </div>
        <div className="card p-5">
          <p className="mono text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-soft)] flex items-center gap-2"><HealthDot tone="red" /> At risk</p>
          <p className="mono text-3xl font-medium mt-2">{h?.red ?? "—"}</p>
        </div>
      </div>

      {/* Today's fires */}
      <section className="mt-8">
        <h2 className="display text-xl font-bold mb-3">
          Today&apos;s fires {totalFires > 0 && <span className="stamp stamp-rejected ml-2">{totalFires}</span>}
        </h2>
        <div className="card divide-y divide-[color:var(--color-rule)]">
          {stats && totalFires === 0 && (
            <p className="p-6 text-sm text-[color:var(--color-ink-soft)]">Nothing on fire. Every rejection cleared, no edit windows closing, no deadline inside 48 hours. 🌿</p>
          )}
          {stats?.fires.rejections.map((f) => (
            <Link key={f.id} href={`/dashboard/clients/${f.clientId}/invoices`} className="flex items-center justify-between gap-4 p-4 hover:bg-[color:var(--color-pine-tint)]">
              <div>
                <span className="stamp stamp-rejected mr-3">Rejected</span>
                <span className="font-medium">{f.client}</span>
                <span className="mono text-xs text-[color:var(--color-ink-soft)] ml-2">{f.invoiceRef}</span>
                <p className="text-sm text-[color:var(--color-stamp)] mt-1">{f.reason}</p>
              </div>
              <span className="mono text-xs text-[color:var(--color-pine)]">Fix →</span>
            </Link>
          ))}
          {stats?.fires.windowsClosing.map((f) => (
            <Link key={f.id} href={`/dashboard/clients/${f.clientId}/invoices`} className="flex items-center justify-between gap-4 p-4 hover:bg-[color:var(--color-pine-tint)]">
              <div>
                <span className="stamp mr-3 text-[color:var(--color-gold)] border-[color:var(--color-gold)]">72h window</span>
                <span className="font-medium">{f.client}</span>
                <span className="mono text-xs text-[color:var(--color-ink-soft)] ml-2">{f.invoiceRef}</span>
                <p className="text-sm text-[color:var(--color-ink-soft)] mt-1">Edit/cancel window closes {fmtDate(f.editableUntil)} — act now if a correction is needed.</p>
              </div>
              <span className="mono text-xs text-[color:var(--color-pine)]">Open →</span>
            </Link>
          ))}
          {stats?.fires.deadlinesSoon.map((f) => (
            <Link key={f.id} href={`/dashboard/clients/${f.clientId}/deadlines`} className="flex items-center justify-between gap-4 p-4 hover:bg-[color:var(--color-pine-tint)]">
              <div>
                <span className={`stamp mr-3 ${f.overdue ? "stamp-rejected" : "text-[color:var(--color-gold)] border-[color:var(--color-gold)]"}`}>{f.overdue ? "Overdue" : "Due soon"}</span>
                <span className="font-medium">{f.client}</span>
                <p className="text-sm text-[color:var(--color-ink-soft)] mt-1">{f.title} — due {fmtDate(f.dueDate)}</p>
              </div>
              <span className="mono text-xs text-[color:var(--color-pine)]">Open →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* This week */}
      <section className="mt-8">
        <h2 className="display text-xl font-bold mb-3">This week</h2>
        <div className="card overflow-x-auto">
          <table className="ledger w-full">
            <thead><tr><th>Due</th><th>Client</th><th>Obligation</th><th></th></tr></thead>
            <tbody>
              {stats?.thisWeek.map((d) => (
                <tr key={d.id}>
                  <td className="mono whitespace-nowrap">{fmtDate(d.dueDate)}{d.overdue && <span className="text-[color:var(--color-stamp)]"> · overdue</span>}</td>
                  <td className="font-medium">{d.client}</td>
                  <td>{d.title}</td>
                  <td className="text-right"><Link href={`/dashboard/clients/${d.clientId}/deadlines`} className="mono text-xs text-[color:var(--color-pine)]">Open →</Link></td>
                </tr>
              ))}
              {stats && stats.thisWeek.length === 0 && (
                <tr><td colSpan={4} className="text-sm text-[color:var(--color-ink-soft)] py-8 text-center">No obligations due in the next 7 days.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
