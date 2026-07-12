"use client";
import { useLinkStatus } from "next/link";

/** Shows a spinner while the parent <Link> navigation is pending. Must be
 *  rendered as a descendant of a next/link <Link>. */
export function LinkSpinner() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return <span className="spinner ml-auto !w-3.5 !h-3.5" aria-hidden />;
}
