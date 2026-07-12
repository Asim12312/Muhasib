"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ErrorNote } from "@/components/ui";
import { Button } from "@/components/Button";

function ResetForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit() {
    setError("");
    const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    if (res.ok) { setDone(true); setTimeout(() => router.push("/login"), 1500); }
    else setError((await res.json()).error || "Could not reset password.");
  }

  return (
    <div className="card p-6 sm:p-8 w-full max-w-sm">
      <Link href="/" className="display font-bold text-lg text-[color:var(--color-pine-deep)]">Muhasib</Link>
      <h1 className="display text-2xl font-bold mt-6">Choose a new password</h1>
      {!token ? (
        <p className="text-sm text-[color:var(--color-stamp)] mt-4">This reset link is missing its token. Request a new one from the <Link href="/forgot" className="underline">forgot password</Link> page.</p>
      ) : done ? (
        <p className="text-sm text-[color:var(--color-pine)] mt-4 font-medium">Password updated. Redirecting to sign in…</p>
      ) : (
        <div className="mt-6 space-y-4">
          <div><label className="label">New password (8+ characters)</label><input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} /></div>
          <ErrorNote msg={error} />
          <Button className="w-full" onClick={submit} disabled={password.length < 8} loadingText="Updating…">Update password</Button>
        </div>
      )}
    </div>
  );
}

export default function ResetPage() {
  return <main className="min-h-screen flex items-center justify-center px-4 py-12"><Suspense><ResetForm /></Suspense></main>;
}
