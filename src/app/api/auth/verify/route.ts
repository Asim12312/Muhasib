import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { AuthToken } from "@/models/AuthToken";
import { getSession } from "@/lib/access";
import { issueVerification } from "@/lib/verify";

/** Confirm an email-verification token. */
export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });
  await dbConnect();
  const rec = await AuthToken.findOne({ token, type: "verify" });
  if (!rec || rec.expiresAt < new Date())
    return NextResponse.json({ error: "This verification link is invalid or has expired." }, { status: 400 });
  await User.findByIdAndUpdate(rec.userId, { emailVerified: true });
  await AuthToken.deleteMany({ userId: rec.userId, type: "verify" });
  return NextResponse.json({ ok: true });
}

/** Resend the verification email to the signed-in user. */
export async function PUT() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (s.emailVerified) return NextResponse.json({ ok: true, already: true });
  await issueVerification(s.userId, s.email);
  return NextResponse.json({ ok: true });
}
