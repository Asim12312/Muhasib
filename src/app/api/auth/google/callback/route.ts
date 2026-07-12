import { NextRequest, NextResponse } from "next/server";
import { decodeJwt } from "jose";
import { dbConnect } from "@/lib/db";
import { User } from "@/models/User";
import { Firm } from "@/models/Firm";
import { createSession } from "@/lib/auth";

/** Google OAuth callback: exchange the code, then sign in or auto-create a
 *  firm for a first-time Google user (principal). */
export async function GET(req: NextRequest) {
  const origin = process.env.APP_URL || req.nextUrl.origin;
  const fail = (msg: string) => NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(msg)}`);

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const savedState = req.cookies.get("g_oauth_state")?.value;
  if (!code || !state || state !== savedState) return fail("Google sign-in failed. Please try again.");

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("Google sign-in is not configured.");

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: `${origin}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!tokenRes.ok) return fail("Could not complete Google sign-in.");
    const tokens = (await tokenRes.json()) as { id_token?: string };
    if (!tokens.id_token) return fail("Google did not return an identity token.");

    const claims = decodeJwt(tokens.id_token) as { email?: string; email_verified?: boolean; name?: string; sub?: string };
    const email = (claims.email || "").toLowerCase();
    if (!email) return fail("Google account has no email.");

    await dbConnect();
    let user = await User.findOne({ email });
    if (!user) {
      // First-time Google user → auto-create a firm with them as principal.
      const firm = await Firm.create({ name: claims.name ? `${claims.name}'s Firm` : "My Firm", billingEmail: email });
      user = await User.create({
        firmId: firm._id,
        name: claims.name || email.split("@")[0],
        email,
        role: "principal",
        authProvider: "google",
        googleId: claims.sub || "",
        emailVerified: true,
      });
      firm.principalUserId = user._id;
      await firm.save();
    } else if (user.status === "disabled") {
      return fail("This account has been disabled.");
    } else if (!user.emailVerified) {
      user.emailVerified = true; // Google proves the address
      if (!user.googleId) user.googleId = claims.sub || "";
      await user.save();
    }

    await createSession(user._id.toString());
    const res = NextResponse.redirect(`${origin}/dashboard`);
    res.cookies.delete("g_oauth_state");
    return res;
  } catch {
    return fail("Google sign-in failed. Please try again.");
  }
}
