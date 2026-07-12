import mongoose, { Schema, InferSchemaType } from "mongoose";

/**
 * A customer of a managed SME (Client). These are the buyers that appear
 * on the SME's invoices. Scoped to both the firm and the specific SME.
 */
const BuyerSchema = new Schema(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    name: { type: String, required: true },
    ntnOrCnic: { type: String, default: "" },
    registrationType: { type: String, enum: ["registered", "unregistered"], default: "registered" },
    address: { type: String, default: "" },
    province: { type: String, default: "Punjab" },
  },
  { timestamps: true }
);

export type BuyerDoc = InferSchemaType<typeof BuyerSchema> & { _id: mongoose.Types.ObjectId };
export const Buyer = mongoose.models.Buyer || mongoose.model("Buyer", BuyerSchema);
