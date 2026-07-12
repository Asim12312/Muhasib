import mongoose, { Schema, InferSchemaType } from "mongoose";

/**
 * A managed SME. This is the firm's "client". Each one is a distinct
 * seller identity (its own NTN + FBR connection) that the firm files for.
 * NOTE: the SME's own customers are modelled separately as `Buyer`.
 */
const ClientSchema = new Schema(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true, index: true },
    businessName: { type: String, required: true, trim: true },
    ntn: { type: String, default: "" },
    strn: { type: String, default: "" },
    // Legal form / registration category
    category: {
      type: String,
      enum: ["public_company", "private_company", "individual", "aop"],
      default: "private_company",
    },
    turnoverTier: { type: String, enum: ["", "tier1", "tier2", "tier3"], default: "" },
    sector: { type: String, default: "" },
    address: { type: String, default: "" },
    province: { type: String, default: "Punjab" },
    salesTaxRegistered: { type: Boolean, default: true },
    filingFrequency: { type: String, enum: ["monthly", "quarterly"], default: "monthly" },

    // FBR connection — per SME, not per staff user
    fbrMode: { type: String, enum: ["sandbox", "pral"], default: "sandbox" },
    fbrToken: { type: String, default: "" },

    // Workflow
    status: {
      type: String,
      enum: ["onboarding", "active", "pending_docs", "at_risk", "dormant"],
      default: "onboarding",
      index: true,
    },
    assignedTo: { type: [Schema.Types.ObjectId], ref: "User", default: [] },
    contact: {
      name: { type: String, default: "" },
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

export type ClientDoc = InferSchemaType<typeof ClientSchema> & { _id: mongoose.Types.ObjectId };
export const Client = mongoose.models.Client || mongoose.model("Client", ClientSchema);
