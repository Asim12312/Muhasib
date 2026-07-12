import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Firm } from "@/models/Firm";
import { hashPassword, createSession } from "@/lib/auth";

/**
 * Firm sign-up. Creates the Firm tenant and its first user (principal),
 * then starts a session. This is the only self-serve way to create a
 * user — additional staff join by invitation.
 */
export async function POST(req: NextRequest) {
  const { firmName, name, email, password } = await req.json();
  if (!firmName || !name || !email || !password)
    return NextResponse.json({ error: "Firm name, your name, email and password are required." }, { status: 400 });
  if (String(password).length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });

  await dbConnect();
  const existing = await User.findOne({ email: String(email).toLowerCase() });
  if (existing)
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

  const firm = await Firm.create({ name: firmName, billingEmail: String(email).toLowerCase() });
  const user = await User.create({
    firmId: firm._id,
    name,
    email: String(email).toLowerCase(),
    passwordHash: await hashPassword(String(password)),
    role: "principal",
  });
  firm.principalUserId = user._id;
  await firm.save();

  await createSession(user._id.toString());
  return NextResponse.json({ ok: true });
}
