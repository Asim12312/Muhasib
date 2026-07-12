import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { getSession, canAccessClient, logAudit } from "@/lib/access";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string; invId: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id, invId } = await ctx.params;
  await dbConnect();
  if (!(await canAccessClient(s, id))) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  const invoice = await Invoice.findOne({ _id: invId, firmId: s.firmId, clientId: id })
    .populate("buyerId")
    .populate("clientId");
  if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  return NextResponse.json({ invoice });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string; invId: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id, invId } = await ctx.params;
  await dbConnect();
  if (!(await canAccessClient(s, id))) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  const inv = await Invoice.findOne({ _id: invId, firmId: s.firmId, clientId: id });
  if (!inv) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  if (inv.status === "accepted")
    return NextResponse.json(
      { error: "Accepted invoices are on FBR record and can't be deleted here. Use a credit/debit note." },
      { status: 400 }
    );
  await inv.deleteOne();
  await logAudit(s, "invoice.delete", { clientId: id, detail: inv.invoiceRef });
  return NextResponse.json({ ok: true });
}
