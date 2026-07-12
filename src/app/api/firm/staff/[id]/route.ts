import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { getSession, can, logAudit } from "@/lib/access";

/** Change a staff member's role or status (principal only). */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!can(s.role, "manage_staff"))
    return NextResponse.json({ error: "Only the firm principal can manage staff." }, { status: 403 });
  const { id } = await ctx.params;
  if (id === s.userId) return NextResponse.json({ error: "You can't change your own role." }, { status: 400 });
  const body = await req.json();
  const update: Record<string, unknown> = {};
  if (["principal", "manager", "associate"].includes(body.role)) update.role = body.role;
  if (["active", "disabled"].includes(body.status)) update.status = body.status;
  await dbConnect();
  const user = await User.findOneAndUpdate({ _id: id, firmId: s.firmId }, update, { new: true }).select("name role status");
  if (!user) return NextResponse.json({ error: "Staff member not found." }, { status: 404 });
  await logAudit(s, "staff.update", { detail: `${user.name}: ${JSON.stringify(update)}` });
  return NextResponse.json({ user });
}
