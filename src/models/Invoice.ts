import mongoose, { Schema, InferSchemaType } from "mongoose";

const ItemSchema = new Schema(
  {
    hsCode: { type: String, default: "" },
    description: { type: String, default: "" },
    quantity: { type: Number, default: 1 },
    uom: { type: String, default: "PCS" },
    rate: { type: Number, default: 0 },
    taxRate: { type: Number, default: 18 },
    valueExclTax: { type: Number, default: 0 },
    salesTax: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
  },
  { _id: false }
);

const InvoiceSchema = new Schema(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true }, // the seller SME
    buyerId: { type: Schema.Types.ObjectId, ref: "Buyer", required: true, index: true },
    createdByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    invoiceRef: { type: String, required: true },
    invoiceDate: { type: String, required: true },
    items: { type: [ItemSchema], default: [] },
    totals: {
      valueExclTax: { type: Number, default: 0 },
      salesTax: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },
    status: { type: String, enum: ["draft", "accepted", "rejected"], default: "draft", index: true },
    irn: { type: String, default: "" },
    qrPayload: { type: String, default: "" },
    fbrError: { type: String, default: "" },
    fbrErrorFriendly: { type: String, default: "" },
    submittedAt: { type: Date },
    submitAttempts: { type: Number, default: 0 },
    lastAttemptAt: { type: Date },
    // FBR allows edit/cancel within 72h of acceptance; set on acceptance.
    editableUntil: { type: Date },
  },
  { timestamps: true }
);

export type InvoiceDoc = InferSchemaType<typeof InvoiceSchema> & { _id: mongoose.Types.ObjectId };
export const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", InvoiceSchema);
