---
name: muhasib-external-integration-gaps
description: Muhasib external integrations — what's wired and which env keys the user must supply to activate each
metadata:
  type: project
---

Muhasib (see [[muhasib-position1-architecture]]) has these integrations wired in code; each degrades gracefully to a dev fallback until its env keys are provided:

- **Email (Resend)** — `src/lib/email.ts`. Needs `RESEND_API_KEY` + `EMAIL_FROM` (+ `APP_URL` for link base). Without them, emails are logged to server console. Powers: email verification, password reset, staff invites.
- **Email verification** — soft gate: user logs in but sees a banner ([[VerifyBanner]]) and FBR transmit is blocked server-side (submit route returns 403) until `emailVerified`. Token model: `AuthToken` (type verify/reset).
- **Password reset** — `/forgot` + `/reset` pages, `/api/auth/forgot` + `/api/auth/reset`.
- **reCAPTCHA v2 checkbox** — `src/lib/recaptcha.ts` + `Recaptcha` component. Needs `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` + `RECAPTCHA_SECRET_KEY`. Skipped when unset. On login/register/forgot.
- **Google OAuth** — `/api/auth/google` + callback. Needs `NEXT_PUBLIC_GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`. First Google login auto-creates a firm (principal). Button hidden when unset. Redirect URI: `{APP_URL}/api/auth/google/callback`.
- **PRAL API** — endpoint URL now firm-configurable in Firm settings (`Firm.pralApiUrl`), overriding `PRAL_API_URL` env; per-client bearer token stays on each Client. `PralGuide` component gives in-app acquisition steps. Still only the sandbox mock is exercised; verify PRAL payload field names against the live spec before production.

Still real MVP stand-ins: billing has no payment gateway (tier switch just updates the client limit); deadline reminders are shown but not dispatched; documents stored inline in Mongo (8MB cap).

PWA: manifest + `public/sw.js` + install button ([[InstallPwaButton]]); SW registers only in production build.
