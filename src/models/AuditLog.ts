import mongoose, { Schema, InferSchemaType } from "mongoose";

/**
 * Firm-scoped activity log: who did what, on which client. Append-only.
 */
const AuditLogSchema = new Schema(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, default: "" },
    action: { type: String, required: true }, // e.g. "invoice.submit", "client.create"
    clientId: { type: Schema.Types.ObjectId, ref: "Client" },
    detail: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type AuditLogDoc = InferSchemaType<typeof AuditLogSchema> & { _id: mongoose.Types.ObjectId };
export const AuditLog = mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
