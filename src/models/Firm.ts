import mongoose, { Schema, InferSchemaType } from "mongoose";

/**
 * The tenant. A consultancy firm managing many SME clients.
 * The firm is the paying customer; staff (User) belong to it.
 */
const FirmSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    principalUserId: { type: Schema.Types.ObjectId, ref: "User" },
    billingEmail: { type: String, default: "" },
    phone: { type: String, default: "" },
    // Optional firm-level PRAL Digital Invoicing API endpoint (overrides env).
    pralApiUrl: { type: String, default: "" },
    plan: {
      tier: { type: String, enum: ["trial", "starter", "growth", "scale"], default: "trial" },
      status: { type: String, enum: ["active", "past_due", "cancelled"], default: "active" },
      renewsAt: { type: Date },
    },
  },
  { timestamps: true }
);

export type FirmDoc = InferSchemaType<typeof FirmSchema> & { _id: mongoose.Types.ObjectId };
export const Firm = mongoose.models.Firm || mongoose.model("Firm", FirmSchema);
