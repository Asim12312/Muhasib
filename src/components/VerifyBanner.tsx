"use client";
import { useState } from "react";
import { useMe } from "@/lib/useMe";

/** Soft email-verification banner: users can work, but see this until they
 *  verify (FBR transmission stays blocked server-side until they do). */
export function VerifyBanner() {
  const { user, refresh } = useMe();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (!user || user.emailVerified) return null;

  async function resend() {
    setSending(true);
    await fetch("/api/auth/verify", { method: "PUT" }).catch(() => {});
    setSending(false); setSent(true);
    refresh();
  }

  return (
    <div className="mb-5 rounded-lg border border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/8 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <p className="text-sm flex-1">
        <strong>Verify your email</strong> to transmit invoices to FBR. We sent a link to your inbox.
      </p>
      {sent ? (
        <span className="mono text-xs text-[color:var(--color-pine)]">Sent — check your inbox</span>
      ) : (
        <button onClick={resend} disabled={sending} className="btn btn-ghost !py-1.5 !px-3 text-xs shrink-0">
          {sending ? "Sending…" : "Resend link"}
        </button>
      )}
    </div>
  );
}
