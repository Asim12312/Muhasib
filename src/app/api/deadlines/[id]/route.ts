import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Deadline } from "@/models/Deadline";
import { getSession, canAccessClient, logAudit } from "@/lib/access";

/** Mark done / reopen / snooze / reassign a deadline. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await ctx.params;
  await dbConnect();
  const deadline = await Deadline.findOne({ _id: id, firmId: s.firmId });
  if (!deadline) return NextResponse.json({ error: "Deadline not found." }, { status: 404 });
  if (!(await canAccessClient(s, deadline.clientId.toString())))
    return NextResponse.json({ error: "Deadline not found." }, { status: 404 });

  const b = await req.json();
  if (b.status === "done") deadline.status = "done";
  else if (b.status === "pending") { deadline.status = "pending"; deadline.snoozedUntil = undefined; }
  else if (b.status === "snoozed" && b.snoozedUntil) {
    deadline.status = "snoozed";
    deadline.snoozedUntil = new Date(b.snoozedUntil);
  }
  if (b.assignedTo === null) deadline.assignedTo = undefined;
  else if (mongoose.isValidObjectId(b.assignedTo)) deadline.assignedTo = b.assignedTo;

  await deadline.save();
  await logAudit(s, "deadline.update", { clientId: deadline.clientId.toString(), detail: `${deadline.title}: ${deadline.status}` });
  return NextResponse.json({ deadline });
}
