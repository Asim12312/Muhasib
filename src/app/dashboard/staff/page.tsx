"use client";
import { useEffect, useState, useCallback } from "react";
import { PageTitle, ErrorNote, RoleBadge, Empty } from "@/components/ui";

type Staff = { _id: string; name: string; email: string; role: string; status: string };
type Invite = { _id: string; email: string; role: string; token: string };
type Audit = { _id: string; userName: string; action: string; detail: string; createdAt: string };

export default function StaffPage() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [audit, setAudit] = useState<Audit[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("associate");
  const [error, setError] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const load = useCallback(() => {
    fetch("/api/firm/staff").then((r) => r.json()).then((d) => { setStaff(d.staff || []); setInvites(d.invites || []); });
    fetch("/api/audit").then((r) => r.json()).then((d) => setAudit(d.entries || [])).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  async function invite() {
    setError(""); setInviteLink("");
    const res = await fetch("/api/firm/staff", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, role }) });
    const d = await res.json();
    if (res.ok) { setInviteLink(`${location.origin}${d.link}`); setEmail(""); load(); }
    else setError(d.error || "Could not create invite.");
  }
  async function update(id: string, body: Record<string, string>) {
    await fetch(`/api/firm/staff/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    load();
  }

  return (
    <div>
      <PageTitle kicker="Staff" title="Your team & access" sub="Invite colleagues and set what each can see. Managers and associates only see the clients assigned to them." />

      <div className="card p-6 grid sm:grid-cols-[1fr_auto_auto] gap-4 items-end">
        <div><label className="label">Invite by email</label><input className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@firm.pk" /></div>
        <div>
          <label className="label">Role</label>
          <select className="field" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="associate">Associate</option><option value="manager">Manager</option><option value="principal">Principal</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={invite} disabled={!email}>Create invite</button>
      </div>
      {inviteLink && (
        <div className="card p-4 mt-3 bg-[color:var(--color-pine-tint)]">
          <p className="text-sm mb-2">Invite created. Send this link to the colleague (it expires in 14 days):</p>
          <div className="flex gap-2">
            <input className="field mono text-xs" readOnly value={inviteLink} onFocus={(e) => e.target.select()} />
            <button className="btn btn-ghost" onClick={() => navigator.clipboard.writeText(inviteLink)}>Copy</button>
          </div>
        </div>
      )}
      <div className="mt-3"><ErrorNote msg={error} /></div>

      <div className="card mt-6 overflow-x-auto">
        <table className="ledger w-full">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s._id}>
                <td className="font-medium">{s.name}</td>
                <td className="mono text-sm">{s.email}</td>
                <td>
                  <select className="field !py-1 text-sm max-w-[140px]" value={s.role} onChange={(e) => update(s._id, { role: e.target.value })}>
                    <option value="associate">Associate</option><option value="manager">Manager</option><option value="principal">Principal</option>
                  </select>
                </td>
                <td><span className={`stamp ${s.status === "active" ? "stamp-accepted" : "stamp-draft"}`}>{s.status}</span></td>
                <td className="text-right">
                  <button className="mono text-xs text-[color:var(--color-stamp)]" onClick={() => update(s._id, { status: s.status === "active" ? "disabled" : "active" })}>
                    {s.status === "active" ? "Disable" : "Enable"}
                  </button>
                </td>
              </tr>
            ))}
            {invites.map((iv) => (
              <tr key={iv._id} className="opacity-70">
                <td className="italic">Pending invite</td>
                <td className="mono text-sm">{iv.email}</td>
                <td><RoleBadge role={iv.role} /></td>
                <td><span className="stamp stamp-draft">Invited</span></td>
                <td className="text-right"><button className="mono text-xs text-[color:var(--color-pine)]" onClick={() => navigator.clipboard.writeText(`${location.origin}/invite/${iv.token}`)}>Copy link</button></td>
              </tr>
            ))}
            {staff.length === 0 && <Empty colSpan={5}>No staff yet.</Empty>}
          </tbody>
        </table>
      </div>

      <h2 className="display text-xl font-bold mt-8 mb-3">Activity log</h2>
      <div className="card overflow-x-auto">
        <table className="ledger w-full">
          <thead><tr><th>When</th><th>Who</th><th>Action</th><th>Detail</th></tr></thead>
          <tbody>
            {audit.map((a) => (
              <tr key={a._id}>
                <td className="mono text-xs whitespace-nowrap">{new Date(a.createdAt).toLocaleString("en-PK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                <td className="text-sm">{a.userName}</td>
                <td className="mono text-xs">{a.action}</td>
                <td className="text-sm text-[color:var(--color-ink-soft)]">{a.detail}</td>
              </tr>
            ))}
            {audit.length === 0 && <Empty colSpan={4}>No activity recorded yet.</Empty>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
