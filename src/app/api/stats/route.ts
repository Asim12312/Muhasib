import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { Invoice } from "@/models/Invoice";
import { Client } from "@/models/Client";
import { Deadline } from "@/models/Deadline";
import { getSession, clientScope } from "@/lib/access";

const DAY = 24 * 60 * 60 * 1000;

/** Firm-wide compliance snapshot for the consultant dashboard. */
export async function GET(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  await dbConnect();

  const scope = clientScope(s);
  const staff = req.nextUrl.searchParams.get("staff");
  if (staff && s.role === "principal" && mongoose.isValidObjectId(staff))
    scope.assignedTo = new mongoose.Types.ObjectId(staff);

  const clients = await Client.find(scope).select("businessName status assignedTo");
  const clientIds = clients.map((c) => c._id);
  const now = new Date();
  const in24 = new Date(now.getTime() + DAY);
  const in48 = new Date(now.getTime() + 2 * DAY);
  const in7d = new Date(now.getTime() + 7 * DAY);
  const ago24 = new Date(now.getTime() - DAY);

  const [invAgg, windowsClosing, recentRejections, deadlines] = await Promise.all([
    Invoice.aggregate([
      { $match: { clientId: { $in: clientIds } } },
      { $group: { _id: { clientId: "$clientId", status: "$status" }, count: { $sum: 1 } } },
    ]),
    Invoice.find({ clientId: { $in: clientIds }, status: "accepted", editableUntil: { $gte: now, $lte: in24 } })
      .select("invoiceRef clientId editableUntil")
      .populate("clientId", "businessName"),
    Invoice.find({ clientId: { $in: clientIds }, status: "rejected", lastAttemptAt: { $gte: ago24 } })
      .select("invoiceRef clientId fbrErrorFriendly")
      .populate("clientId", "businessName"),
    Deadline.find({ clientId: { $in: clientIds }, status: "pending", dueDate: { $lte: in7d } })
      .select("title dueDate clientId type")
      .populate("clientId", "businessName")
      .sort({ dueDate: 1 }),
  ]);

  // Per-client rollups
  const byClient = new Map<string, { draft: number; rejected: number; accepted: number }>();
  for (const c of clientIds) byClient.set(c.toString(), { draft: 0, rejected: 0, accepted: 0 });
  for (const row of invAgg) {
    const key = row._id.clientId.toString();
    const rec = byClient.get(key);
    if (rec) rec[row._id.status as "draft" | "rejected" | "accepted"] = row.count;
  }
  const overdueByClient = new Map<string, number>();
  for (const d of deadlines) {
    if (d.dueDate < now) {
      const k = d.clientId?._id?.toString() || "";
      overdueByClient.set(k, (overdueByClient.get(k) || 0) + 1);
    }
  }

  // Health: red = rejections or overdue deadline; yellow = drafts or deadline within 7d; green otherwise
  let green = 0, yellow = 0, red = 0;
  const deadlineClientIds = new Set(deadlines.map((d) => d.clientId?._id?.toString()));
  for (const c of clients) {
    const k = c._id.toString();
    const rec = byClient.get(k)!;
    const overdue = overdueByClient.get(k) || 0;
    if (rec.rejected > 0 || overdue > 0) red++;
    else if (rec.draft > 0 || deadlineClientIds.has(k)) yellow++;
    else green++;
  }

  const totals = { draft: 0, accepted: 0, rejected: 0 };
  for (const rec of byClient.values()) {
    totals.draft += rec.draft;
    totals.accepted += rec.accepted;
    totals.rejected += rec.rejected;
  }

  return NextResponse.json({
    clientCount: clients.length,
    health: { green, yellow, red },
    invoiceTotals: totals,
    fires: {
      rejections: recentRejections.map((r) => ({
        id: r._id, invoiceRef: r.invoiceRef, clientId: r.clientId?._id,
        client: (r.clientId as unknown as { businessName?: string })?.businessName || "—",
        reason: r.fbrErrorFriendly || "Rejected by FBR",
      })),
      windowsClosing: windowsClosing.map((w) => ({
        id: w._id, invoiceRef: w.invoiceRef, clientId: w.clientId?._id,
        client: (w.clientId as unknown as { businessName?: string })?.businessName || "—",
        editableUntil: w.editableUntil,
      })),
      deadlinesSoon: deadlines
        .filter((d) => d.dueDate <= in48)
        .map((d) => ({
          id: d._id, title: d.title, dueDate: d.dueDate, clientId: d.clientId?._id,
          client: (d.clientId as unknown as { businessName?: string })?.businessName || "—",
          overdue: d.dueDate < now,
        })),
    },
    thisWeek: deadlines.map((d) => ({
      id: d._id, title: d.title, dueDate: d.dueDate, type: d.type,
      clientId: d.clientId?._id,
      client: (d.clientId as unknown as { businessName?: string })?.businessName || "—",
      overdue: d.dueDate < now,
    })),
  });
}
