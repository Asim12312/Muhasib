import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { verifyPassword, createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password)
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  await dbConnect();
  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user || !(await verifyPassword(String(password), user.passwordHash)))
    return NextResponse.json({ error: "Email or password is incorrect." }, { status: 401 });
  await createSession(user._id.toString());
  return NextResponse.json({ ok: true });
}
