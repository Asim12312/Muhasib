"use client";
import { useState } from "react";
import Papa from "papaparse";
import { PageTitle, ErrorNote } from "@/components/ui";
import { Button } from "@/components/Button";

const REQUIRED = ["businessName"];
const TEMPLATE =
  "businessName,ntn,strn,category,sector,province,salesTaxRegistered,contactName,contactPhone,contactEmail\n" +
  "Al-Karam Textiles,1234567,3277812,private_company,Textile,Punjab,yes,Imran Sheikh,03001234567,imran@alkaram.pk\n" +
  "Bismillah Traders,7654321,,individual,Retail,Sindh,yes,Fatima Noor,03111234567,\n";

export default function ClientImportPage() {
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  function onFile(file: File) {
    setError(""); setDone(""); setFileName(file.name);
    Papa.parse<Record<string, string>>(file, {
      header: true, skipEmptyLines: true,
      complete: (res) => {
        const headers = res.meta.fields || [];
        const missing = REQUIRED.filter((h) => !headers.includes(h));
        if (missing.length) { setError(`Missing columns: ${missing.join(", ")}. Download the template below.`); setRows([]); return; }
        setRows(res.data);
      },
      error: () => setError("Could not read that file — save it as CSV and try again."),
    });
  }

  async function run() {
    setError(""); setDone("");
    const res = await fetch("/api/clients/import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rows }) });
    const data = await res.json();
    if (res.ok) { setDone(`Onboarded ${data.created} client(s). Compliance calendars generated automatically.`); setRows([]); setFileName(""); }
    else setError(data.error || "Import failed.");
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "muhasib-clients-template.csv"; a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div>
      <PageTitle kicker="Bulk import" title="Onboard clients from CSV" sub="One row per SME. NTN, sector and contact details are optional but recommended. Each client's compliance calendar is generated on import." />
      <div className="card p-6 space-y-5">
        <div>
          <label className="label">CSV file</label>
          <input className="field" type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
        </div>
        <button className="mono text-xs text-[color:var(--color-pine)] underline underline-offset-2" onClick={downloadTemplate}>Download CSV template</button>
        {fileName && rows.length > 0 && <p className="text-sm"><span className="mono">{fileName}</span> — {rows.length} client(s) detected.</p>}
        <ErrorNote msg={error} />
        {done && <p className="text-sm text-[color:var(--color-pine)] font-medium">{done}</p>}
        <Button onClick={run} disabled={rows.length === 0} loadingText="Importing…">Import clients</Button>
      </div>
    </div>
  );
}
