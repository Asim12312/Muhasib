export type ItemIn = {
  hsCode?: string; description?: string; quantity?: number | string; uom?: string;
  rate?: number | string; taxRate?: number | string;
};

export function buildItems(items: ItemIn[]) {
  return items.map((it) => {
    const quantity = Number(it.quantity) || 0;
    const rate = Number(it.rate) || 0;
    const taxRate = it.taxRate === undefined || it.taxRate === "" ? 18 : Number(it.taxRate) || 0;
    const valueExclTax = Math.round(quantity * rate * 100) / 100;
    const salesTax = Math.round(valueExclTax * (taxRate / 100) * 100) / 100;
    return {
      hsCode: String(it.hsCode || ""),
      description: String(it.description || ""),
      quantity,
      uom: String(it.uom || "PCS"),
      rate,
      taxRate,
      valueExclTax,
      salesTax,
      totalValue: Math.round((valueExclTax + salesTax) * 100) / 100,
    };
  });
}

export function totalsOf(items: ReturnType<typeof buildItems>) {
  const valueExclTax = items.reduce((s, i) => s + i.valueExclTax, 0);
  const salesTax = items.reduce((s, i) => s + i.salesTax, 0);
  return {
    valueExclTax: Math.round(valueExclTax * 100) / 100,
    salesTax: Math.round(salesTax * 100) / 100,
    total: Math.round((valueExclTax + salesTax) * 100) / 100,
  };
}
