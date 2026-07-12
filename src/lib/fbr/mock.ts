import { FbrAdapter, FbrInvoicePayload, FbrSubmitResult } from "./types";

/**
 * Sandbox adapter that mimics PRAL Digital Invoicing API behaviour:
 * validates the payload the way FBR does, then issues a 22-digit
 * invoice number and QR payload. Swap for the PRAL adapter in
 * production by setting PRAL_API_URL and an API token in Settings.
 */
export class MockFbrAdapter implements FbrAdapter {
  name = "sandbox";

  async submitInvoice(p: FbrInvoicePayload): Promise<FbrSubmitResult> {
    const errors: string[] = [];
    if (!/^\d{7}(\d{6})?$/.test(p.seller.ntn.replace(/-/g, "")))
      errors.push("Seller NTN must be 7 digits (or 13-digit CNIC).");
    if (!p.buyer.name) errors.push("Buyer name is required.");
    if (p.buyer.registrationType === "registered" && !p.buyer.ntnOrCnic)
      errors.push("Registered buyers require an NTN/CNIC.");
    if (p.items.length === 0) errors.push("At least one line item is required.");
    for (const [i, it] of p.items.entries()) {
      if (!it.hsCode) errors.push(`Item ${i + 1}: HS code is required.`);
      if (!(it.quantity > 0)) errors.push(`Item ${i + 1}: quantity must be positive.`);
    }
    if (errors.length) return { ok: false, error: errors.join(" ") };

    // 22-digit number: timestamp(13) + 9 random digits
    const irn =
      Date.now().toString().padStart(13, "0") +
      Math.floor(Math.random() * 1e9).toString().padStart(9, "0");
    const qrPayload = JSON.stringify({
      irn,
      sellerNtn: p.seller.ntn,
      date: p.invoiceDate,
      total: p.totals.total,
    });
    return { ok: true, irn, qrPayload };
  }
}
