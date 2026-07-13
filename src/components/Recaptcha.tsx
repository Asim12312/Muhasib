"use client";
import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

type Grecaptcha = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => number;
  reset: (id?: number) => void;
};
declare global {
  interface Window { grecaptcha?: Grecaptcha }
}

export interface RecaptchaHandle {
  /** Uncheck the widget and force the user to re-verify. Call this after
   *  any failed submit — a v2 token is single-use, so the old (consumed)
   *  token must not be resent even though the box still looks ticked. */
  reset: () => void;
}

let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    s.async = true; s.defer = true;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/** Google reCAPTCHA v2 "I'm not a robot" checkbox. Renders nothing when no
 *  site key is configured (dev) — callers should treat that as passable. */
export const Recaptcha = forwardRef<RecaptchaHandle, { onToken: (t: string | null) => void }>(function Recaptcha({ onToken }, ref) {
  const elRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetId.current !== null && window.grecaptcha?.reset) {
        window.grecaptcha.reset(widgetId.current);
      }
      cb.current(null);
    },
  }), []);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    let cancelled = false;
    loadScript().then(() => {
      const render = () => {
        if (cancelled) return;
        if (window.grecaptcha?.render && elRef.current && widgetId.current === null) {
          widgetId.current = window.grecaptcha.render(elRef.current, {
            sitekey: RECAPTCHA_SITE_KEY,
            callback: (t: string) => cb.current(t),
            "expired-callback": () => cb.current(null),
            "error-callback": () => cb.current(null),
          });
        } else if (widgetId.current === null) {
          setTimeout(render, 150);
        }
      };
      render();
    });
    return () => { cancelled = true; };
  }, []);

  if (!RECAPTCHA_SITE_KEY) return null;
  return <div ref={elRef} className="my-1" />;
});
