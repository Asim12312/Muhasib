import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { Buyer } from "@/models/Buyer";
import { getSession, canAccessClient, logAudit } from "@/lib/access";
import { buildItems, totalsOf } from "@/lib/invoice";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await ctx.params;
  await dbConnect();
  if (!(await canAccessClient(s, id))) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  const q: Record<string, unknown> = { firmId: s.firmId, clientId: id };
  const status = req.nextUrl.searchParams.get("status");
  if (status) q.status = status;
  const invoices = await Invoice.find(q).sort({ createdAt: -1 }).populate("buyerId", "name");
  return NextResponse.json({ invoices });
}

/** Create a draft invoice for this SME against one of its buyers. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await ctx.params;
  await dbConnect();
  if (!(await canAccessClient(s, id))) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  const body = await req.json();
  if (!body.buyerId || !body.invoiceRef || !body.invoiceDate)
    return NextResponse.json({ error: "Buyer, invoice number and date are required." }, { status: 400 });
  const buyer = await Buyer.findOne({ _id: body.buyerId, firmId: s.firmId, clientId: id });
  if (!buyer) return NextResponse.json({ error: "Pick a valid buyer for this client." }, { status: 400 });

  const items = buildItems(Array.isArray(body.items) ? body.items : []);
  if (items.length === 0) return NextResponse.json({ error: "Add at least one line item." }, { status: 400 });

  const invoice = await Invoice.create({
    firmId: s.firmId,
    clientId: id,
    buyerId: body.buyerId,
    createdByUserId: s.userId,
    invoiceRef: body.invoiceRef,
    invoiceDate: body.invoiceDate,
    items,
    totals: totalsOf(items),
    status: "draft",
  });
  await logAudit(s, "invoice.create", { clientId: id, detail: invoice.invoiceRef });
  return NextResponse.json({ invoice }, { status: 201 });
}
