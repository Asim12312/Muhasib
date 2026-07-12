export interface FbrLineItem {
  hsCode: string;
  description: string;
  quantity: number;
  uom: string;
  rate: number; // unit price excl. tax
  taxRate: number; // e.g. 18 for 18%
  valueExclTax: number;
  salesTax: number;
  totalValue: number;
}

export interface FbrInvoicePayload {
  invoiceRef: string;
  invoiceDate: string; // YYYY-MM-DD
  seller: { ntn: string; businessName: string; address: string; province: string };
  buyer: {
    ntnOrCnic: string;
    name: string;
    address: string;
    province: string;
    registrationType: "registered" | "unregistered";
  };
  items: FbrLineItem[];
  totals: { valueExclTax: number; salesTax: number; total: number };
}

export interface FbrSubmitResult {
  ok: boolean;
  irn?: string; // 22-digit FBR invoice number
  qrPayload?: string;
  error?: string;
}

export interface FbrAdapter {
  name: string;
  submitInvoice(payload: FbrInvoicePayload): Promise<FbrSubmitResult>;
}
