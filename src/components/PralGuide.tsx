"use client";

/** In-app walkthrough for obtaining PRAL Digital Invoicing API credentials.
 *  Steps reflect the published FBR/PRAL onboarding path; verify against the
 *  current IRIS portal, as FBR changes the process periodically. */
export function PralGuide() {
  const steps = [
    ["Log in to IRIS", "Go to the FBR IRIS portal (iris.fbr.gov.pk) with the client's NTN credentials. The business must be sales-tax registered."],
    ["Open Digital Invoicing", "Under the registration / profile menu, find “Digital Invoicing” (or “License Integrator / Integration”) and start the registration for a Licensed Integrator or PCT-integrated person."],
    ["Get sandbox access first", "FBR issues sandbox (test) credentials — a bearer token and the sandbox endpoint. You must pass scenario / validation testing in sandbox before production."],
    ["Complete scenario testing", "Transmit the required test invoice scenarios. Once FBR marks them passed, request production credentials."],
    ["Receive production token", "FBR/PRAL issues the production API endpoint URL and a per-business bearer token. Put the endpoint URL in the field above, and paste each client's token on that client's Settings page."],
    ["Switch the client to Live", "On the client's Settings, change FBR connection from Sandbox to Live. Mohasib will then POST real invoices to PRAL and store the returned 22-digit number + QR."],
  ];
  return (
    <details className="rounded-lg border border-[color:var(--color-rule)] bg-[color:var(--color-rule-soft)]/40 p-4">
      <summary className="cursor-pointer font-medium text-sm text-[color:var(--color-pine)]">How do I get PRAL API credentials? (step by step)</summary>
      <ol className="mt-4 space-y-3">
        {steps.map(([h, p], i) => (
          <li key={i} className="flex gap-3">
            <span className="mono text-xs font-bold text-[color:var(--color-gold)] shrink-0 mt-0.5">{i + 1}</span>
            <div>
              <p className="font-medium text-sm">{h}</p>
              <p className="text-sm text-[color:var(--color-ink-soft)]">{p}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-xs text-[color:var(--color-ink-mute)] mt-4">
        Note: only FBR/PRAL can issue these credentials — Mohasib cannot generate them. Exact menu names shift with IRIS updates and SROs; confirm the current steps with FBR or your licensed integrator. This is guidance, not tax/legal advice.
      </p>
    </details>
  );
}
