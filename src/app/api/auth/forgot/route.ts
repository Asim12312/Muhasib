import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { AuthToken } from "@/models/AuthToken";
import { sendEmail, templates, appUrl } from "@/lib/email";
import { verifyRecaptcha } from "@/lib/recaptcha";

/** Start password reset. Always returns ok to avoid leaking which emails exist. */
export async function POST(req: NextRequest) {
  const { email, recaptchaToken } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });
  if (!(await verifyRecaptcha(recaptchaToken)))
    return NextResponse.json({ error: "Please complete the “I'm not a robot” check." }, { status: 400 });

  await dbConnect();
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (user && user.passwordHash) {
    await AuthToken.deleteMany({ userId: user._id, type: "reset" });
    const token = randomBytes(24).toString("hex");
    await AuthToken.create({ userId: user._id, type: "reset", token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) });
    const link = `${appUrl(req.nextUrl.origin)}/reset?token=${token}`;
    await sendEmail({ to: user.email, subject: "Reset your password · Mohasib", html: templates.reset(link) });
  }
  return NextResponse.json({ ok: true });
}
