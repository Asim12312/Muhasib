"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ErrorNote } from "@/components/ui";
import { Button } from "@/components/Button";

type Buyer = { _id: string; name: string };
type Row = { hsCode: string; description: string; quantity: string; uom: string; rate: string; taxRate: string };
const emptyRow = (): Row => ({ hsCode: "", description: "", quantity: "1", uom: "PCS", rate: "", taxRate: "18" });

export default function NewInvoice() {
  const { id } = useParams();
  const router = useRouter();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [buyerId, setBuyerId] = useState("");
  const [invoiceRef, setInvoiceRef] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Row[]>([emptyRow()]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/clients/${id}/buyers`).then((r) => r.json()).then((d) => {
      setBuyers(d.buyers || []);
      if (d.buyers?.[0]) setBuyerId(d.buyers[0]._id);
    });
  }, [id]);

  const totals = useMemo(() => {
    let excl = 0, tax = 0;
    for (const r of rows) {
      const v = (Number(r.quantity) || 0) * (Number(r.rate) || 0);
      excl += v; tax += v * ((Number(r.taxRate) || 0) / 100);
    }
    return { excl, tax, total: excl + tax };
  }, [rows]);

  const setRow = (i: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  async function save(transmit: boolean) {
    setError("");
    const res = await fetch(`/api/clients/${id}/invoices`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyerId, invoiceRef, invoiceDate, items: rows }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Could not save invoice."); return; }
    if (transmit) {
      const sres = await fetch(`/api/clients/${id}/invoices/${data.invoice._id}/submit`, { method: "POST" });
      const sdata = await sres.json();
      if (!sres.ok) { setError(sdata.error || "Saved as draft, but FBR transmission failed. Retry from the register."); router.push(`/dashboard/clients/${id}/invoices`); return; }
    }
    router.push(`/dashboard/clients/${id}/invoices`);
  }

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-1">Issue a sales tax invoice</h1>
      <p className="text-[color:var(--color-ink-soft)] mb-6 text-sm">Saved as a draft first — transmit to FBR from the register when you&apos;re ready.</p>
      {buyers.length === 0 ? (
        <div className="card p-6 text-sm">
          Add a buyer first — every invoice needs one.{" "}
          <Link href={`/dashboard/clients/${id}/buyers`} className="text-[color:var(--color-pine)] font-medium">Go to Buyers →</Link>
        </div>
      ) : (
        <>
          <div className="card p-6 grid sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Buyer</label>
              <select className="field" value={buyerId} onChange={(e) => setBuyerId(e.target.value)}>
                {buyers.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Invoice №</label>
              <input className="field mono" placeholder="INV-2026-041" value={invoiceRef} onChange={(e) => setInvoiceRef(e.target.value)} />
            </div>
            <div>
              <label className="label">Invoice date</label>
              <input className="field mono" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} />
            </div>
          </div>

          <div className="card mt-4 overflow-x-auto">
            <table className="ledger w-full min-w-[720px]">
              <thead><tr><th>HS code</th><th>Description</th><th>Qty</th><th>UoM</th><th>Unit price</th><th>ST %</th><th className="text-right">Line total</th><th></th></tr></thead>
              <tbody>
                {rows.map((r, i) => {
                  const line = (Number(r.quantity) || 0) * (Number(r.rate) || 0) * (1 + (Number(r.taxRate) || 0) / 100);
                  return (
                    <tr key={i}>
                      <td><input className="field mono !py-1.5 w-24" value={r.hsCode} placeholder="7318.15" onChange={(e) => setRow(i, { hsCode: e.target.value })} /></td>
                      <td><input className="field !py-1.5 min-w-40" value={r.description} onChange={(e) => setRow(i, { description: e.target.value })} /></td>
                      <td><input className="field mono !py-1.5 w-16" inputMode="decimal" value={r.quantity} onChange={(e) => setRow(i, { quantity: e.target.value })} /></td>
                      <td><input className="field mono !py-1.5 w-16" value={r.uom} onChange={(e) => setRow(i, { uom: e.target.value })} /></td>
                      <td><input className="field mono !py-1.5 w-24" inputMode="decimal" value={r.rate} onChange={(e) => setRow(i, { rate: e.target.value })} /></td>
                      <td><input className="field mono !py-1.5 w-14" inputMode="decimal" value={r.taxRate} onChange={(e) => setRow(i, { taxRate: e.target.value })} /></td>
                      <td className="mono text-right">{line ? line.toLocaleString("en-PK", { maximumFractionDigits: 0 }) : "—"}</td>
                      <td className="text-right">{rows.length > 1 && <button className="mono text-xs text-[color:var(--color-stamp)]" onClick={() => setRows(rows.filter((_, j) => j !== i))}>remove</button>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="p-4"><button className="btn btn-ghost text-xs" onClick={() => setRows([...rows, emptyRow()])}>+ Add line item</button></div>
          </div>

          <div className="card p-5 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="mono text-sm space-x-6">
              <span>Excl. tax: <strong>{totals.excl.toLocaleString("en-PK", { maximumFractionDigits: 0 })}</strong></span>
              <span>Sales tax: <strong>{totals.tax.toLocaleString("en-PK", { maximumFractionDigits: 0 })}</strong></span>
              <span className="text-[color:var(--color-pine)]">Total: <strong>{totals.total.toLocaleString("en-PK", { maximumFractionDigits: 0 })}</strong></span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <ErrorNote msg={error} />
              <Button variant="ghost" onClick={() => save(false)} disabled={!invoiceRef || !buyerId} loadingText="Saving…">Save draft</Button>
              <Button onClick={() => save(true)} disabled={!invoiceRef || !buyerId} loadingText="Transmitting…">Save &amp; transmit</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
