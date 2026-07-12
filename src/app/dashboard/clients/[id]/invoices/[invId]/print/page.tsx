"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import QRCode from "qrcode";
import { formatPKR } from "@/lib/penalty";

type Item = { hsCode: string; description: string; quantity: number; uom: string; rate: number; taxRate: number; valueExclTax: number; salesTax: number; totalValue: number };
type Invoice = {
  invoiceRef: string; invoiceDate: string; irn: string; qrPayload: string; status: string;
  items: Item[]; totals: { valueExclTax: number; salesTax: number; total: number };
  clientId: { businessName: string; ntn: string; address: string; province: string };
  buyerId: { name: string; ntnOrCnic: string; address: string; province: string; registrationType: string };
};

export default function PrintInvoice() {
  const { id, invId } = useParams();
  const [inv, setInv] = useState<Invoice | null>(null);
  const [qr, setQr] = useState("");

  useEffect(() => {
    fetch(`/api/clients/${id}/invoices/${invId}`).then((r) => r.json()).then((d) => {
      if (d.invoice) {
        setInv(d.invoice);
        if (d.invoice.qrPayload) QRCode.toDataURL(d.invoice.qrPayload, { margin: 1, width: 160 }).then(setQr).catch(() => {});
      }
    });
  }, [id, invId]);

  if (!inv) return <p className="text-sm text-[color:var(--color-ink-soft)]">Loading…</p>;
  const seller = inv.clientId, buyer = inv.buyerId;

  return (
    <div>
      <div className="no-print mb-4 flex gap-3">
        <button className="btn btn-primary" onClick={() => window.print()}>Print / Save as PDF</button>
        <button className="btn btn-ghost" onClick={() => history.back()}>Back</button>
      </div>

      <div className="card p-8 max-w-3xl bg-white print:border-0 print:shadow-none" id="invoice-sheet">
        <div className="flex justify-between items-start border-b border-[color:var(--color-rule)] pb-5">
          <div>
            <h1 className="display text-2xl font-bold">{seller?.businessName}</h1>
            <p className="text-sm text-[color:var(--color-ink-soft)] mt-1">{seller?.address}{seller?.province ? `, ${seller.province}` : ""}</p>
            <p className="mono text-sm mt-1">NTN: {seller?.ntn || "—"}</p>
          </div>
          <div className="text-right">
            <p className="mono text-xs uppercase tracking-[0.14em] text-[color:var(--color-pine)]">Sales Tax Invoice</p>
            <p className="mono text-sm mt-2">№ {inv.invoiceRef}</p>
            <p className="mono text-sm">{inv.invoiceDate}</p>
          </div>
        </div>

        <div className="flex justify-between items-start mt-5 gap-6">
          <div>
            <p className="mono text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-soft)]">Buyer</p>
            <p className="font-medium mt-1">{buyer?.name}</p>
            <p className="text-sm text-[color:var(--color-ink-soft)]">{buyer?.address}{buyer?.province ? `, ${buyer.province}` : ""}</p>
            <p className="mono text-sm">{buyer?.registrationType === "registered" ? `NTN/CNIC: ${buyer?.ntnOrCnic || "—"}` : "Unregistered"}</p>
          </div>
          {inv.irn && (
            <div className="text-right shrink-0">
              {qr && <img src={qr} alt="FBR QR" className="w-32 h-32 ml-auto" />}
              <p className="mono text-[0.7rem] mt-1 break-all max-w-[160px]">FBR № {inv.irn}</p>
            </div>
          )}
        </div>

        <table className="w-full mt-6 text-sm">
          <thead>
            <tr className="border-b border-[color:var(--color-rule)] text-left mono text-xs uppercase tracking-[0.08em] text-[color:var(--color-ink-soft)]">
              <th className="py-2">HS code</th><th>Description</th><th className="text-right">Qty</th><th>UoM</th>
              <th className="text-right">Excl. tax</th><th className="text-right">ST</th><th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {inv.items.map((it, i) => (
              <tr key={i} className="border-b border-[color:var(--color-rule-soft)]">
                <td className="py-2 mono">{it.hsCode || "—"}</td>
                <td>{it.description}</td>
                <td className="text-right mono">{it.quantity}</td>
                <td>{it.uom}</td>
                <td className="text-right mono">{it.valueExclTax.toLocaleString("en-PK")}</td>
                <td className="text-right mono">{it.salesTax.toLocaleString("en-PK")}</td>
                <td className="text-right mono">{it.totalValue.toLocaleString("en-PK")}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mt-5">
          <div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-[color:var(--color-ink-soft)]">Value excl. tax</span><span className="mono">{formatPKR(inv.totals.valueExclTax)}</span></div>
            <div className="flex justify-between"><span className="text-[color:var(--color-ink-soft)]">Sales tax</span><span className="mono">{formatPKR(inv.totals.salesTax)}</span></div>
            <div className="flex justify-between border-t border-[color:var(--color-rule)] pt-1 font-semibold"><span>Total</span><span className="mono">{formatPKR(inv.totals.total)}</span></div>
          </div>
        </div>

        <p className="mono text-[0.62rem] text-[color:var(--color-ink-mute)] mt-8 border-t border-[color:var(--color-rule-soft)] pt-3">
          Generated by Muhasib. {inv.irn ? "Verify authenticity by scanning the QR with the FBR Tax Asaan app." : "Not yet transmitted to FBR."}
        </p>
      </div>
    </div>
  );
}
