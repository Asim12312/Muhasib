import { FbrAdapter, FbrInvoicePayload, FbrSubmitResult } from "./types";

/**
 * Adapter for the PRAL Digital Invoicing API. Endpoint and payload
 * shape follow the published DI integration spec; you must obtain
 * sandbox credentials from PRAL/FBR (IRIS portal) and complete
 * scenario testing before production use.
 */
export class PralFbrAdapter implements FbrAdapter {
  name = "pral";
  constructor(private apiUrl: string, private token: string) {}

  async submitInvoice(p: FbrInvoicePayload): Promise<FbrSubmitResult> {
    if (!this.apiUrl || !this.token) {
      return {
        ok: false,
        error:
          "PRAL API not configured. Set PRAL_API_URL and your bearer token in Settings, or use sandbox mode.",
      };
    }
    try {
      const res = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.token}`,
        },
        body: JSON.stringify({
          invoiceType: "Sale Invoice",
          invoiceDate: p.invoiceDate,
          sellerNTNCNIC: p.seller.ntn,
          sellerBusinessName: p.seller.businessName,
          sellerProvince: p.seller.province,
          sellerAddress: p.seller.address,
          buyerNTNCNIC: p.buyer.ntnOrCnic,
          buyerBusinessName: p.buyer.name,
          buyerProvince: p.buyer.province,
          buyerAddress: p.buyer.address,
          buyerRegistrationType:
            p.buyer.registrationType === "registered" ? "Registered" : "Unregistered",
          invoiceRefNo: p.invoiceRef,
          items: p.items.map((it) => ({
            hsCode: it.hsCode,
            productDescription: it.description,
            rate: `${it.taxRate}%`,
            uoM: it.uom,
            quantity: it.quantity,
            valueSalesExcludingST: it.valueExclTax,
            salesTaxApplicable: it.salesTax,
            totalValues: it.totalValue,
          })),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        return { ok: false, error: `PRAL API error ${res.status}: ${JSON.stringify(data)}` };
      }
      const irn = (data.invoiceNumber || data.irn) as string | undefined;
      if (!irn) return { ok: false, error: "PRAL API accepted the request but returned no invoice number." };
      return { ok: true, irn, qrPayload: JSON.stringify({ irn }) };
    } catch (e) {
      return { ok: false, error: `Could not reach PRAL API: ${(e as Error).message}` };
    }
  }
}
