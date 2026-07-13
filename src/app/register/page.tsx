"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ErrorNote } from "@/components/ui";
import { Button } from "@/components/Button";
import { useLang } from "@/lib/i18n/context";
import { LangToggle } from "@/components/LangToggle";
import { Recaptcha, RecaptchaHandle, RECAPTCHA_SITE_KEY } from "@/components/Recaptcha";
import { GoogleButton, GOOGLE_ENABLED } from "@/components/GoogleButton";

export default function RegisterPage() {
  const { t, lang } = useLang();
  const isUr = lang === "ur";
  const router = useRouter();
  const [firmName, setFirmName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [error, setError] = useState("");
  const captchaRef = useRef<RecaptchaHandle>(null);

  async function submit() {
    setError("");
    if (RECAPTCHA_SITE_KEY && !captcha) { setError("Please complete the “I'm not a robot” check."); return; }
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firmName, name, email, password, recaptchaToken: captcha }),
    });
    if (res.ok) { router.push("/dashboard"); return; }
    captchaRef.current?.reset();
    setError((await res.json()).error || "Registration failed.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card p-6 sm:p-8 w-full max-w-sm">
        <div className="flex items-center justify-between">
          <Link href="/" className="display font-bold text-lg text-[color:var(--color-pine-deep)]">{isUr ? "مُحاسِب" : "Muhasib"}</Link>
          <LangToggle />
        </div>
        <h1 className="display text-2xl font-bold mt-6">{isUr ? "اپنی فرم رجسٹر کریں" : "Create your firm account"}</h1>
        <p className="text-sm text-[color:var(--color-ink-soft)] mt-2">{isUr ? "کنسلٹنسی فرمز کے لیے۔ آپ پرنسپل ہوں گے اور بعد میں اسٹاف کو مدعو کر سکتے ہیں۔" : "For consultancy firms. You'll be the principal and can invite staff later."}</p>
        <div className="mt-6 space-y-4" dir="ltr">
          {GOOGLE_ENABLED && (
            <>
              <GoogleButton label="Sign up with Google" />
              <div className="flex items-center gap-3 text-xs text-[color:var(--color-ink-mute)]"><span className="h-px bg-[color:var(--color-rule)] flex-1" />OR<span className="h-px bg-[color:var(--color-rule)] flex-1" /></div>
            </>
          )}
          <div>
            <label className="label" htmlFor="firm">{isUr ? "فرم کا نام" : "Firm name"}</label>
            <input id="firm" className="field" value={firmName} onChange={(e) => setFirmName(e.target.value)} placeholder="e.g. Sheikh & Associates" />
          </div>
          <div>
            <label className="label" htmlFor="name">{t("auth_name")}</label>
            <input id="name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="email">{t("auth_email")}</label>
            <input id="email" className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="pw">{t("auth_password_new")}</label>
            <input id="pw" className="field" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} />
          </div>
          <Recaptcha ref={captchaRef} onToken={setCaptcha} />
          <ErrorNote msg={error} />
          <Button className="w-full" onClick={submit} disabled={!firmName || !name} loadingText={t("auth_creating")}>{t("auth_create_btn")}</Button>
          <p className="text-sm text-[color:var(--color-ink-soft)]">
            {t("auth_have_account")}{" "}
            <Link href="/login" className="text-[color:var(--color-pine)] font-semibold hover:underline">{t("auth_signin")}</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
