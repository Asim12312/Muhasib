"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PageTitle, Empty } from "@/components/ui";

type Deadline = {
  _id: string; title: string; dueDate: string; status: string;
  clientId: { _id: string; businessName: string } | null;
  assignedTo: { name: string } | null;
};

function bucket(d: string) {
  const now = new Date(); const due = new Date(d);
  const days = Math.floor((due.getTime() - now.getTime()) / 864e5);
  if (days < 0) return "Overdue";
  if (days <= 7) return "This week";
  if (days <= 31) return "This month";
  return "Later";
}
const ORDER = ["Overdue", "This week", "This month", "Later"];

export default function CalendarPage() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [showDone, setShowDone] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/deadlines${showDone ? "" : "?status=pending"}`).then((r) => r.json()).then((d) => setDeadlines(d.deadlines || []));
  }, [showDone]);
  useEffect(() => { load(); }, [load]);

  async function markDone(id: string) {
    await fetch(`/api/deadlines/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "done" }) });
    load();
  }

  const groups: Record<string, Deadline[]> = {};
  for (const d of deadlines) { const b = bucket(d.dueDate); (groups[b] ||= []).push(d); }

  return (
    <div>
      <PageTitle kicker="Calendar" title="Firm-wide deadlines" sub="Every filing obligation across all your clients, bucketed by urgency."
        action={<label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> Show completed</label>} />

      {ORDER.filter((b) => groups[b]?.length).map((b) => (
        <section key={b} className="mb-6">
          <h2 className={`display font-bold mb-2 ${b === "Overdue" ? "text-[color:var(--color-stamp)]" : ""}`}>{b} <span className="mono text-sm text-[color:var(--color-ink-soft)]">({groups[b].length})</span></h2>
          <div className="card overflow-x-auto">
            <table className="ledger w-full">
              <thead><tr><th>Due</th><th>Client</th><th>Obligation</th><th>Assigned</th><th></th></tr></thead>
              <tbody>
                {groups[b].map((d) => (
                  <tr key={d._id}>
                    <td className="mono whitespace-nowrap">{new Date(d.dueDate).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}</td>
                    <td className="font-medium">{d.clientId ? <Link href={`/dashboard/clients/${d.clientId._id}/deadlines`} className="hover:text-[color:var(--color-pine)]">{d.clientId.businessName}</Link> : "—"}</td>
                    <td>{d.title}</td>
                    <td className="text-sm text-[color:var(--color-ink-soft)]">{d.assignedTo?.name || "—"}</td>
                    <td className="text-right">{d.status !== "done" ? <button className="mono text-xs text-[color:var(--color-pine)]" onClick={() => markDone(d._id)}>Mark done</button> : <span className="stamp stamp-accepted">Done</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      {deadlines.length === 0 && (
        <div className="card"><table className="w-full"><tbody><Empty colSpan={1}>No deadlines to show.</Empty></tbody></table></div>
      )}
    </div>
  );
}
