"use client";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type Client = { _id: string; businessName: string; ntn?: string; status?: string };

const RECENT_KEY = "mohasib_recent_clients";

export function pushRecentClient(c: { _id: string; businessName: string }) {
  if (typeof window === "undefined") return;
  try {
    const prev: Client[] = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const next = [c, ...prev.filter((p) => p._id !== c._id)].slice(0, 6);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

export function CommandSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [recent, setRecent] = useState<Client[]>([]);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch("/api/clients").then((r) => r.json()).then((d) => setClients(d.clients || [])).catch(() => {});
    try { setRecent(JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")); } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) { load(); setQ(""); setActive(0); setTimeout(() => inputRef.current?.focus(), 10); }
  }, [open, load]);

  const results = useMemo(() => {
    const base = q.trim()
      ? clients.filter((c) => c.businessName.toLowerCase().includes(q.toLowerCase()) || (c.ntn || "").includes(q))
      : (recent.length ? recent : clients);
    return base.slice(0, 8);
  }, [q, clients, recent]);

  function go(c: Client) {
    pushRecentClient({ _id: c._id, businessName: c.businessName });
    setOpen(false);
    router.push(`/dashboard/clients/${c._id}`);
  }

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-[color:var(--color-ink)]/30" onClick={() => setOpen(false)}>
      <div className="card w-full max-w-xl overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => { setQ(e.target.value); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, results.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter" && results[active]) go(results[active]);
          }}
          placeholder="Jump to a client…  (type a name or NTN)"
          className="w-full px-5 py-4 text-base outline-none border-b border-[color:var(--color-rule)] bg-transparent"
        />
        <ul className="max-h-80 overflow-y-auto">
          {!q.trim() && recent.length > 0 && (
            <li className="mono text-[0.62rem] uppercase tracking-[0.14em] text-[color:var(--color-ink-mute)] px-5 pt-3 pb-1">Recent</li>
          )}
          {results.map((c, i) => (
            <li key={c._id}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => go(c)}
                className={`w-full text-left px-5 py-3 flex items-center justify-between ${i === active ? "bg-[color:var(--color-pine-tint)]" : ""}`}
              >
                <span className="font-medium">{c.businessName}</span>
                {c.ntn ? <span className="mono text-xs text-[color:var(--color-ink-soft)]">{c.ntn}</span> : null}
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-5 py-6 text-sm text-[color:var(--color-ink-soft)] text-center">No matching clients.</li>
          )}
        </ul>
        <div className="px-5 py-2 border-t border-[color:var(--color-rule)] mono text-[0.62rem] uppercase tracking-[0.12em] text-[color:var(--color-ink-mute)]">
          ↑↓ navigate · ↵ open · esc close
        </div>
      </div>
    </div>
  );
}
