"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ErrorNote } from "@/components/ui";
import { Button } from "@/components/Button";
import { PralGuide } from "@/components/PralGuide";
import { useMe } from "@/lib/useMe";

const provinces = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "AJK"];
const STATUSES: [string, string][] = [["onboarding", "Onboarding"], ["active", "Active"], ["pending_docs", "Pending docs"], ["at_risk", "At risk"], ["dormant", "Dormant"]];

export default function ClientSettings() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useMe();
  const isPrincipal = user?.role === "principal";
  const [c, setC] = useState<Record<string, unknown> | null>(null);
  const [staff, setStaff] = useState<{ _id: string; name: string }[]>([]);
  const [assigned, setAssigned] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/clients/${id}`).then((r) => r.json()).then((d) => {
      if (d.client) { setC(d.client); setAssigned((d.client.assignedTo || []).map((a: { _id: string }) => a._id)); }
    });
  }, [id]);

  useEffect(() => {
    if (isPrincipal) fetch("/api/firm/staff").then((r) => r.json()).then((sd) => setStaff(sd.staff || []));
  }, [isPrincipal]);

  const set = (patch: Record<string, unknown>) => setC((p) => ({ ...(p || {}), ...patch }));

  async function save() {
    setSaved(false); setError("");
    const body = { ...c, ...(isPrincipal ? { assignedTo: assigned } : {}) };
    const res = await fetch(`/api/clients/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) setSaved(true); else setError((await res.json()).error || "Could not save.");
  }
  async function del() {
    if (!confirm("Delete this client and all its drafts/buyers? Accepted invoices block deletion.")) return;
    const res = await fetch(`/api/clients/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard/clients"); else setError((await res.json()).error || "Could not delete.");
  }

  if (!c) return <p className="text-sm text-[color:var(--color-ink-soft)]">Loading…</p>;
  const g = (k: string) => (c[k] as string) || "";

  return (
    <div>
      <h1 className="display text-2xl font-bold mb-6">Client profile & FBR connection</h1>

      <div className="card p-6 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2"><label className="label">Business name</label><input className="field" value={g("businessName")} onChange={(e) => set({ businessName: e.target.value })} /></div>
        <div><label className="label">NTN</label><input className="field mono" value={g("ntn")} onChange={(e) => set({ ntn: e.target.value })} /></div>
        <div><label className="label">STRN</label><input className="field mono" value={g("strn")} onChange={(e) => set({ strn: e.target.value })} /></div>
        <div className="sm:col-span-2"><label className="label">Registered address</label><input className="field" value={g("address")} onChange={(e) => set({ address: e.target.value })} /></div>
        <div>
          <label className="label">Province</label>
          <select className="field" value={g("province")} onChange={(e) => set({ province: e.target.value })}>{provinces.map((p) => <option key={p}>{p}</option>)}</select>
        </div>
        <div>
          <label className="label">Workflow status</label>
          <select className="field" value={g("status")} onChange={(e) => set({ status: e.target.value })}>{STATUSES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </div>
      </div>

      <div className="card p-6 mt-4 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="label">FBR connection</label>
          <select className="field" value={g("fbrMode")} onChange={(e) => set({ fbrMode: e.target.value })}>
            <option value="sandbox">Sandbox (built-in simulator)</option>
            <option value="pral">Live — PRAL Digital Invoicing API</option>
          </select>
          <p className="text-xs text-[color:var(--color-ink-soft)] mt-2">Switch to live once this client has PRAL credentials and has passed scenario testing.</p>
        </div>
        <div>
          <label className="label">PRAL API bearer token</label>
          <input className="field mono" type="password" value={g("fbrToken")} placeholder="Required for live mode" onChange={(e) => set({ fbrToken: e.target.value })} />
          <p className="text-xs text-[color:var(--color-ink-soft)] mt-2">Stored against this client. The API endpoint URL is set once for the whole firm under Firm settings.</p>
        </div>
        {g("fbrMode") === "pral" && !g("fbrToken") && (
          <div className="sm:col-span-2 text-sm text-[color:var(--color-stamp)]">⚠️ Live mode selected but no bearer token set — transmissions will fail until you paste this client&apos;s PRAL token above.</div>
        )}
        <div className="sm:col-span-2"><PralGuide /></div>
      </div>

      {isPrincipal && (
        <div className="card p-6 mt-4">
          <label className="label">Assigned staff</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {staff.map((s) => (
              <label key={s._id} className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={assigned.includes(s._id)}
                  onChange={(e) => setAssigned((a) => e.target.checked ? [...a, s._id] : a.filter((x) => x !== s._id))} />
                {s.name}
              </label>
            ))}
            {staff.length === 0 && <p className="text-sm text-[color:var(--color-ink-soft)]">No staff yet.</p>}
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Button onClick={save}>Save changes</Button>
        {saved && <span className="stamp stamp-accepted">Saved</span>}
        <Button variant="danger" className="ml-auto" onClick={del}>Delete client</Button>
      </div>
      <div className="mt-3"><ErrorNote msg={error} /></div>
    </div>
  );
}
