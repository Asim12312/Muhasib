"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { ErrorNote } from "@/components/ui";
import { Button } from "@/components/Button";
import { Recaptcha, RecaptchaHandle, RECAPTCHA_SITE_KEY } from "@/components/Recaptcha";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const captchaRef = useRef<RecaptchaHandle>(null);

  async function submit() {
    setError("");
    if (RECAPTCHA_SITE_KEY && !captcha) { setError("Please complete the “I'm not a robot” check."); return; }
    const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, recaptchaToken: captcha }) });
    if (res.ok) { setDone(true); return; }
    captchaRef.current?.reset();
    setError((await res.json()).error || "Something went wrong.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="card p-6 sm:p-8 w-full max-w-sm">
        <Link href="/" className="display font-bold text-lg text-[color:var(--color-pine-deep)]">Mohasib</Link>
        <h1 className="display text-2xl font-bold mt-6">Reset your password</h1>
        {done ? (
          <p className="text-sm text-[color:var(--color-ink-soft)] mt-4">If an account exists for <span className="mono">{email}</span>, we&apos;ve sent a reset link. Check your inbox (and spam). The link expires in 1 hour.</p>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-[color:var(--color-ink-soft)]">Enter your email and we&apos;ll send a reset link.</p>
            <div><label className="label">Email</label><input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} /></div>
            <Recaptcha ref={captchaRef} onToken={setCaptcha} />
            <ErrorNote msg={error} />
            <Button className="w-full" onClick={submit} disabled={!email} loadingText="Sending…">Send reset link</Button>
            <p className="text-sm text-[color:var(--color-ink-soft)]"><Link href="/login" className="text-[color:var(--color-pine)] font-semibold hover:underline">Back to sign in</Link></p>
          </div>
        )}
      </div>
    </main>
  );
}
