import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";
import { getSession, can } from "@/lib/access";

/** Recent firm activity log (principal only). */
export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!can(s.role, "manage_staff"))
    return NextResponse.json({ error: "Only the firm principal can view the activity log." }, { status: 403 });
  await dbConnect();
  const entries = await AuditLog.find({ firmId: s.firmId }).sort({ createdAt: -1 }).limit(200);
  return NextResponse.json({ entries });
}
