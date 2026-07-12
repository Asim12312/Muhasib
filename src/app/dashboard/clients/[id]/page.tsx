"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { computePenalty, formatPKR } from "@/lib/penalty";

type Invoice = { _id: string; status: "draft" | "accepted" | "rejected"; totals: { salesTax: number } };
type Deadline = { _id: string; title: string; dueDate: string; status: string };
type Client = { businessName: string; ntn: string; fbrMode: string; status: string };

export default function ClientOverview() {
  const { id } = useParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [client, setClient] = useState<Client | null>(null);

  useEffect(() => {
    fetch(`/api/clients/${id}`).then((r) => r.json()).then((d) => setClient(d.client));
    fetch(`/api/clients/${id}/invoices`).then((r) => r.json()).then((d) => setInvoices(d.invoices || []));
    fetch(`/api/clients/${id}/deadlines`).then((r) => r.json()).then((d) => setDeadlines(d.deadlines || []));
  }, [id]);

  const counts = { draft: 0, accepted: 0, rejected: 0 };
  let taxAtRisk = 0;
  for (const inv of invoices) {
    counts[inv.status]++;
    if (inv.status !== "accepted") taxAtRisk += inv.totals?.salesTax || 0;
  }
  const exposure = counts.draft + counts.rejected > 0 ? computePenalty({ taxInvolved: taxAtRisk, daysLate: 0 }).issuePenalty : 0;
  const upcoming = deadlines.filter((d) => d.status !== "done").slice(0, 4);
  const base = `/dashboard/clients/${id}`;

  return (
    <div>
      {client && !client.ntn && (
        <div className="card p-4 mb-5 border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/5">
          <p className="text-sm">⚠️ This client has no NTN set. <Link href={`${base}/settings`} className="text-[color:var(--color-pine)] font-medium underline">Add it in Settings</Link> before transmitting invoices to FBR.</p>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Accepted by FBR", value: counts.accepted, tone: "stamp-accepted" },
          { label: "Drafts awaiting", value: counts.draft, tone: "stamp-draft" },
          { label: "Rejected — fix & resend", value: counts.rejected, tone: "stamp-rejected" },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <span className={`stamp ${s.tone}`}>{s.label}</span>
            <p className="mono text-3xl font-medium mt-3">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6 mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="mono text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-soft)]">Estimated Section 33 exposure on untransmitted invoices</p>
          <p className={`mono text-2xl font-medium mt-1 ${exposure ? "text-[color:var(--color-stamp)]" : "text-[color:var(--color-pine)]"}`}>{formatPKR(exposure)}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`${base}/invoices/new`} className="btn btn-primary">New invoice</Link>
          <Link href={`${base}/invoices/import`} className="btn btn-ghost">Bulk import</Link>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="display font-bold mb-3">Upcoming obligations</h3>
          {upcoming.length === 0 && <p className="text-sm text-[color:var(--color-ink-soft)]">No pending deadlines.</p>}
          <ul className="space-y-2">
            {upcoming.map((d) => (
              <li key={d._id} className="flex justify-between text-sm">
                <span>{d.title}</span>
                <span className="mono text-[color:var(--color-ink-soft)]">{new Date(d.dueDate).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}</span>
              </li>
            ))}
          </ul>
          <Link href={`${base}/deadlines`} className="mono text-xs text-[color:var(--color-pine)] mt-3 inline-block">View calendar →</Link>
        </div>
        <div className="card p-5">
          <h3 className="display font-bold mb-3">Quick actions</h3>
          <div className="flex flex-col gap-2">
            <Link href={`${base}/buyers`} className="btn btn-ghost justify-start">Manage buyers</Link>
            <Link href={`${base}/documents`} className="btn btn-ghost justify-start">Document vault</Link>
            <Link href={`${base}/settings`} className="btn btn-ghost justify-start">FBR connection & profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
