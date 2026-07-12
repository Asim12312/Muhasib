import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Firm } from "@/models/Firm";
import { Client } from "@/models/Client";
import { getSession, can, logAudit } from "@/lib/access";
import { PLANS, clientLimitFor } from "@/lib/plans";

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  await dbConnect();
  const [firm, clientCount] = await Promise.all([
    Firm.findById(s.firmId),
    Client.countDocuments({ firmId: s.firmId }),
  ]);
  if (!firm) return NextResponse.json({ error: "Firm not found." }, { status: 404 });
  return NextResponse.json({
    firm: { id: firm._id, name: firm.name, billingEmail: firm.billingEmail, phone: firm.phone, plan: firm.plan },
    usage: { clients: clientCount, clientLimit: clientLimitFor(firm.plan?.tier) },
    plans: PLANS,
  });
}

/** Update firm profile and (principal-only) subscription tier. */
export async function PATCH(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = await req.json();
  await dbConnect();
  const firm = await Firm.findById(s.firmId);
  if (!firm) return NextResponse.json({ error: "Firm not found." }, { status: 404 });

  if (typeof body.name === "string" && body.name.trim()) firm.name = body.name.trim();
  if (typeof body.billingEmail === "string") firm.billingEmail = body.billingEmail;
  if (typeof body.phone === "string") firm.phone = body.phone;

  if (body.tier && ["trial", "starter", "growth", "scale"].includes(body.tier)) {
    if (!can(s.role, "manage_billing"))
      return NextResponse.json({ error: "Only the firm principal can change the plan." }, { status: 403 });
    firm.plan = { ...firm.plan, tier: body.tier, status: "active" };
    await logAudit(s, "billing.change_plan", { detail: body.tier });
  }
  await firm.save();
  return NextResponse.json({ ok: true });
}
