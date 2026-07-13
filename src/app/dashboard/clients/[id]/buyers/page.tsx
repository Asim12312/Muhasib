"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { ErrorNote, Empty } from "@/components/ui";
import { Button } from "@/components/Button";

type Buyer = { _id: string; name: string; ntnOrCnic: string; registrationType: string; address: string; province: string };
const provinces = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "AJK"];

export default function BuyersPage() {
  const { id } = useParams();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [form, setForm] = useState({ name: "", ntnOrCnic: "", registrationType: "registered", address: "", province: "Punjab" });
  const [error, setError] = useState("");

  const load = useCallback(() => fetch(`/api/clients/${id}/buyers`).then((r) => r.json()).then((d) => setBuyers(d.buyers || [])), [id]);
  useEffect(() => { load(); }, [load]);

  async function add() {
    setError("");
    const res = await fetch(`/api/clients/${id}/buyers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setForm({ name: "", ntnOrCnic: "", registrationType: "registered", address: "", province: "Punjab" }); load(); }
    else setError((await res.json()).error || "Could not add buyer.");
  }
  async function remove(bid: string) {
    if (!confirm("Remove this buyer?")) return;
    const res = await fetch(`/api/clients/${id}/buyers/${bid}`, { method: "DELETE" });
    if (!res.ok) setError((await res.json()).error || "Could not remove buyer.");
    load();
  }

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-1">Buyer directory</h1>
      <p className="text-[color:var(--color-ink-soft)] mb-6 text-sm">The customers this client invoices — registered or unregistered.</p>
      <div className="card p-6 grid sm:grid-cols-2 gap-4">
        <div><label className="label">Buyer name</label><input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><label className="label">NTN or CNIC</label><input className="field mono" value={form.ntnOrCnic} onChange={(e) => setForm({ ...form, ntnOrCnic: e.target.value })} /></div>
        <div>
          <label className="label">Registration type</label>
          <select className="field" value={form.registrationType} onChange={(e) => setForm({ ...form, registrationType: e.target.value })}>
            <option value="registered">Registered</option><option value="unregistered">Unregistered</option>
          </select>
        </div>
        <div>
          <label className="label">Province</label>
          <select className="field" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })}>{provinces.map((p) => <option key={p}>{p}</option>)}</select>
        </div>
        <div className="sm:col-span-2"><label className="label">Address</label><input className="field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
        <div className="sm:col-span-2 flex items-center gap-4"><Button onClick={add} disabled={!form.name} loadingText="Adding…">Add buyer</Button><ErrorNote msg={error} /></div>
      </div>

      <div className="card mt-6 overflow-x-auto">
        <table className="ledger w-full">
          <thead><tr><th>Name</th><th>NTN / CNIC</th><th>Type</th><th>Province</th><th></th></tr></thead>
          <tbody>
            {buyers.map((b) => (
              <tr key={b._id}>
                <td className="font-medium">{b.name}</td>
                <td className="mono">{b.ntnOrCnic || "—"}</td>
                <td className="capitalize">{b.registrationType}</td>
                <td>{b.province}</td>
                <td className="text-right"><Button variant="danger" className="!py-1 !px-3 text-xs" onClick={() => remove(b._id)} loadingText="Removing…">Remove</Button></td>
              </tr>
            ))}
            {buyers.length === 0 && <Empty colSpan={5}>No buyers yet — add the first one above.</Empty>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
