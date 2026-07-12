/**
 * Penalty estimation for non-compliance with FBR digital invoicing.
 *
 * IMPORTANT: sources conflict on exact figures. These constants reflect the
 * penalty structure widely cited by licensed integrators under Section 33,
 * Sales Tax Act 1990 (as amended) read with the digital invoicing rules
 * (Ch. XIV, Sales Tax Rules 2006; SRO 69(I)/2025, SRO 1413(I)/2025,
 * SRO 1852(I)/2025). Always verify against the current text of the law —
 * this tool is an estimate, not legal advice.
 */
export const PENALTY_RULES = {
  flatFine: 50_000,
  pctOfTax: 0.02,
  perDayLate: 25_000,
  lastVerified: "2026-07",
};

export interface PenaltyInput {
  taxInvolved: number;
  daysLate: number;
}

export interface PenaltyBreakdown {
  flatComponent: number;
  pctComponent: number;
  issuePenalty: number;
  latePenalty: number;
  total: number;
}

export function computePenalty({ taxInvolved, daysLate }: PenaltyInput): PenaltyBreakdown {
  const flatComponent = PENALTY_RULES.flatFine;
  const pctComponent = Math.round(taxInvolved * PENALTY_RULES.pctOfTax);
  const issuePenalty = Math.max(flatComponent, pctComponent);
  const latePenalty = Math.max(0, Math.round(daysLate)) * PENALTY_RULES.perDayLate;
  return { flatComponent, pctComponent, issuePenalty, latePenalty, total: issuePenalty + latePenalty };
}

export function formatPKR(n: number) {
  return "PKR " + n.toLocaleString("en-PK");
}
