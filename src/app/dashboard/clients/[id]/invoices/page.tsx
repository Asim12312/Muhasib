"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Stamp, ErrorNote, Empty } from "@/components/ui";
import { Countdown } from "@/components/Countdown";

type Invoice = {
  _id: string; invoiceRef: string; invoiceDate: string;
  buyerId: { name: string } | null;
  totals: { total: number };
  status: "draft" | "accepted" | "rejected";
  irn: string; fbrErrorFriendly: string; fbrError: string;
  submitAttempts: number; editableUntil: string | null;
};

export default function ClientInvoices() {
  const { id } = useParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(() => {
    fetch(`/api/clients/${id}/invoices`).then((r) => r.json()).then((d) => setInvoices(d.invoices || []));
  }, [id]);
  useEffect(() => { load(); }, [load]);

  async function transmit(invId: string) {
    setBusyId(invId); setError("");
    const res = await fetch(`/api/clients/${id}/invoices/${invId}/submit`, { method: "POST" });
    const data = await res.json();
    setBusyId("");
    if (!res.ok) setError(data.error || "Transmission failed.");
    load();
  }
  async function remove(invId: string) {
    if (!confirm("Delete this draft invoice?")) return;
    const res = await fetch(`/api/clients/${id}/invoices/${invId}`, { method: "DELETE" });
    if (!res.ok) setError((await res.json()).error || "Could not delete.");
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="display text-2xl font-bold">Invoice register</h1>
        <div className="flex gap-2">
          <Link href={`/dashboard/clients/${id}/invoices/import`} className="btn btn-ghost">Bulk import</Link>
          <Link href={`/dashboard/clients/${id}/invoices/new`} className="btn btn-primary">New invoice</Link>
        </div>
      </div>
      <ErrorNote msg={error} />
      <div className="card mt-4 overflow-x-auto">
        <table className="ledger w-full">
          <thead>
            <tr><th>№</th><th>Date</th><th>Buyer</th><th className="text-right">Total</th><th>Status</th><th>FBR result</th><th></th></tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv._id}>
                <td className="mono">{inv.invoiceRef}</td>
                <td className="mono">{inv.invoiceDate}</td>
                <td>{inv.buyerId?.name || "—"}</td>
                <td className="mono text-right">{inv.totals.total.toLocaleString("en-PK")}</td>
                <td><Stamp status={inv.status} /></td>
                <td className="mono text-xs max-w-[220px]">
                  {inv.status === "accepted" ? (
                    <div>
                      <div className="break-all">{inv.irn}</div>
                      <Countdown until={inv.editableUntil} />
                    </div>
                  ) : inv.status === "rejected" ? (
                    <div>
                      <span className="text-[color:var(--color-stamp)]">{inv.fbrErrorFriendly || inv.fbrError}</span>
                      {inv.submitAttempts > 1 && <span className="block text-[color:var(--color-ink-mute)]">{inv.submitAttempts} attempts</span>}
                    </div>
                  ) : "—"}
                </td>
                <td className="text-right whitespace-nowrap">
                  {inv.status === "accepted" ? (
                    <Link href={`/dashboard/clients/${id}/invoices/${inv._id}/print`} className="btn btn-ghost !py-1 !px-3 text-xs">Print / PDF</Link>
                  ) : (
                    <>
                      <button className="btn btn-ghost !py-1 !px-3 text-xs mr-2" disabled={busyId === inv._id} onClick={() => transmit(inv._id)}>
                        {busyId === inv._id ? "Transmitting…" : inv.status === "rejected" ? "Retry" : "Transmit"}
                      </button>
                      {inv.status === "draft" && <button className="btn btn-danger !py-1 !px-3 text-xs" onClick={() => remove(inv._id)}>Delete</button>}
                    </>
                  )}
                </td>
              </tr>
            ))}
            {invoices.length === 0 && <Empty colSpan={7}>No invoices yet. Issue the first one — it takes about a minute.</Empty>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
