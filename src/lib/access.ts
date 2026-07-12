import { getUserId } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { User, Role } from "@/models/User";
import { Client } from "@/models/Client";
import { AuditLog } from "@/models/AuditLog";
import mongoose from "mongoose";

export interface Session {
  userId: string;
  firmId: string;
  role: Role;
  name: string;
  email: string;
}

/** Resolve the signed-in staff member from the session cookie (DB-backed). */
export async function getSession(): Promise<Session | null> {
  const userId = await getUserId();
  if (!userId) return null;
  await dbConnect();
  const user = await User.findById(userId).select("firmId role name email status");
  if (!user || user.status === "disabled") return null;
  return {
    userId: user._id.toString(),
    firmId: user.firmId.toString(),
    role: user.role as Role,
    name: user.name,
    email: user.email,
  };
}

/** Mongo filter selecting the SME clients this user is allowed to see. */
export function clientScope(s: Session): Record<string, unknown> {
  if (s.role === "principal") return { firmId: s.firmId };
  return { firmId: s.firmId, assignedTo: new mongoose.Types.ObjectId(s.userId) };
}

/** True if the user may act on this specific SME client. */
export async function canAccessClient(s: Session, clientId: string): Promise<boolean> {
  if (!mongoose.isValidObjectId(clientId)) return false;
  const c = await Client.findOne(clientScope(s)).where("_id").equals(clientId).select("_id");
  return !!c;
}

export function can(role: Role, action: "manage_staff" | "manage_billing" | "delete_client"): boolean {
  if (action === "manage_staff" || action === "manage_billing") return role === "principal";
  if (action === "delete_client") return role === "principal" || role === "manager";
  return false;
}

/** Append-only activity log. Fire-and-forget; never blocks the request path. */
export async function logAudit(
  s: Session,
  action: string,
  opts: { clientId?: string; detail?: string } = {}
) {
  try {
    await AuditLog.create({
      firmId: s.firmId,
      userId: s.userId,
      userName: s.name,
      action,
      clientId: opts.clientId,
      detail: opts.detail || "",
    });
  } catch {
    /* auditing must never break the action it records */
  }
}
