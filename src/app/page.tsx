"use client";
import Link from "next/link";
import { useLang } from "@/lib/i18n/context";
import { LangToggle } from "@/components/LangToggle";
import { LandingSidebar } from "@/components/LandingSidebar";

const waves = [
  { sro: "SRO 69(I)/2025", who_en: "Corporate registered persons — first integration wave", who_ur: "کارپوریٹ رجسٹرڈ افراد — پہلی لہر", when: "2025" },
  { sro: "SRO 1413(I)/2025", who_en: "Extended deadlines and revised integration schedule", who_ur: "توسیع شدہ آخری تاریخیں اور نظر ثانی شدہ شیڈول", when: "2025" },
  { sro: "SRO 1852(I)/2025", who_en: "Final wave — remaining sales-tax registered persons", who_ur: "آخری لہر — باقی سیلز ٹیکس رجسٹرڈ افراد", when: "31 Dec 2025" },
  { sro: "STGO 01 of 2026", who_en: "72-hour edit/cancel window; multiple licensed integrators", who_ur: "72 گھنٹے کی ترمیم/منسوخی کی مہلت؛ کئی لائسنس یافتہ انٹیگریٹرز", when: "2026" },
];

export default function Home() {
  const { t, lang } = useLang();
  const isUr = lang === "ur";
  return (
    <div>
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <LandingSidebar />
          <span className="display font-bold text-lg sm:text-xl text-[color:var(--color-pine-deep)] truncate">
            {isUr ? "مُحاسِب" : "Mohasib"}
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-sm shrink-0">
          <LangToggle />
          <Link href="/login" className="btn btn-ghost !py-2 !px-3 sm:!px-4 !text-xs sm:!text-sm">{t("nav_signin")}</Link>
          <Link href="/register" className="btn btn-primary !py-2 !px-3 sm:!px-4 !text-xs sm:!text-sm">{t("nav_start")}</Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-16 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        <div className="min-w-0">
          <p className="kicker">{t("hero_kicker")}</p>
          <h1 className="display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] sm:leading-[1.05] text-[color:var(--color-ink)]">
            {t("hero_title_1")}
            <br />
            <span className="text-[color:var(--color-pine)]">{t("hero_title_2")}</span>
          </h1>
          <p className="mt-5 sm:mt-6 text-[color:var(--color-ink-soft)] max-w-lg text-base sm:text-lg leading-relaxed">
            {t("hero_body")}
          </p>
          <div className="mt-7 sm:mt-8 flex flex-wrap gap-3">
            <Link href="/register" className="btn btn-primary">{t("hero_cta")}</Link>
            <Link href="/tools/penalty-calculator" className="btn btn-ghost">{t("hero_cta_2")}</Link>
          </div>
          <p className="mono mt-5 text-xs sm:text-sm text-[color:var(--color-ink-mute)]">{t("hero_free_note")}</p>
        </div>

        <div className="relative min-w-0" dir="ltr">
          <div className="hidden sm:block absolute -top-8 -right-8 w-56 h-56 rounded-full bg-[color:var(--color-leaf)]/10 blur-3xl" aria-hidden />
          <div className="hidden sm:block absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-[color:var(--color-gold)]/10 blur-3xl" aria-hidden />
          <div className="card relative p-4 sm:p-6 shadow-sm overflow-hidden">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="mono text-xs uppercase tracking-[0.14em] text-[color:var(--color-ink-soft)]">Sales tax invoice</p>
                <p className="display font-bold text-base sm:text-lg mt-1 truncate">Karachi Traders (Pvt) Ltd</p>
                <p className="mono text-xs sm:text-sm text-[color:var(--color-ink-soft)]">NTN 0712345 · Sindh</p>
              </div>
              <span className="stamp stamp-accepted stamp-tilt shrink-0">Accepted</span>
            </div>
            <div className="mt-5 -mx-4 sm:mx-0 overflow-x-auto">
              <table className="ledger w-full min-w-[420px] sm:min-w-0">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th className="text-right">Excl. tax</th>
                    <th className="text-right">ST 18%</th>
                  </tr>
                </thead>
                <tbody className="mono">
                  <tr>
                    <td className="font-sans">Industrial fasteners (7318.15)</td>
                    <td className="text-right">184,000</td>
                    <td className="text-right">33,120</td>
                  </tr>
                  <tr>
                    <td className="font-sans">Galvanised wire (7217.20)</td>
                    <td className="text-right">96,500</td>
                    <td className="text-right">17,370</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-5 pt-4 border-t border-[color:var(--color-rule)] flex flex-wrap items-end justify-between gap-2">
              <div className="min-w-0">
                <p className="mono text-xs uppercase tracking-[0.12em] text-[color:var(--color-ink-soft)]">FBR invoice №</p>
                <p className="mono text-xs sm:text-sm text-[color:var(--color-pine)] font-medium mt-1 break-all">1767081600000482913657</p>
              </div>
              <p className="mono text-lg sm:text-xl font-medium shrink-0">PKR 330,990</p>
            </div>
          </div>
          <p className="mono text-xs text-[color:var(--color-ink-mute)] mt-3 text-center">
            Transmitted to PRAL · QR + 22-digit number returned in seconds
          </p>
        </div>
      </section>

      <section className="border-y border-[color:var(--color-rule)] bg-[color:var(--color-sheet)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="display text-2xl sm:text-3xl font-bold">{t("mandate_title")}</h2>
          <p className="text-[color:var(--color-ink-soft)] mt-3 max-w-2xl text-base sm:text-lg">{t("mandate_body")}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-[color:var(--color-rule)] mt-8 sm:mt-10 border border-[color:var(--color-rule)] rounded-lg overflow-hidden">
            {waves.map((w) => (
              <div key={w.sro} className="bg-[color:var(--color-sheet)] p-5 sm:p-6 min-w-0 transition-colors hover:bg-[color:var(--color-pine-tint)]">
                <p className="mono text-sm text-[color:var(--color-pine)] font-medium">{w.sro}</p>
                <p className="mt-3 leading-snug">{isUr ? w.who_ur : w.who_en}</p>
                <p className="mono text-xs uppercase tracking-[0.12em] text-[color:var(--color-ink-mute)] mt-4">{w.when}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid md:grid-cols-3 gap-8 sm:gap-10">
        {[
          { h: t("feature_1_h"), p: t("feature_1_p") },
          { h: t("feature_2_h"), p: t("feature_2_p") },
          { h: t("feature_3_h"), p: t("feature_3_p") },
        ].map((f, i) => (
          <div key={i} className="min-w-0 p-1 rounded-xl transition-transform duration-200 hover:-translate-y-1">
            <p className="mono text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold)] font-medium">0{i + 1}</p>
            <h3 className="display font-bold text-xl mt-2">{f.h}</h3>
            <p className="text-[color:var(--color-ink-soft)] mt-3 leading-relaxed">{f.p}</p>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="card p-5 sm:p-8 grid md:grid-cols-2 gap-6 sm:gap-8 items-center">
          <div className="min-w-0">
            <h2 className="display text-xl sm:text-2xl font-bold">{t("tools_title")}</h2>
            <p className="text-[color:var(--color-ink-soft)] mt-3 leading-relaxed">{t("tools_body")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
            <Link href="/tools/penalty-calculator" className="btn btn-primary">{t("nav_penalty")}</Link>
            <Link href="/tools/irn-validator" className="btn btn-ghost">{t("nav_irn")}</Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="display text-2xl sm:text-3xl font-bold mb-8 sm:mb-10">{t("pricing_title")}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: t("price_free"), price: "PKR 0", per: t("price_free_per"),
              items_en: ["5 invoices / month", "Sandbox + live transmission", "Penalty & format tools"],
              items_ur: ["5 انوائسز / مہینہ", "سینڈ باکس اور لائیو ٹرانسمیشن", "جرمانہ اور فارمیٹ ٹولز"] },
            { name: t("price_biz"), price: "PKR 4,500", per: t("price_biz_per"),
              items_en: ["Unlimited invoices", "Bulk Excel/CSV import", "Priority email support"],
              items_ur: ["لامحدود انوائسز", "ایکسل/سی ایس وی بلک اپلوڈ", "پرائم ای میل سپورٹ"], featured: true },
            { name: t("price_firm"), price: "PKR 2,000", per: t("price_firm_per"),
              items_en: ["Multi-client portal", "Everything in Business", "Onboarding help for your staff"],
              items_ur: ["ملٹی کلائنٹ پورٹل", "بزنس پلان کی تمام سہولیات", "آپ کے عملے کی رہنمائی"] },
          ].map((tier) => (
            <div key={tier.name} className={`card p-5 sm:p-6 min-w-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${tier.featured ? "border-[color:var(--color-pine)] border-2" : ""}`}>
              {tier.featured && (
                <p className="mono text-xs uppercase tracking-[0.14em] text-[color:var(--color-gold)] mb-2 font-medium">
                  {isUr ? "زیادہ مقبول" : "Most popular"}
                </p>
              )}
              <p className="mono text-sm uppercase tracking-[0.14em] text-[color:var(--color-pine)] font-medium">{tier.name}</p>
              <p className="display text-3xl sm:text-4xl font-extrabold mt-3 break-words">
                {tier.price}
                <span className="text-base font-medium text-[color:var(--color-ink-soft)]"> {tier.per}</span>
              </p>
              <ul className="mt-5 space-y-3">
                {(isUr ? tier.items_ur : tier.items_en).map((it) => (
                  <li key={it} className="flex gap-3 text-[color:var(--color-ink-soft)]">
                    <span className="text-[color:var(--color-leaf)] mono font-bold shrink-0">✓</span>
                    <span className="min-w-0">{it}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-[color:var(--color-rule)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <p className="mono text-sm text-[color:var(--color-ink-soft)]">{t("footer_line_1")}</p>
          <p className="text-xs text-[color:var(--color-ink-mute)] max-w-md">{t("footer_line_2")}</p>
        </div>
      </footer>
    </div>
  );
}
