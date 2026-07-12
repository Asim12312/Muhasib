/**
 * Email delivery via Resend (https://resend.com). If RESEND_API_KEY is not
 * set (e.g. local dev), emails are logged to the server console instead of
 * sent, so every flow still works end-to-end without a provider.
 *
 * Required env for real delivery:
 *   RESEND_API_KEY   — your Resend API key
 *   EMAIL_FROM       — verified sender, e.g. "Muhasib <noreply@yourdomain.pk>"
 *   APP_URL          — base URL for links, e.g. https://app.muhasib.pk
 */
export function appUrl(fallbackOrigin?: string): string {
  return process.env.APP_URL || fallbackOrigin || "http://localhost:3000";
}

export const emailConfigured = () => !!process.env.RESEND_API_KEY && !!process.env.EMAIL_FROM;

export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<{ ok: boolean; error?: string }> {
  if (!emailConfigured()) {
    console.log(`\n[email:dev] To: ${opts.to}\n[email:dev] Subject: ${opts.subject}\n[email:dev] (set RESEND_API_KEY + EMAIL_FROM to actually send)\n`);
    return { ok: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${await res.text()}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

function shell(title: string, body: string, cta?: { label: string; href: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f4f5f1;font-family:Arial,Helvetica,sans-serif;color:#14231c">
  <div style="max-width:520px;margin:0 auto;padding:32px 24px">
    <div style="font-size:22px;font-weight:700;color:#103d28;margin-bottom:24px">Muhasib</div>
    <div style="background:#fff;border:1px solid #d6ddd5;border-radius:12px;padding:28px">
      <h1 style="font-size:18px;margin:0 0 12px">${title}</h1>
      <div style="font-size:14px;line-height:1.6;color:#4b5c53">${body}</div>
      ${cta ? `<div style="margin-top:24px"><a href="${cta.href}" style="display:inline-block;background:#1a5c3d;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:600;font-size:14px">${cta.label}</a></div>
      <p style="font-size:12px;color:#7a8880;margin-top:16px;word-break:break-all">Or paste this link:<br>${cta.href}</p>` : ""}
    </div>
    <p style="font-size:11px;color:#7a8880;margin-top:20px">Muhasib · FBR digital invoicing · Lahore, Pakistan</p>
  </div></body></html>`;
}

export const templates = {
  verify: (link: string) =>
    shell("Verify your email", "Confirm your email address to unlock FBR transmission on your Muhasib account.", { label: "Verify email", href: link }),
  reset: (link: string) =>
    shell("Reset your password", "We received a request to reset your Muhasib password. This link expires in 1 hour. If you didn't ask for this, you can ignore this email.", { label: "Reset password", href: link }),
  invite: (firmName: string, role: string, link: string) =>
    shell(`Join ${firmName} on Muhasib`, `You've been invited as <strong>${role}</strong>. Set your name and password to get started. This invitation expires in 14 days.`, { label: "Accept invitation", href: link }),
};
