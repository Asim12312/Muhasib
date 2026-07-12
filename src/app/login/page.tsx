"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ErrorNote } from "@/components/ui";
import { useLang } from "@/lib/i18n/context";
import { LangToggle } from "@/components/LangToggle";

function LoginForm() {
  const { t, lang } = useLang();
  const isUr = lang === "ur";
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true); setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setBusy(false);
    if (res.ok) router.push(params.get("next") || "/dashboard");
    else setError((await res.json()).error || "Sign-in failed.");
  }

  return (
    <div className="card p-8 w-full max-w-sm">
      <div className="flex items-center justify-between">
        <Link href="/" className="display font-bold text-lg text-[color:var(--color-pine-deep)]">
          {isUr ? "مُحاسِب" : "Muhasib"}
        </Link>
        <LangToggle />
      </div>
      <h1 className="display text-2xl font-bold mt-6">{t("auth_signin")}</h1>
      <div className="mt-6 space-y-5" dir="ltr">
        <div>
          <label className="label" htmlFor="email">{t("auth_email")}</label>
          <input id="email" className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="pw">{t("auth_password")}</label>
          <input id="pw" className="field" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>
        <ErrorNote msg={error} />
        <button className="btn btn-primary w-full" onClick={submit} disabled={busy}>
          {busy ? t("auth_signing_in") : t("auth_signin")}
        </button>
        <p className="text-sm text-[color:var(--color-ink-soft)]">
          {t("auth_signup_hint")}{" "}
          <Link href="/register" className="text-[color:var(--color-pine)] font-semibold hover:underline">
            {t("auth_signup_link")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <Suspense><LoginForm /></Suspense>
    </main>
  );
}
