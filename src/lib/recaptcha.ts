/**
 * Server-side Google reCAPTCHA v2 verification. If RECAPTCHA_SECRET_KEY is
 * not set (dev), verification is skipped so local flows keep working.
 *
 * Env: NEXT_PUBLIC_RECAPTCHA_SITE_KEY (client) + RECAPTCHA_SECRET_KEY (server)
 */
export const recaptchaConfigured = () => !!process.env.RECAPTCHA_SECRET_KEY;

export async function verifyRecaptcha(token: string | undefined): Promise<boolean> {
  if (!recaptchaConfigured()) return true; // no key configured → skip in dev
  if (!token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: process.env.RECAPTCHA_SECRET_KEY!, response: token }),
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}
