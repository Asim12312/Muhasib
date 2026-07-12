"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageTitle, ClientStatusBadge, Empty } from "@/components/ui";
import { pushRecentClient } from "@/components/CommandSwitcher";

type Client = {
  _id: string; businessName: string; ntn: string; category: string; sector: string;
  province: string; status: string; fbrMode: string;
  assignedTo: { _id: string; name: string }[];
};

const STATUSES = ["", "onboarding", "active", "pending_docs", "at_risk", "dormant"];
const CATEGORY_LABEL: Record<string, string> = {
  public_company: "Public Co", private_company: "Private Co", individual: "Individual", aop: "AOP",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (status) params.set("status", status);
    fetch(`/api/clients?${params}`).then((r) => r.json()).then((d) => setClients(d.clients || []));
  }, [q, status]);
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);

  return (
    <div>
      <PageTitle
        kicker="Clients"
        title="Your client book"
        sub="Every SME your firm files for. Open one to manage its invoices, buyers, documents and deadlines."
        action={
          <div className="flex gap-2">
            <Link href="/dashboard/clients/import" className="btn btn-ghost">Bulk import</Link>
            <Link href="/dashboard/clients/new" className="btn btn-primary">Add client</Link>
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input className="field sm:max-w-xs" placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="field sm:max-w-[200px]" value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((st) => <option key={st} value={st}>{st ? st.replace("_", " ") : "All statuses"}</option>)}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="ledger w-full">
          <thead>
            <tr><th>Business</th><th>NTN</th><th>Type</th><th>Status</th><th>Assigned</th><th>FBR</th></tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c._id} className="hover:bg-[color:var(--color-pine-tint)]">
                <td className="font-medium">
                  <Link href={`/dashboard/clients/${c._id}`} onClick={() => pushRecentClient({ _id: c._id, businessName: c.businessName })} className="hover:text-[color:var(--color-pine)]">
                    {c.businessName}
                  </Link>
                  {c.sector && <span className="block text-xs text-[color:var(--color-ink-soft)]">{c.sector}</span>}
                </td>
                <td className="mono text-sm">{c.ntn || "—"}</td>
                <td className="text-sm">{CATEGORY_LABEL[c.category] || c.category}</td>
                <td><ClientStatusBadge status={c.status} /></td>
                <td className="text-sm">{c.assignedTo?.map((a) => a.name).join(", ") || <span className="text-[color:var(--color-ink-mute)]">Unassigned</span>}</td>
                <td className="mono text-xs uppercase">{c.fbrMode === "pral" ? "Live" : "Sandbox"}</td>
              </tr>
            ))}
            {clients.length === 0 && (
              <Empty colSpan={6}>No clients match. Add your first SME to get started.</Empty>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
