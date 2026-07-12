"use client";
import { useLang } from "@/lib/i18n/context";

export function LangToggle({ className = "" }: { className?: string }) {
  const { lang, setLang } = useLang();
  return (
    <button
      onClick={() => setLang(lang === "en" ? "ur" : "en")}
      className={`mono text-sm font-medium text-[color:var(--color-ink-soft)] hover:text-[color:var(--color-pine)] px-3 py-2 rounded-md border border-transparent hover:border-[color:var(--color-rule)] transition-colors ${className}`}
      aria-label={lang === "en" ? "Switch to Urdu" : "Switch to English"}
    >
      {lang === "en" ? (
        <span style={{ fontFamily: "var(--font-urdu)" }}>اردو</span>
      ) : (
        "English"
      )}
    </button>
  );
}
