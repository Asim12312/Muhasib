/** FBR invoice reference number (IRN/USIN) format checks. */
export interface IrnCheck {
  ok: boolean;
  issues: string[];
  normalized: string;
}

export function validateIrn(raw: string): IrnCheck {
  const normalized = raw.replace(/[\s-]/g, "");
  const issues: string[] = [];
  if (normalized.length === 0) {
    return { ok: false, issues: ["Enter an invoice number to check."], normalized };
  }
  if (!/^\d+$/.test(normalized)) {
    issues.push("FBR invoice numbers contain digits only (spaces and dashes are ignored).");
  }
  if (normalized.length !== 22) {
    issues.push(
      "Expected 22 digits, got " + normalized.length + ". FBR digital invoices are assigned a 22-digit number on successful transmission."
    );
  }
  return { ok: issues.length === 0, issues, normalized };
}
