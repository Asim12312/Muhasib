import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Firm } from "@/models/Firm";
import { hashPassword, createSession } from "@/lib/auth";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { issueVerification } from "@/lib/verify";

/**
 * Firm sign-up. Creates the Firm tenant and its first user (principal),
 * sends an email-verification link, then starts a session. Additional
 * staff join by invitation.
 */
export async function POST(req: NextRequest) {
  const { firmName, name, email, password, recaptchaToken } = await req.json();
  if (!firmName || !name || !email || !password)
    return NextResponse.json({ error: "Firm name, your name, email and password are required." }, { status: 400 });
  if (String(password).length < 8)
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  if (!(await verifyRecaptcha(recaptchaToken)))
    return NextResponse.json({ error: "Please complete the “I'm not a robot” check." }, { status: 400 });

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
    authProvider: "password",
    emailVerified: false,
  });
  firm.principalUserId = user._id;
  await firm.save();

  await issueVerification(user._id.toString(), user.email, req.nextUrl.origin);
  await createSession(user._id.toString());
  return NextResponse.json({ ok: true });
}
