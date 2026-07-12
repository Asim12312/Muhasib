import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Invite } from "@/models/Invite";
import { Firm } from "@/models/Firm";
import { User } from "@/models/User";
import { hashPassword, createSession } from "@/lib/auth";

async function loadValidInvite(token: string) {
  await dbConnect();
  const invite = await Invite.findOne({ token, status: "pending" });
  if (!invite) return null;
  if (invite.expiresAt < new Date()) return null;
  return invite;
}

/** Public: fetch invite details so the accept page can render firm + role. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const invite = await loadValidInvite(token);
  if (!invite) return NextResponse.json({ error: "This invitation is invalid or has expired." }, { status: 404 });
  const firm = await Firm.findById(invite.firmId).select("name");
  return NextResponse.json({ invite: { email: invite.email, role: invite.role, firmName: firm?.name || "" } });
}

/** Public: accept the invite by setting a name + password; starts a session. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const { name, password } = await req.json();
  if (!name || !password) return NextResponse.json({ error: "Name and password are required." }, { status: 400 });
  if (String(password).length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  const invite = await loadValidInvite(token);
  if (!invite) return NextResponse.json({ error: "This invitation is invalid or has expired." }, { status: 404 });

  const existing = await User.findOne({ email: invite.email });
  if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const user = await User.create({
    firmId: invite.firmId,
    name,
    email: invite.email,
    passwordHash: await hashPassword(String(password)),
    role: invite.role,
  });
  invite.status = "accepted";
  await invite.save();
  await createSession(user._id.toString());
  return NextResponse.json({ ok: true });
}
