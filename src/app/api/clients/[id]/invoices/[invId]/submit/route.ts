import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { Buyer } from "@/models/Buyer";
import { Client } from "@/models/Client";
import { getSession, clientScope, logAudit } from "@/lib/access";
import { getFbrAdapter } from "@/lib/fbr";
import { friendlyFbrError } from "@/lib/fbr/errors";

const EDIT_WINDOW_MS = 72 * 60 * 60 * 1000;

/** Transmit an invoice to FBR (sandbox or PRAL). Tracks retry attempts and
 *  opens the 72-hour edit/cancel window on acceptance. */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string; invId: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id, invId } = await ctx.params;
  await dbConnect();

  const client = await Client.findOne({ ...clientScope(s), _id: id });
  if (!client) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  const invoice = await Invoice.findOne({ _id: invId, firmId: s.firmId, clientId: id });
  if (!invoice) return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  if (invoice.status === "accepted")
    return NextResponse.json({ error: "This invoice was already accepted by FBR." }, { status: 400 });

  const buyer = await Buyer.findOne({ _id: invoice.buyerId, firmId: s.firmId });
  if (!buyer) return NextResponse.json({ error: "The buyer for this invoice no longer exists." }, { status: 400 });
  if (!client.ntn)
    return NextResponse.json(
      { error: "Add this client's NTN in their Settings before transmitting to FBR." },
      { status: 400 }
    );

  const adapter = getFbrAdapter({ fbrMode: client.fbrMode, fbrToken: client.fbrToken });
  const result = await adapter.submitInvoice({
    invoiceRef: invoice.invoiceRef,
    invoiceDate: invoice.invoiceDate,
    seller: { ntn: client.ntn, businessName: client.businessName, address: client.address, province: client.province },
    buyer: {
      ntnOrCnic: buyer.ntnOrCnic,
      name: buyer.name,
      address: buyer.address,
      province: buyer.province,
      registrationType: buyer.registrationType as "registered" | "unregistered",
    },
    items: invoice.items,
    totals: invoice.totals,
  });

  invoice.submittedAt = new Date();
  invoice.lastAttemptAt = new Date();
  invoice.submitAttempts = (invoice.submitAttempts || 0) + 1;
  if (result.ok) {
    invoice.status = "accepted";
    invoice.irn = result.irn || "";
    invoice.qrPayload = result.qrPayload || "";
    invoice.fbrError = "";
    invoice.fbrErrorFriendly = "";
    invoice.editableUntil = new Date(Date.now() + EDIT_WINDOW_MS);
  } else {
    invoice.status = "rejected";
    invoice.fbrError = result.error || "Unknown FBR error.";
    invoice.fbrErrorFriendly = friendlyFbrError(result.error || "");
  }
  await invoice.save();
  await logAudit(s, result.ok ? "invoice.accepted" : "invoice.rejected", {
    clientId: id,
    detail: `${invoice.invoiceRef}${result.ok ? ` → ${invoice.irn}` : ""}`,
  });
  return NextResponse.json({ invoice, result });
}
