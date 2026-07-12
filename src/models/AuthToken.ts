import mongoose, { Schema, InferSchemaType } from "mongoose";

/** One-time tokens for email verification and password reset. */
const AuthTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["verify", "reset"], required: true },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export type AuthTokenDoc = InferSchemaType<typeof AuthTokenSchema> & { _id: mongoose.Types.ObjectId };
export const AuthToken = mongoose.models.AuthToken || mongoose.model("AuthToken", AuthTokenSchema);
