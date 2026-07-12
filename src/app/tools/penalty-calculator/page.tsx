"use client";
import { useState } from "react";
import Link from "next/link";
import { computePenalty, formatPKR, PENALTY_RULES } from "@/lib/penalty";
import { useLang } from "@/lib/i18n/context";
import { LangToggle } from "@/components/LangToggle";

export default function PenaltyCalculator() {
  const { t, lang } = useLang();
  const isUr = lang === "ur";
  const [tax, setTax] = useState("250000");
  const [days, setDays] = useState("0");
  const b = computePenalty({ taxInvolved: Number(tax) || 0, daysLate: Number(days) || 0 });

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="mono text-sm text-[color:var(--color-pine)] hover:underline">
          {isUr ? "← مُحاسِب" : "← Muhasib"}
        </Link>
        <LangToggle />
      </div>
      <h1 className="display text-3xl sm:text-4xl font-extrabold">{t("pen_title")}</h1>
      <p className="text-[color:var(--color-ink-soft)] mt-4 max-w-2xl text-base leading-relaxed">
        {t("pen_intro")}
      </p>

      <div className="card p-6 mt-8 grid sm:grid-cols-2 gap-6" dir="ltr">
        <div>
          <label className="label" htmlFor="tax">{t("pen_tax_label")}</label>
          <input id="tax" className="field mono" inputMode="numeric" value={tax}
            onChange={(e) => setTax(e.target.value.replace(/[^\d]/g, ""))} />
          <p className="text-sm text-[color:var(--color-ink-soft)] mt-2">{t("pen_tax_hint")}</p>
        </div>
        <div>
          <label className="label" htmlFor="days">{t("pen_days_label")}</label>
          <input id="days" className="field mono" inputMode="numeric" value={days}
            onChange={(e) => setDays(e.target.value.replace(/[^\d]/g, ""))} />
          <p className="text-sm text-[color:var(--color-ink-soft)] mt-2">{t("pen_days_hint")}</p>
        </div>
      </div>

      <div className="card p-6 mt-5">
        <table className="ledger w-full" dir="ltr">
          <tbody>
            <tr>
              <td>{t("pen_flat")}</td>
              <td className="mono text-right">{formatPKR(b.flatComponent)}</td>
            </tr>
            <tr>
              <td>{t("pen_pct")}</td>
              <td className="mono text-right">{formatPKR(b.pctComponent)}</td>
            </tr>
            <tr>
              <td className="font-semibold">{t("pen_issue")}</td>
              <td className="mono text-right font-semibold">{formatPKR(b.issuePenalty)}</td>
            </tr>
            <tr>
              <td>{t("pen_late")} ({days || 0} × {formatPKR(PENALTY_RULES.perDayLate)})</td>
              <td className="mono text-right">{formatPKR(b.latePenalty)}</td>
            </tr>
          </tbody>
        </table>
        <div className="flex items-center justify-between mt-5 pt-5 border-t border-[color:var(--color-rule)]">
          <span className="stamp stamp-rejected">{t("pen_exposure")}</span>
          <p className="mono text-3xl font-semibold text-[color:var(--color-stamp)]">{formatPKR(b.total)}</p>
        </div>
      </div>

      <div className="mt-6 text-sm text-[color:var(--color-ink-soft)] leading-relaxed max-w-2xl">
        <p><strong>{t("pen_disclaimer_h")}</strong> {t("pen_disclaimer")}</p>
      </div>

      <div className="card p-6 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-base max-w-md">
          {isUr
            ? "مُحاسِب ہر انوائس فوراً ایف بی آر کو بھیج دیتا ہے — تاکہ یہ رقم ہمیشہ صفر رہے۔"
            : "Muhasib transmits every invoice to FBR the moment you issue it — so this number stays at zero."}
        </p>
        <Link href="/register" className="btn btn-primary">
          {isUr ? "مفت شروع کریں — 5 انوائسز/مہینہ" : "Start free — 5 invoices/month"}
        </Link>
      </div>
    </main>
  );
}
