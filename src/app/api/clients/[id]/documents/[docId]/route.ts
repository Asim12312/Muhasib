import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { StoredDocument } from "@/models/Document";
import { getSession, canAccessClient } from "@/lib/access";

/** Stream the stored file back for download/preview. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string; docId: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id, docId } = await ctx.params;
  await dbConnect();
  if (!(await canAccessClient(s, id))) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  const doc = await StoredDocument.findOne({ _id: docId, firmId: s.firmId, clientId: id }).select("+data name mimeType");
  if (!doc) return NextResponse.json({ error: "File not found." }, { status: 404 });
  const bytes = new Uint8Array(doc.data as Buffer);
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": doc.mimeType || "application/octet-stream",
      "Content-Disposition": `inline; filename="${encodeURIComponent(doc.name)}"`,
    },
  });
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string; docId: string }> }) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  const { id, docId } = await ctx.params;
  await dbConnect();
  if (!(await canAccessClient(s, id))) return NextResponse.json({ error: "Client not found." }, { status: 404 });
  await StoredDocument.deleteOne({ _id: docId, firmId: s.firmId, clientId: id });
  return NextResponse.json({ ok: true });
}
