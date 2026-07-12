import mongoose, { Schema, InferSchemaType } from "mongoose";

/**
 * A file in a managed SME's document vault. For MVP the bytes are stored
 * inline (base64 Buffer) with a hard size cap; swap for S3/GridFS when
 * volume grows. FBR record retention is 6 years — surfaced in the UI.
 */
const DocumentSchema = new Schema(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true, index: true },
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true, index: true },
    name: { type: String, required: true },
    docType: {
      type: String,
      enum: ["ntn_cert", "strn_cert", "cnic", "bank_letter", "prior_return", "notice", "other"],
      default: "other",
    },
    year: { type: String, default: "" },
    mimeType: { type: String, default: "application/octet-stream" },
    size: { type: Number, default: 0 },
    data: { type: Buffer, required: true, select: false },
    uploadedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type DocumentDoc = InferSchemaType<typeof DocumentSchema> & { _id: mongoose.Types.ObjectId };
export const StoredDocument =
  mongoose.models.StoredDocument || mongoose.model("StoredDocument", DocumentSchema);
