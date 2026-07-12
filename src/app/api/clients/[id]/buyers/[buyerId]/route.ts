import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Buyer } from "@/models/Buyer";
import { Invoice } from "@/models/Invoice";
import { getSession, canAccessClient } from "@/lib/access";

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string; buyerId: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id, buyerId } = await ctx.params;
  await dbConnect();
  if (!(await canAccessClient(s, id))) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  const used = await Invoice.countDocuments({ buyerId });
  if (used > 0)
    return NextResponse.json({ error: "This buyer is on existing invoices and can't be removed." }, { status: 400 });
  await Buyer.deleteOne({ _id: buyerId, firmId: s.firmId, clientId: id });
  return NextResponse.json({ ok: true });
}
