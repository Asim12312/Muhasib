import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { StoredDocument } from "@/models/Document";
import { getSession, canAccessClient, logAudit } from "@/lib/access";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB inline cap
const DOC_TYPES = ["ntn_cert", "strn_cert", "cnic", "bank_letter", "prior_return", "notice", "other"];

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await ctx.params;
  await dbConnect();
  if (!(await canAccessClient(s, id))) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  const documents = await StoredDocument.find({ firmId: s.firmId, clientId: id })
    .select("name docType year mimeType size createdAt")
    .sort({ createdAt: -1 });
  return NextResponse.json({ documents });
}

/** Upload a file as base64 JSON. Kept simple for MVP; cap enforced server-side. */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id } = await ctx.params;
  await dbConnect();
  if (!(await canAccessClient(s, id))) return NextResponse.json({ error: "Client not found." }, { status: 404 });

  const b = await req.json();
  if (!b.name || !b.dataBase64) return NextResponse.json({ error: "A file is required." }, { status: 400 });
  const data = Buffer.from(String(b.dataBase64).split(",").pop() || "", "base64");
  if (data.length === 0) return NextResponse.json({ error: "The file appears to be empty." }, { status: 400 });
  if (data.length > MAX_BYTES) return NextResponse.json({ error: "Files must be 8 MB or smaller." }, { status: 400 });

  const doc = await StoredDocument.create({
    firmId: s.firmId,
    clientId: id,
    name: b.name,
    docType: DOC_TYPES.includes(b.docType) ? b.docType : "other",
    year: String(b.year || ""),
    mimeType: b.mimeType || "application/octet-stream",
    size: data.length,
    data,
    uploadedByUserId: s.userId,
  });
  await logAudit(s, "document.upload", { clientId: id, detail: b.name });
  return NextResponse.json({ document: { id: doc._id, name: doc.name, docType: doc.docType, size: doc.size } }, { status: 201 });
}
