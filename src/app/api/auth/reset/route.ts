import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { AuthToken } from "@/models/AuthToken";
import { hashPassword } from "@/lib/auth";

/** Complete a password reset with a valid token. */
export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) return NextResponse.json({ error: "Token and new password are required." }, { status: 400 });
  if (String(password).length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  await dbConnect();
  const rec = await AuthToken.findOne({ token, type: "reset" });
  if (!rec || rec.expiresAt < new Date())
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  await User.findByIdAndUpdate(rec.userId, { passwordHash: await hashPassword(String(password)) });
  await AuthToken.deleteMany({ userId: rec.userId, type: "reset" });
  return NextResponse.json({ ok: true });
}
