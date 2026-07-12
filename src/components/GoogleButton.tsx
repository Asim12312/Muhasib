"use client";

export const GOOGLE_ENABLED = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/** "Continue with Google" — only renders when a client id is configured. */
export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  if (!GOOGLE_ENABLED) return null;
  return (
    <a
      href="/api/auth/google"
      className="btn btn-ghost w-full"
      role="button"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 12 2 2 12 2 24s10 22 22 22 22-10 22-22c0-1.5-.2-2.6-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 4.1 29.6 2 24 2 16.3 2 9.7 6.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 46c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 36.7 26.9 38 24 38c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 41.6 16.2 46 24 46z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.5 5.5C39.9 36.8 44 31 44 24c0-1.5-.2-2.6-.4-3.5z"/></svg>
      <span>{label}</span>
    </a>
  );
}
