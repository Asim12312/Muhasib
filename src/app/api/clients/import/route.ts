import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Client, ClientDoc } from "@/models/Client";
import { Firm } from "@/models/Firm";
import { getSession, logAudit } from "@/lib/access";
import { clientLimitFor } from "@/lib/plans";
import { syncDeadlines } from "@/lib/deadlines";

const CATEGORIES = ["public_company", "private_company", "individual", "aop"];

/** Bulk onboard SMEs from a CSV (one row per client). */
export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { rows } = await req.json();
  if (!Array.isArray(rows) || rows.length === 0)
    return NextResponse.json({ error: "The file has no data rows." }, { status: 400 });

  await dbConnect();
  const [firm, count] = await Promise.all([
    Firm.findById(s.firmId),
    Client.countDocuments({ firmId: s.firmId }),
  ]);
  const limit = clientLimitFor(firm?.plan?.tier);
  if (count + rows.length > limit)
    return NextResponse.json(
      { error: `This import would exceed your ${firm?.plan?.tier || "trial"} plan limit of ${limit} clients (${count} used). Upgrade in Billing.` },
      { status: 402 }
    );

  const problems: string[] = [];
  const docs = rows
    .map((r: Record<string, string>, i: number) => {
      const businessName = String(r.businessName || "").trim();
      if (!businessName) {
        problems.push(`Row ${i + 2}: businessName is required.`);
        return null;
      }
      return {
        firmId: s.firmId,
        businessName,
        ntn: String(r.ntn || "").trim(),
        strn: String(r.strn || "").trim(),
        category: CATEGORIES.includes(r.category) ? r.category : "private_company",
        sector: String(r.sector || "").trim(),
        province: String(r.province || "Punjab").trim(),
        salesTaxRegistered: String(r.salesTaxRegistered || "yes").toLowerCase() !== "no",
        status: "onboarding" as const,
        assignedTo: s.role === "principal" ? [] : [s.userId],
        contact: { name: String(r.contactName || ""), phone: String(r.contactPhone || ""), email: String(r.contactEmail || "") },
      };
    })
    .filter(Boolean);

  if (problems.length) return NextResponse.json({ error: problems.slice(0, 5).join(" ") }, { status: 400 });

  const created = (await Client.insertMany(docs)) as unknown as ClientDoc[];
  await Promise.all(created.map((c) => syncDeadlines(c)));
  await logAudit(s, "client.import", { detail: `${created.length} clients` });
  return NextResponse.json({ created: created.length });
}
