"use client";
import { useEffect, useRef } from "react";

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

type Grecaptcha = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => number;
  reset: (id?: number) => void;
};
declare global {
  interface Window { grecaptcha?: Grecaptcha }
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
export function Recaptcha({ onToken }: { onToken: (t: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) return;
    let cancelled = false;
    loadScript().then(() => {
      const render = () => {
        if (cancelled) return;
        if (window.grecaptcha?.render && ref.current && widgetId.current === null) {
          widgetId.current = window.grecaptcha.render(ref.current, {
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
  return <div ref={ref} className="my-1" />;
}
