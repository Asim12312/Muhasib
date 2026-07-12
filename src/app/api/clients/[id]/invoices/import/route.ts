import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { Buyer } from "@/models/Buyer";
import { getSession, canAccessClient, logAudit } from "@/lib/access";
import { buildItems, totalsOf } from "@/lib/invoice";

/**
 * Bulk import for one SME: { buyerId, rows } where each row is a line item;
 * rows sharing an invoiceRef become one draft invoice.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await ctx.params;
  await dbConnect();
  if (!(await canAccessClient(s, id))) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  const { buyerId, rows } = await req.json();
  if (!buyerId) return NextResponse.json({ error: "Pick the buyer these invoices are for." }, { status: 400 });
  const buyer = await Buyer.findOne({ _id: buyerId, firmId: s.firmId, clientId: id });
  if (!buyer) return NextResponse.json({ error: "Pick a valid buyer for this client." }, { status: 400 });
  if (!Array.isArray(rows) || rows.length === 0)
    return NextResponse.json({ error: "The file has no data rows." }, { status: 400 });
  if (rows.length > 2000) return NextResponse.json({ error: "Import up to 2,000 rows per file." }, { status: 400 });

  const groups = new Map<string, { invoiceDate: string; items: Record<string, unknown>[] }>();
  const problems: string[] = [];
  rows.forEach((r: Record<string, unknown>, i: number) => {
    const ref = String(r.invoiceRef || "").trim();
    const date = String(r.invoiceDate || "").trim();
    if (!ref || !date) {
      problems.push(`Row ${i + 2}: invoiceRef and invoiceDate are required.`);
      return;
    }
    if (!groups.has(ref)) groups.set(ref, { invoiceDate: date, items: [] });
    groups.get(ref)!.items.push(r);
  });
  if (problems.length) return NextResponse.json({ error: problems.slice(0, 5).join(" ") }, { status: 400 });

  const docs = [...groups.entries()].map(([invoiceRef, g]) => {
    const items = buildItems(g.items as never[]);
    return {
      firmId: s.firmId,
      clientId: id,
      buyerId,
      createdByUserId: s.userId,
      invoiceRef,
      invoiceDate: g.invoiceDate,
      items,
      totals: totalsOf(items),
      status: "draft" as const,
    };
  });
  const created = await Invoice.insertMany(docs);
  await logAudit(s, "invoice.import", { clientId: id, detail: `${created.length} drafts` });
  return NextResponse.json({ created: created.length });
}
