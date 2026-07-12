import mongoose, { Schema, InferSchemaType } from "mongoose";

/**
 * A staff member of a firm. Not a business identity of its own — the
 * seller identity now lives on each managed Client (SME). Roles:
 *  - principal: firm owner. All clients, billing, staff management.
 *  - manager:   only assigned clients; no billing/staff management.
 *  - associate: only assigned clients; no delete/billing/staff.
 */
const UserSchema = new Schema(
  {
    firmId: { type: Schema.Types.ObjectId, ref: "Firm", required: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["principal", "manager", "associate"], default: "associate" },
    status: { type: String, enum: ["active", "disabled"], default: "active" },
  },
  { timestamps: true }
);

export type Role = "principal" | "manager" | "associate";
export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId };
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
