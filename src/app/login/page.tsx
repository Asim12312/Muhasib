"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ErrorNote } from "@/components/ui";
import { Button } from "@/components/Button";
import { useLang } from "@/lib/i18n/context";
import { LangToggle } from "@/components/LangToggle";
import { Recaptcha, RECAPTCHA_SITE_KEY } from "@/components/Recaptcha";
import { GoogleButton, GOOGLE_ENABLED } from "@/components/GoogleButton";

function LoginForm() {
  const { t, lang } = useLang();
  const isUr = lang === "ur";
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [error, setError] = useState(params.get("error") || "");

  async function submit() {
    setError("");
    if (RECAPTCHA_SITE_KEY && !captcha) { setError("Please complete the “I'm not a robot” check."); return; }
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, recaptchaToken: captcha }),
    });
    if (res.ok) router.push(params.get("next") || "/dashboard");
    else setError((await res.json()).error || "Sign-in failed.");
  }

  return (
    <div className="card p-6 sm:p-8 w-full max-w-sm">
      <div className="flex items-center justify-between">
        <Link href="/" className="display font-bold text-lg text-[color:var(--color-pine-deep)]">{isUr ? "مُحاسِب" : "Muhasib"}</Link>
        <LangToggle />
      </div>
      <h1 className="display text-2xl font-bold mt-6">{t("auth_signin")}</h1>
      <div className="mt-6 space-y-4" dir="ltr">
        {GOOGLE_ENABLED && (
          <>
            <GoogleButton label="Sign in with Google" />
            <div className="flex items-center gap-3 text-xs text-[color:var(--color-ink-mute)]"><span className="h-px bg-[color:var(--color-rule)] flex-1" />OR<span className="h-px bg-[color:var(--color-rule)] flex-1" /></div>
          </>
        )}
        <div>
          <label className="label" htmlFor="email">{t("auth_email")}</label>
          <input id="email" className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="label !mb-0" htmlFor="pw">{t("auth_password")}</label>
            <Link href="/forgot" className="mono text-xs text-[color:var(--color-pine)] hover:underline">Forgot?</Link>
          </div>
          <input id="pw" className="field mt-2" type="password" value={password}
            onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>
        <Recaptcha onToken={setCaptcha} />
        <ErrorNote msg={error} />
        <Button className="w-full" onClick={submit} loadingText={t("auth_signing_in")}>{t("auth_signin")}</Button>
        <p className="text-sm text-[color:var(--color-ink-soft)]">
          {t("auth_signup_hint")}{" "}
          <Link href="/register" className="text-[color:var(--color-pine)] font-semibold hover:underline">{t("auth_signup_link")}</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <Suspense><LoginForm /></Suspense>
    </main>
  );
}
