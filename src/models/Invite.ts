import mongoose, { Schema, InferSchemaType } from "mongoose";

/**
 * A pending staff invitation. The principal creates one; the invitee
 * opens /invite/<token> and sets their name + password to join the firm.
 */
const InviteSchema = new Schema(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: { type: String, enum: ["principal", "manager", "associate"], default: "associate" },
    token: { type: String, required: true, unique: true, index: true },
    invitedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["pending", "accepted", "revoked"], default: "pending" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export type InviteDoc = InferSchemaType<typeof InviteSchema> & { _id: mongoose.Types.ObjectId };
export const Invite = mongoose.models.Invite || mongoose.model("Invite", InviteSchema);
