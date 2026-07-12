/**
 * Translate raw FBR/PRAL rejection text into a plain-English, actionable
 * message a junior accountant can act on without decoding FBR error codes.
 */
const PATTERNS: { test: RegExp; message: string }[] = [
  { test: /ntn|strn|registration number/i, message: "FBR rejected the seller's NTN/STRN. Check the client's tax number in their Settings." },
  { test: /buyer.*(ntn|cnic|registration)/i, message: "The buyer's NTN/CNIC is missing or invalid. Registered buyers must have a valid tax number." },
  { test: /hs\s?code|hscode/i, message: "One or more HS codes are missing or not recognised by FBR. Verify the HS code for each line item." },
  { test: /rate|tax rate|percentage/i, message: "A tax rate on the invoice isn't accepted for that item. Confirm the correct sales-tax rate." },
  { test: /duplicate|already exists|already submitted/i, message: "FBR already has an invoice with this reference. Use a new invoice number." },
  { test: /date/i, message: "The invoice date was rejected. It can't be in the future or outside the allowed filing window." },
  { test: /token|unauthor|401|forbidden|403/i, message: "FBR rejected the credentials. Update the client's PRAL bearer token in their Settings." },
  { test: /timeout|could not reach|network|econn|fetch failed/i, message: "Couldn't reach the FBR/PRAL gateway. This is usually temporary — retry in a few minutes." },
  { test: /uom|unit of measure/i, message: "A unit of measure (UoM) isn't recognised by FBR. Use a standard UoM such as PCS, KG or JOB." },
];

export function friendlyFbrError(raw: string): string {
  if (!raw) return "FBR rejected the invoice without a specific reason. Review the fields and retry.";
  for (const p of PATTERNS) if (p.test.test(raw)) return p.message;
  // Fall back to the sandbox's own readable validation text if it's short.
  if (raw.length < 200) return raw;
  return "FBR rejected the invoice. Review the highlighted fields and retry.";
}
