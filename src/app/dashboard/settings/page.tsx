"use client";
import { useEffect, useState } from "react";
import { PageTitle, ErrorNote, RoleBadge } from "@/components/ui";
import { Button } from "@/components/Button";
import { PralGuide } from "@/components/PralGuide";

export default function FirmSettings() {
  const [firm, setFirm] = useState({ name: "", billingEmail: "", phone: "", pralApiUrl: "" });
  const [me, setMe] = useState({ name: "", role: "", email: "" });
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((d) => {
      if (d.user) setMe(d.user);
      if (d.firm) setFirm({ name: d.firm.name || "", billingEmail: d.firm.billingEmail || "", phone: d.firm.phone || "", pralApiUrl: d.firm.pralApiUrl || "" });
    });
  }, []);

  async function saveFirm() {
    setSaved(""); setError("");
    const res = await fetch("/api/firm", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(firm) });
    if (res.ok) setSaved("firm"); else setError((await res.json()).error || "Could not save.");
  }
  async function saveMe() {
    setSaved(""); setError("");
    const res = await fetch("/api/auth/me", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: me.name }) });
    if (res.ok) setSaved("me"); else setError("Could not save.");
  }

  const isPrincipal = me.role === "principal";
  return (
    <div>
      <PageTitle kicker="Settings" title="Firm & your profile" sub="Your firm's details, FBR/PRAL connection, and your own account. Each client's seller profile lives under that client's Settings." />

      <div className="card p-6 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 flex items-center gap-2"><p className="kicker !mb-0">Firm</p>{!isPrincipal && <RoleBadge role="read-only for your role" />}</div>
        <div><label className="label">Firm name</label><input className="field" disabled={!isPrincipal} value={firm.name} onChange={(e) => setFirm({ ...firm, name: e.target.value })} /></div>
        <div><label className="label">Billing email</label><input className="field" disabled={!isPrincipal} value={firm.billingEmail} onChange={(e) => setFirm({ ...firm, billingEmail: e.target.value })} /></div>
        <div><label className="label">Phone</label><input className="field mono" disabled={!isPrincipal} value={firm.phone} onChange={(e) => setFirm({ ...firm, phone: e.target.value })} /></div>
      </div>

      {/* PRAL / FBR connection */}
      <div className="card p-6 mt-4">
        <p className="kicker">FBR · PRAL Digital Invoicing API</p>
        <p className="text-sm text-[color:var(--color-ink-soft)] mb-4">Set your licensed integrator&apos;s API endpoint here once. Each client&apos;s own bearer token is set on their Settings page. Leave blank to use the built-in sandbox simulator for every client.</p>
        <label className="label">PRAL API endpoint URL</label>
        <input className="field mono" disabled={!isPrincipal} placeholder="https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata"
          value={firm.pralApiUrl} onChange={(e) => setFirm({ ...firm, pralApiUrl: e.target.value })} />
        <p className="text-xs text-[color:var(--color-ink-soft)] mt-2">This can also be set via the <span className="mono">PRAL_API_URL</span> environment variable; the value here overrides it.</p>
        <div className="mt-4"><PralGuide /></div>
      </div>

      {isPrincipal && (
        <div className="mt-5 flex items-center gap-4">
          <Button onClick={saveFirm}>Save firm settings</Button>
          {saved === "firm" && <span className="stamp stamp-accepted">Saved</span>}
        </div>
      )}

      <div className="card p-6 mt-6 grid sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 flex items-center gap-2"><p className="kicker !mb-0">You</p><RoleBadge role={me.role} /></div>
        <div><label className="label">Your name</label><input className="field" value={me.name} onChange={(e) => setMe({ ...me, name: e.target.value })} /></div>
        <div><label className="label">Email</label><input className="field mono" value={me.email} disabled /></div>
        <div className="sm:col-span-2 flex items-center gap-4"><Button onClick={saveMe}>Save profile</Button>{saved === "me" && <span className="stamp stamp-accepted">Saved</span>}</div>
      </div>
      <div className="mt-3"><ErrorNote msg={error} /></div>
    </div>
  );
}
