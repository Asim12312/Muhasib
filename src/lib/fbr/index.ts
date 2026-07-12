import { MockFbrAdapter } from "./mock";
import { PralFbrAdapter } from "./pral";
import { FbrAdapter } from "./types";

export function getFbrAdapter(user: { fbrMode?: string; fbrToken?: string }): FbrAdapter {
  if (user.fbrMode === "pral") {
    return new PralFbrAdapter(process.env.PRAL_API_URL || "", user.fbrToken || "");
  }
  return new MockFbrAdapter();
}
export * from "./types";
