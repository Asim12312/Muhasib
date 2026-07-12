"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ErrorNote, Empty } from "@/components/ui";

type Doc = { _id: string; name: string; docType: string; year: string; size: number; createdAt: string };
const DOC_TYPES: [string, string][] = [
  ["ntn_cert", "NTN certificate"], ["strn_cert", "STRN certificate"], ["cnic", "CNIC"],
  ["bank_letter", "Bank letter"], ["prior_return", "Prior return"], ["notice", "FBR notice"], ["other", "Other"],
];
const LABEL = Object.fromEntries(DOC_TYPES);

function fmtSize(n: number) { return n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.ceil(n / 1024)} KB`; }

export default function DocumentsPage() {
  const { id } = useParams();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [docType, setDocType] = useState("other");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => fetch(`/api/clients/${id}/documents`).then((r) => r.json()).then((d) => setDocs(d.documents || [])), [id]);
  useEffect(() => { load(); }, [load]);

  async function upload(file: File) {
    setBusy(true); setError("");
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await fetch(`/api/clients/${id}/documents`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, docType, year, mimeType: file.type, dataBase64: reader.result }),
      });
      setBusy(false);
      if (res.ok) { setYear(""); load(); } else setError((await res.json()).error || "Upload failed.");
    };
    reader.onerror = () => { setBusy(false); setError("Could not read the file."); };
    reader.readAsDataURL(file);
  }
  async function remove(docId: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/clients/${id}/documents/${docId}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-1">Document vault</h1>
      <p className="text-[color:var(--color-ink-soft)] mb-6 text-sm">NTN/STRN certificates, CNICs, bank letters, prior returns and FBR notices. Retain records for 6 years per FBR rules. Max 8 MB per file.</p>

      <div className="card p-6 grid sm:grid-cols-[1fr_auto_auto] gap-4 items-end">
        <div>
          <label className="label">Type</label>
          <select className="field" value={docType} onChange={(e) => setDocType(e.target.value)}>{DOC_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </div>
        <div><label className="label">Year</label><input className="field mono w-28" placeholder="2026" value={year} onChange={(e) => setYear(e.target.value)} /></div>
        <div>
          <label className="label">File</label>
          <input className="field" type="file" disabled={busy} onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </div>
      </div>
      <div className="mt-3"><ErrorNote msg={error} />{busy && <p className="text-sm text-[color:var(--color-ink-soft)]">Uploading…</p>}</div>

      <div className="card mt-4 overflow-x-auto">
        <table className="ledger w-full">
          <thead><tr><th>Name</th><th>Type</th><th>Year</th><th>Size</th><th>Uploaded</th><th></th></tr></thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d._id}>
                <td className="font-medium"><a href={`/api/clients/${id}/documents/${d._id}`} target="_blank" rel="noopener" className="hover:text-[color:var(--color-pine)]">{d.name}</a></td>
                <td className="text-sm">{LABEL[d.docType] || d.docType}</td>
                <td className="mono text-sm">{d.year || "—"}</td>
                <td className="mono text-sm">{fmtSize(d.size)}</td>
                <td className="mono text-xs">{new Date(d.createdAt).toLocaleDateString("en-PK")}</td>
                <td className="text-right"><button className="btn btn-danger !py-1 !px-3 text-xs" onClick={() => remove(d._id)}>Delete</button></td>
              </tr>
            ))}
            {docs.length === 0 && <Empty colSpan={6}>No documents yet — upload the client&apos;s NTN certificate to start.</Empty>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
