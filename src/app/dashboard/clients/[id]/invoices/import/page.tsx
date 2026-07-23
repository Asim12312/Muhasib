"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Papa from "papaparse";
import { ErrorNote } from "@/components/ui";
import { Button } from "@/components/Button";

type Buyer = { _id: string; name: string };
const REQUIRED = ["invoiceRef", "invoiceDate", "description", "quantity", "rate"];
const TEMPLATE =
  "invoiceRef,invoiceDate,hsCode,description,quantity,uom,rate,taxRate\n" +
  "INV-001,2026-07-01,7318.15,Industrial fasteners,100,PCS,1840,18\n" +
  "INV-001,2026-07-01,7217.20,Galvanised wire,50,KG,1930,18\n" +
  "INV-002,2026-07-02,,Transport services,1,JOB,25000,15\n";

export default function ClientInvoiceImport() {
  const { id } = useParams();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [buyerId, setBuyerId] = useState("");
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    fetch(`/api/clients/${id}/buyers`).then((r) => r.json()).then((d) => {
      setBuyers(d.buyers || []);
      if (d.buyers?.[0]) setBuyerId(d.buyers[0]._id);
    });
  }, [id]);

  function onFile(file: File) {
    setError(""); setDone(""); setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        const missing = REQUIRED.filter((h) => !(res.meta.fields || []).includes(h));
        if (missing.length) { setError(`Missing columns: ${missing.join(", ")}. Download the template below.`); setRows([]); return; }
        setRows(res.data);
      },
      error: () => setError("Could not read that file — save it as CSV and try again."),
    });
  }

  async function run() {
    setError(""); setDone("");
    const res = await fetch(`/api/clients/${id}/invoices/import`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ buyerId, rows }),
    });
    const data = await res.json();
    if (res.ok) { setDone(`Imported ${data.created} draft invoice(s). Review and transmit from the register.`); setRows([]); setFileName(""); }
    else setError(data.error || "Import failed.");
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "mohasib-invoices-template.csv"; a.click(); URL.revokeObjectURL(a.href);
  }

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-1">Import a sales register</h1>
      <p className="text-[color:var(--color-ink-soft)] mb-6 text-sm">One CSV row per line item. Rows sharing an invoiceRef become one invoice. Everything imports as drafts.</p>
      {buyers.length === 0 ? (
        <div className="card p-6 text-sm">Add a buyer first. <Link href={`/dashboard/clients/${id}/buyers`} className="text-[color:var(--color-pine)] font-medium">Go to Buyers →</Link></div>
      ) : (
        <div className="card p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">These invoices are for buyer</label>
              <select className="field" value={buyerId} onChange={(e) => setBuyerId(e.target.value)}>
                {buyers.map((b) => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">CSV file</label>
              <input className="field" type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            </div>
          </div>
          <button className="mono text-xs text-[color:var(--color-pine)] underline underline-offset-2" onClick={downloadTemplate}>Download CSV template</button>
          {fileName && rows.length > 0 && <p className="text-sm"><span className="mono">{fileName}</span> — {rows.length} row(s), {new Set(rows.map((r) => r.invoiceRef)).size} invoice(s).</p>}
          <ErrorNote msg={error} />
          {done && <p className="text-sm text-[color:var(--color-pine)] font-medium">{done}</p>}
          <Button onClick={run} disabled={rows.length === 0 || !buyerId} loadingText="Importing…">Import as drafts</Button>
        </div>
      )}
    </div>
  );
}
