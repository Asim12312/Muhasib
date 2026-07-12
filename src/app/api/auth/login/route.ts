import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { verifyPassword, createSession } from "@/lib/auth";
import { verifyRecaptcha } from "@/lib/recaptcha";

export async function POST(req: NextRequest) {
  const { email, password, recaptchaToken } = await req.json();
  if (!email || !password)
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  if (!(await verifyRecaptcha(recaptchaToken)))
    return NextResponse.json({ error: "Please complete the “I'm not a robot” check." }, { status: 400 });
  await dbConnect();
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user || !user.passwordHash || !(await verifyPassword(String(password), user.passwordHash)))
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  if (user.status === "disabled")
    return NextResponse.json({ error: "This account has been disabled. Contact your firm principal." }, { status: 403 });
  await createSession(user._id.toString());
  return NextResponse.json({ ok: true });
}
