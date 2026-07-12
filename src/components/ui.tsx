export function Stamp({ status }: { status: "draft" | "accepted" | "rejected" }) {
  const label = status === "accepted" ? "Accepted" : status === "rejected" ? "Rejected" : "Draft";
  return <span className={`stamp stamp-${status}`}>{label}</span>;
}

export function ErrorNote({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <p className="mono text-sm text-[color:var(--color-stamp)] border border-[color:var(--color-stamp)]/30 bg-[color:var(--color-stamp)]/5 rounded-md px-4 py-3">
      {msg}
    </p>
  );
}

export function PageTitle({ kicker, title, sub, action }: { kicker: string; title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="min-w-0">
        <p className="kicker">{kicker}</p>
        <h1 className="display text-2xl sm:text-3xl font-bold text-[color:var(--color-ink)] break-words">{title}</h1>
        {sub ? <p className="text-[color:var(--color-ink-soft)] mt-2 max-w-2xl text-sm sm:text-base">{sub}</p> : null}
      </div>
      {action ? <div className="sm:shrink-0">{action}</div> : null}
    </header>
  );
}

const CLIENT_STATUS: Record<string, { label: string; cls: string }> = {
  onboarding:   { label: "Onboarding",   cls: "text-[color:var(--color-gold)] border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/8" },
  active:       { label: "Active",       cls: "stamp-accepted" },
  pending_docs: { label: "Pending docs", cls: "text-[color:var(--color-gold)] border-[color:var(--color-gold)] bg-[color:var(--color-gold)]/8" },
  at_risk:      { label: "At risk",      cls: "stamp-rejected" },
  dormant:      { label: "Dormant",      cls: "stamp-draft" },
};

export function ClientStatusBadge({ status }: { status: string }) {
  const s = CLIENT_STATUS[status] || CLIENT_STATUS.active;
  return <span className={`stamp ${s.cls}`}>{s.label}</span>;
}

export function HealthDot({ tone }: { tone: "green" | "yellow" | "red" }) {
  const color = tone === "green" ? "var(--color-leaf)" : tone === "yellow" ? "var(--color-gold)" : "var(--color-stamp)";
  return <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} aria-label={tone} />;
}

export function RoleBadge({ role }: { role: string }) {
  return <span className="mono text-[0.6rem] uppercase tracking-[0.12em] px-2 py-0.5 rounded border border-[color:var(--color-rule)] text-[color:var(--color-ink-soft)]">{role}</span>;
}

export function Empty({ children, colSpan }: { children: React.ReactNode; colSpan: number }) {
  return (
    <tr><td colSpan={colSpan} className="text-sm text-[color:var(--color-ink-soft)] py-8 text-center">{children}</td></tr>
  );
}
