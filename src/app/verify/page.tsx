"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyInner() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [state, setState] = useState<"working" | "ok" | "bad">("working");

  useEffect(() => {
    if (!token) { setState("bad"); return; }
    fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) })
      .then((r) => setState(r.ok ? "ok" : "bad")).catch(() => setState("bad"));
  }, [token]);

  return (
    <div className="card p-6 sm:p-8 w-full max-w-sm text-center">
      <Link href="/" className="display font-bold text-lg text-[color:var(--color-pine-deep)]">Muhasib</Link>
      {state === "working" && <p className="text-sm text-[color:var(--color-ink-soft)] mt-6">Verifying your email…</p>}
      {state === "ok" && (
        <>
          <p className="display text-2xl font-bold mt-6 text-[color:var(--color-pine)]">Email verified ✓</p>
          <p className="text-sm text-[color:var(--color-ink-soft)] mt-2">You can now transmit invoices to FBR.</p>
          <Link href="/dashboard" className="btn btn-primary mt-6 inline-flex">Go to dashboard</Link>
        </>
      )}
      {state === "bad" && (
        <>
          <p className="display text-2xl font-bold mt-6 text-[color:var(--color-stamp)]">Link invalid or expired</p>
          <p className="text-sm text-[color:var(--color-ink-soft)] mt-2">Sign in and use the “resend verification” link in the banner.</p>
          <Link href="/dashboard" className="btn btn-ghost mt-6 inline-flex">Go to dashboard</Link>
        </>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return <main className="min-h-screen flex items-center justify-center px-4 py-12"><Suspense><VerifyInner /></Suspense></main>;
}
