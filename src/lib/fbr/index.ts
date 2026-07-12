import { MockFbrAdapter } from "./mock";
import { PralFbrAdapter } from "./pral";
import { FbrAdapter } from "./types";

export function getFbrAdapter(cfg: { fbrMode?: string; fbrToken?: string; pralApiUrl?: string }): FbrAdapter {
  if (cfg.fbrMode === "pral") {
    const url = cfg.pralApiUrl || process.env.PRAL_API_URL || "";
    return new PralFbrAdapter(url, cfg.fbrToken || "");
  }
  return new MockFbrAdapter();
}
export * from "./types";
