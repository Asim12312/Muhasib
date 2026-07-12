"use client";
import { useEffect, useState } from "react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/** Sidebar "Install app" control. Uses the native install prompt where the
 *  browser offers one; falls back to iOS Add-to-Home-Screen guidance. */
export function InstallPwaButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) { setInstalled(true); return; }
    const onPrompt = (e: Event) => { e.preventDefault(); setDeferred(e as BIPEvent); };
    const onInstalled = () => setInstalled(true);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null;

  async function install() {
    if (deferred) {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setDeferred(null);
    } else {
      // iOS Safari has no beforeinstallprompt — guide the user.
      setShowIosHint((v) => !v);
    }
  }

  return (
    <div>
      <button onClick={install} className="side-link w-full text-left text-[color:var(--color-pine)]">
        <svg className="side-icon" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 18h16v3H4z"/></svg>
        <span>Install app</span>
      </button>
      {showIosHint && (
        <p className="text-xs text-[color:var(--color-ink-soft)] px-3 mt-1">On iPhone: tap the Share button, then “Add to Home Screen”.</p>
      )}
    </div>
  );
}
