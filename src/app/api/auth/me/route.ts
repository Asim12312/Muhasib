import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Firm } from "@/models/Firm";
import { getSession } from "@/lib/access";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  await dbConnect();
  const firm = await Firm.findById(s.firmId);
  return NextResponse.json({
    user: { id: s.userId, name: s.name, email: s.email, role: s.role },
    firm: firm ? { id: firm._id, name: firm.name, plan: firm.plan, billingEmail: firm.billingEmail, phone: firm.phone } : null,
  });
}

/** Update the signed-in user's own display name. */
export async function PATCH(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = await req.json();
  await dbConnect();
  if (typeof body.name === "string" && body.name.trim())
    await User.findByIdAndUpdate(s.userId, { name: body.name.trim() });
  return NextResponse.json({ ok: true });
}
