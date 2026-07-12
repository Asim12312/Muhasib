"use client";
import { useEffect, useState, useCallback } from "react";
import { PageTitle } from "@/components/ui";
import { formatPKR } from "@/lib/penalty";

type Plan = { label: string; clientLimit: number; pricePkr: number; blurb: string };
type Data = {
  firm: { plan: { tier: string; status: string } };
  usage: { clients: number; clientLimit: number };
  plans: Record<string, Plan>;
};

export default function BillingPage() {
  const [data, setData] = useState<Data | null>(null);
  const [busy, setBusy] = useState("");

  const load = useCallback(() => fetch("/api/firm").then((r) => r.json()).then(setData), []);
  useEffect(() => { load(); }, [load]);

  async function switchTier(tier: string) {
    if (!confirm(`Switch to the ${tier} plan?`)) return;
    setBusy(tier);
    await fetch("/api/firm", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier }) });
    setBusy(""); load();
  }

  if (!data) return <p className="text-sm text-[color:var(--color-ink-soft)]">Loading…</p>;
  const current = data.firm.plan.tier;
  const pct = Math.min(100, Math.round((data.usage.clients / data.usage.clientLimit) * 100));
  const order = ["trial", "starter", "growth", "scale"];

  return (
    <div>
      <PageTitle kicker="Billing" title="Subscription & usage" sub="Plans are priced by how many clients your firm manages. Payment is arranged with our team — changing plan here updates your limit immediately." />

      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="mono text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-soft)]">Current plan</p>
            <p className="display text-2xl font-bold mt-1">{data.plans[current]?.label}</p>
          </div>
          <div className="text-right">
            <p className="mono text-2xl">{data.usage.clients}<span className="text-[color:var(--color-ink-soft)] text-base"> / {data.usage.clientLimit}</span></p>
            <p className="mono text-[0.66rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-soft)]">clients used</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[color:var(--color-rule-soft)] overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 90 ? "var(--color-stamp)" : "var(--color-leaf)" }} />
        </div>
        {pct >= 90 && <p className="text-sm text-[color:var(--color-stamp)] mt-2">You&apos;re near your client limit — upgrade to keep onboarding.</p>}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {order.map((tier) => {
          const p = data.plans[tier];
          const isCurrent = tier === current;
          return (
            <div key={tier} className={`card p-5 flex flex-col ${isCurrent ? "border-[color:var(--color-pine)] border-2" : ""}`}>
              <p className="display font-bold text-lg">{p.label}</p>
              <p className="mono text-xl mt-1">{p.pricePkr ? formatPKR(p.pricePkr) : "Free"}<span className="text-xs text-[color:var(--color-ink-soft)]">{p.pricePkr ? "/mo" : ""}</span></p>
              <p className="mono text-xs text-[color:var(--color-ink-soft)] mt-1">up to {p.clientLimit} clients</p>
              <p className="text-sm text-[color:var(--color-ink-soft)] mt-3 flex-1">{p.blurb}</p>
              {isCurrent
                ? <span className="stamp stamp-accepted mt-4 self-start">Current</span>
                : <button className="btn btn-ghost mt-4" disabled={busy === tier} onClick={() => switchTier(tier)}>{busy === tier ? "Switching…" : "Switch"}</button>}
            </div>
          );
        })}
      </div>
      <p className="text-xs text-[color:var(--color-ink-mute)] mt-6">
        Payment integration (RAAST / card) is arranged with our team for now — this screen manages your plan limit. Contact billing to set up recurring payment.
      </p>
    </div>
  );
}
