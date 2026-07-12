"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageTitle, ErrorNote } from "@/components/ui";

const provinces = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Islamabad Capital Territory", "Gilgit-Baltistan", "AJK"];

export default function NewClientPage() {
  const router = useRouter();
  const [f, setF] = useState({
    businessName: "", ntn: "", strn: "", category: "private_company", turnoverTier: "",
    sector: "", province: "Punjab", salesTaxRegistered: true, filingFrequency: "monthly",
    contact: { name: "", phone: "", email: "" },
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (patch: Partial<typeof f>) => setF({ ...f, ...patch });

  async function save() {
    setBusy(true); setError("");
    const res = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const data = await res.json();
    setBusy(false);
    if (res.ok) router.push(`/dashboard/clients/${data.client._id}`);
    else setError(data.error || "Could not add client.");
  }

  return (
    <div>
      <PageTitle kicker="New client" title="Onboard an SME" sub="Register the SME's identity and FBR filing profile. You can set up its FBR connection and buyers after saving." />
      <div className="card p-6 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="label">Registered business name</label>
          <input className="field" value={f.businessName} onChange={(e) => set({ businessName: e.target.value })} />
        </div>
        <div>
          <label className="label">NTN</label>
          <input className="field mono" value={f.ntn} onChange={(e) => set({ ntn: e.target.value })} />
        </div>
        <div>
          <label className="label">STRN</label>
          <input className="field mono" value={f.strn} onChange={(e) => set({ strn: e.target.value })} />
        </div>
        <div>
          <label className="label">Legal form</label>
          <select className="field" value={f.category} onChange={(e) => set({ category: e.target.value })}>
            <option value="private_company">Private company</option>
            <option value="public_company">Public company</option>
            <option value="individual">Individual</option>
            <option value="aop">AOP</option>
          </select>
        </div>
        <div>
          <label className="label">Turnover tier (optional)</label>
          <select className="field" value={f.turnoverTier} onChange={(e) => set({ turnoverTier: e.target.value })}>
            <option value="">—</option>
            <option value="tier1">Tier 1</option>
            <option value="tier2">Tier 2</option>
            <option value="tier3">Tier 3</option>
          </select>
        </div>
        <div>
          <label className="label">Sector</label>
          <input className="field" placeholder="e.g. Textile wholesale" value={f.sector} onChange={(e) => set({ sector: e.target.value })} />
        </div>
        <div>
          <label className="label">Province</label>
          <select className="field" value={f.province} onChange={(e) => set({ province: e.target.value })}>
            {provinces.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Filing frequency</label>
          <select className="field" value={f.filingFrequency} onChange={(e) => set({ filingFrequency: e.target.value })}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.salesTaxRegistered} onChange={(e) => set({ salesTaxRegistered: e.target.checked })} />
            Sales-tax registered
          </label>
        </div>
      </div>

      <div className="card p-6 mt-4 grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-3"><p className="kicker">Principal contact</p></div>
        <div><label className="label">Name</label><input className="field" value={f.contact.name} onChange={(e) => set({ contact: { ...f.contact, name: e.target.value } })} /></div>
        <div><label className="label">Phone</label><input className="field mono" value={f.contact.phone} onChange={(e) => set({ contact: { ...f.contact, phone: e.target.value } })} /></div>
        <div><label className="label">Email</label><input className="field" value={f.contact.email} onChange={(e) => set({ contact: { ...f.contact, email: e.target.value } })} /></div>
      </div>

      <div className="mt-5 flex items-center gap-4">
        <button className="btn btn-primary" onClick={save} disabled={busy || !f.businessName}>{busy ? "Saving…" : "Add client"}</button>
        <ErrorNote msg={error} />
      </div>
    </div>
  );
}
