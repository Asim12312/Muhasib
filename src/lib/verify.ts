import { randomBytes } from "crypto";
import { AuthToken } from "@/models/AuthToken";
import { sendEmail, templates, appUrl } from "@/lib/email";

/** Create a verification token and email the link. */
export async function issueVerification(userId: string, email: string, origin?: string) {
  await AuthToken.deleteMany({ userId, type: "verify" });
  const token = randomBytes(24).toString("hex");
  await AuthToken.create({ userId, type: "verify", token, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
  const link = `${appUrl(origin)}/verify?token=${token}`;
  await sendEmail({ to: email, subject: "Verify your email · Muhasib", html: templates.verify(link) });
}
