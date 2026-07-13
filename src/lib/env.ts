/**
 * Shared, edge-safe environment guards. In production, missing/weak
 * secrets fail loudly instead of silently falling back to a well-known
 * default (which would let anyone forge a valid session).
 */
export function getJwtSecret(): string {
  const s = process.env.JWT_SECRET;
  if (s && s.length >= 16) return s;
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "JWT_SECRET is missing or too short. Set a strong random value (openssl rand -hex 32) in your production environment variables."
    );
  }
  return "dev-only-insecure-secret-do-not-use-in-production";
}
