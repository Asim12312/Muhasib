import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Client } from "@/models/Client";
import { Invoice } from "@/models/Invoice";
import { Buyer } from "@/models/Buyer";
import { getSession, clientScope, can, logAudit } from "@/lib/access";
import { syncDeadlines } from "@/lib/deadlines";

async function findScoped(s: Awaited<ReturnType<typeof getSession>>, id: string) {
  if (!s || !mongoose.isValidObjectId(id)) return null;
  return Client.findOne({ ...clientScope(s), _id: id });
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await ctx.params;
  await dbConnect();
  const client = await (await findScoped(s, id))?.populate("assignedTo", "name email role");
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  return NextResponse.json({ client });
}

/** Update SME profile, FBR connection, status, or staff assignment. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await ctx.params;
  await dbConnect();
  const client = await findScoped(s, id);
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  const b = await req.json();
  const fields = ["businessName", "ntn", "strn", "sector", "address", "province"] as const;
  for (const f of fields) if (typeof b[f] === "string") (client as Record<string, unknown>)[f] = b[f];
  if (["public_company", "private_company", "individual", "aop"].includes(b.category)) client.category = b.category;
  if (["", "tier1", "tier2", "tier3"].includes(b.turnoverTier)) client.turnoverTier = b.turnoverTier;
  if (["onboarding", "active", "pending_docs", "at_risk", "dormant"].includes(b.status)) client.status = b.status;
  if (["monthly", "quarterly"].includes(b.filingFrequency)) client.filingFrequency = b.filingFrequency;
  if (typeof b.salesTaxRegistered === "boolean") client.salesTaxRegistered = b.salesTaxRegistered;
  if (["sandbox", "pral"].includes(b.fbrMode)) client.fbrMode = b.fbrMode;
  if (typeof b.fbrToken === "string") client.fbrToken = b.fbrToken;
  if (b.contact) client.contact = { name: b.contact.name || "", phone: b.contact.phone || "", email: b.contact.email || "" };
  // Only the principal can reassign staff.
  if (Array.isArray(b.assignedTo) && s.role === "principal")
    client.assignedTo = b.assignedTo.filter((x: string) => mongoose.isValidObjectId(x));

  await client.save();
  await syncDeadlines(client);
  await logAudit(s, "client.update", { clientId: id, detail: client.businessName });
  return NextResponse.json({ client });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  if (!can(s.role, "delete_client"))
    return NextResponse.json({ error: "Only a principal or manager can remove a client." }, { status: 403 });
  const { id } = await ctx.params;
  await dbConnect();
  const client = await findScoped(s, id);
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  const accepted = await Invoice.countDocuments({ clientId: id, status: "accepted" });
  if (accepted > 0)
    return NextResponse.json(
      { error: "This client has invoices accepted by FBR and can't be deleted. Mark them dormant instead." },
      { status: 400 }
    );
  await Promise.all([
    Invoice.deleteMany({ clientId: id }),
    Buyer.deleteMany({ clientId: id }),
    client.deleteOne(),
  ]);
  await logAudit(s, "client.delete", { detail: client.businessName });
  return NextResponse.json({ ok: true });
}
