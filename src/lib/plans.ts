/** Subscription tiers for firms. Client limit is enforced on SME creation. */
export type Tier = "trial" | "starter" | "growth" | "scale";

export const PLANS: Record<Tier, { label: string; clientLimit: number; pricePkr: number; blurb: string }> = {
  trial:   { label: "Trial",   clientLimit: 3,   pricePkr: 0,      blurb: "Kick the tyres with up to 3 clients." },
  starter: { label: "Starter", clientLimit: 25,  pricePkr: 9_000,  blurb: "Solo consultants and small practices." },
  growth:  { label: "Growth",  clientLimit: 100, pricePkr: 25_000, blurb: "Growing firms with a filing team." },
  scale:   { label: "Scale",   clientLimit: 500, pricePkr: 60_000, blurb: "Established practices at volume." },
};

export function clientLimitFor(tier?: string): number {
  return PLANS[(tier as Tier) in PLANS ? (tier as Tier) : "trial"].clientLimit;
}
