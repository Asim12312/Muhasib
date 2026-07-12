import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Deadline } from "@/models/Deadline";
import { getSession } from "@/lib/access";
import { visibleClientIds } from "@/lib/clientScopeIds";

/** Firm-wide deadline calendar across all visible clients. */
export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  await dbConnect();
  const ids = await visibleClientIds(s);
  const q: Record<string, unknown> = { clientId: { $in: ids } };
  const status = req.nextUrl.searchParams.get("status");
  if (status) q.status = status;
  const deadlines = await Deadline.find(q).sort({ dueDate: 1 }).populate("clientId", "businessName").populate("assignedTo", "name");
  return NextResponse.json({ deadlines });
}
