"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ErrorNote } from "@/components/ui";
import { Button } from "@/components/Button";

export default function AcceptInvite() {
  const { token } = useParams();
  const router = useRouter();
  const [info, setInfo] = useState<{ email: string; role: string; firmName: string } | null>(null);
  const [invalid, setInvalid] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/invite/${token}`).then((r) => r.json()).then((d) => {
      if (d.invite) setInfo(d.invite); else setInvalid(true);
    }).catch(() => setInvalid(true));
  }, [token]);

  async function submit() {
    setError("");
    const res = await fetch(`/api/invite/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, password }) });
    if (res.ok) { router.push("/dashboard"); return; }
    setError((await res.json()).error || "Could not accept invitation.");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="card p-8 w-full max-w-sm">
        <Link href="/" className="display font-bold text-lg text-[color:var(--color-pine-deep)]">Muhasib</Link>
        {invalid ? (
          <p className="text-sm text-[color:var(--color-stamp)] mt-6">This invitation is invalid or has expired. Ask your firm principal to send a new one.</p>
        ) : !info ? (
          <p className="text-sm text-[color:var(--color-ink-soft)] mt-6">Loading…</p>
        ) : (
          <>
            <h1 className="display text-2xl font-bold mt-6">Join {info.firmName}</h1>
            <p className="text-sm text-[color:var(--color-ink-soft)] mt-2">You&apos;ve been invited as <strong>{info.role}</strong> for <span className="mono">{info.email}</span>. Set your name and a password to continue.</p>
            <div className="mt-6 space-y-5">
              <div><label className="label">Your name</label><input className="field" value={name} onChange={(e) => setName(e.target.value)} /></div>
              <div><label className="label">Password (8+ characters)</label><input className="field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} /></div>
              <ErrorNote msg={error} />
              <Button className="w-full" onClick={submit} disabled={!name || !password} loadingText="Joining…">Join firm</Button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
