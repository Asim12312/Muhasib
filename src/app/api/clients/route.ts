import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Client } from "@/models/Client";
import { Firm } from "@/models/Firm";
import { getSession, clientScope, logAudit } from "@/lib/access";
import { clientLimitFor } from "@/lib/plans";
import { syncDeadlines } from "@/lib/deadlines";

export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  await dbConnect();
  const q: Record<string, unknown> = clientScope(s);
  const search = req.nextUrl.searchParams.get("q");
  const status = req.nextUrl.searchParams.get("status");
  if (search) q.businessName = { $regex: search.trim(), $options: "i" };
  if (status) q.status = status;
  const clients = await Client.find(q)
    .select("businessName ntn strn status category sector province assignedTo fbrMode updatedAt")
    .populate("assignedTo", "name")
    .sort({ businessName: 1 });
  return NextResponse.json({ clients });
}

/** Create a managed SME. Enforces the firm's plan client limit. */
export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const body = await req.json();
  if (!body.businessName)
    return NextResponse.json({ error: "The SME's registered business name is required." }, { status: 400 });

  await dbConnect();
  const [firm, count] = await Promise.all([
    Firm.findById(s.firmId),
    Client.countDocuments({ firmId: s.firmId }),
  ]);
  const limit = clientLimitFor(firm?.plan?.tier);
  if (count >= limit)
    return NextResponse.json(
      { error: `Your ${firm?.plan?.tier || "trial"} plan allows ${limit} clients. Upgrade in Billing to add more.` },
      { status: 402 }
    );

  // Non-principals are auto-assigned to what they create so they retain access.
  const assignedTo =
    s.role === "principal" && Array.isArray(body.assignedTo)
      ? body.assignedTo.filter((x: string) => mongoose.isValidObjectId(x))
      : [s.userId];

  const client = await Client.create({
    firmId: s.firmId,
    businessName: body.businessName,
    ntn: body.ntn || "",
    strn: body.strn || "",
    category: ["public_company", "private_company", "individual", "aop"].includes(body.category) ? body.category : "private_company",
    turnoverTier: ["tier1", "tier2", "tier3"].includes(body.turnoverTier) ? body.turnoverTier : "",
    sector: body.sector || "",
    address: body.address || "",
    province: body.province || "Punjab",
    salesTaxRegistered: body.salesTaxRegistered !== false,
    filingFrequency: body.filingFrequency === "quarterly" ? "quarterly" : "monthly",
    status: "onboarding",
    assignedTo,
    contact: {
      name: body.contact?.name || "",
      phone: body.contact?.phone || "",
      email: body.contact?.email || "",
    },
  });

  await syncDeadlines(client);
  await logAudit(s, "client.create", { clientId: client._id.toString(), detail: client.businessName });
  return NextResponse.json({ client }, { status: 201 });
}
