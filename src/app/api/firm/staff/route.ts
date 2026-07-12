import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Invite } from "@/models/Invite";
import { getSession, can, logAudit } from "@/lib/access";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!can(s.role, "manage_staff"))
    return NextResponse.json({ error: "Only the firm principal can manage staff." }, { status: 403 });
  await dbConnect();
  const [staff, invites] = await Promise.all([
    User.find({ firmId: s.firmId }).select("name email role status createdAt").sort({ createdAt: 1 }),
    Invite.find({ firmId: s.firmId, status: "pending" }).select("email role token expiresAt createdAt"),
  ]);
  return NextResponse.json({ staff, invites });
}

/** Create an invitation. Returns a shareable link the principal sends manually. */
export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!can(s.role, "manage_staff"))
    return NextResponse.json({ error: "Only the firm principal can invite staff." }, { status: 403 });
  const { email, role } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });
  const cleanRole = role === "manager" || role === "associate" || role === "principal" ? role : "associate";
  await dbConnect();
  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing) return NextResponse.json({ error: "That email already belongs to an account." }, { status: 409 });

  const token = randomBytes(24).toString("hex");
  await Invite.create({
    firmId: s.firmId,
    email: String(email).toLowerCase(),
    role: cleanRole,
    token,
    invitedByUserId: s.userId,
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  });
  await logAudit(s, "staff.invite", { detail: `${email} as ${cleanRole}` });
  return NextResponse.json({ token, link: `/invite/${token}` }, { status: 201 });
}
