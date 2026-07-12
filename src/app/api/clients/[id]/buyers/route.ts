import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Buyer } from "@/models/Buyer";
import { getSession, canAccessClient, logAudit } from "@/lib/access";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await ctx.params;
  await dbConnect();
  if (!(await canAccessClient(s, id))) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  const buyers = await Buyer.find({ firmId: s.firmId, clientId: id }).sort({ name: 1 });
  return NextResponse.json({ buyers });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await ctx.params;
  await dbConnect();
  if (!(await canAccessClient(s, id))) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  const b = await req.json();
  if (!b.name) return NextResponse.json({ error: "Buyer name is required." }, { status: 400 });
  const buyer = await Buyer.create({
    firmId: s.firmId,
    clientId: id,
    name: b.name,
    ntnOrCnic: b.ntnOrCnic || "",
    registrationType: b.registrationType === "unregistered" ? "unregistered" : "registered",
    address: b.address || "",
    province: b.province || "Punjab",
  });
  await logAudit(s, "buyer.create", { clientId: id, detail: buyer.name });
  return NextResponse.json({ buyer }, { status: 201 });
}
