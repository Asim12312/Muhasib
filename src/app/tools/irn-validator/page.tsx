"use client";
import { useState } from "react";
import Link from "next/link";
import { validateIrn } from "@/lib/irn";
import { useLang } from "@/lib/i18n/context";
import { LangToggle } from "@/components/LangToggle";

export default function IrnValidator() {
  const { t, lang } = useLang();
  const isUr = lang === "ur";
  const [value, setValue] = useState("");
  const check = value ? validateIrn(value) : null;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link href="/" className="mono text-sm text-[color:var(--color-pine)] hover:underline shrink-0">
          {isUr ? "← مُحاسِب" : "← Mohasib"}
        </Link>
        <LangToggle />
      </div>
      <h1 className="display text-2xl sm:text-3xl md:text-4xl font-extrabold">{t("irn_title")}</h1>
      <p className="text-[color:var(--color-ink-soft)] mt-4 max-w-2xl text-base leading-relaxed">
        {t("irn_intro")}
      </p>

      <div className="card p-5 sm:p-6 mt-8" dir="ltr">
        <label className="label" htmlFor="irn">{t("irn_label")}</label>
        <input id="irn" className="field mono text-base sm:text-lg" placeholder="e.g. 1767081600000482913657"
          value={value} onChange={(e) => setValue(e.target.value)} />
        {check && (
          <div className="mt-5">
            {check.ok ? (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <span className="stamp stamp-accepted self-start">{t("irn_ok")}</span>
                <p className="text-sm text-[color:var(--color-ink-soft)]">{t("irn_ok_hint")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <span className="stamp stamp-rejected">{t("irn_bad")}</span>
                <ul className="text-sm text-[color:var(--color-ink-soft)] list-disc pl-5 space-y-1">
                  {check.issues.map((i) => <li key={i}>{i}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-sm text-[color:var(--color-ink-soft)] mt-6 max-w-2xl leading-relaxed">
        {t("irn_note")}
      </p>

      <div className="card p-5 sm:p-6 mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <p className="text-base max-w-md">
          {isUr
            ? "مُحاسِب ہر ٹرانسمیشن کے بعد یہ نمبر خودکار طور پر واپس دیتا ہے۔"
            : "Mohasib returns this number automatically every time you transmit an invoice."}
        </p>
        <Link href="/register" className="btn btn-primary w-full sm:w-auto text-center">
          {isUr ? "مفت شروع کریں" : "Start free"}
        </Link>
      </div>
    </main>
  );
}
