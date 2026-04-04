import { SalesRecord, CustomerSegment } from '../types';

export function segmentCustomers(records: SalesRecord[]): CustomerSegment[] {
  const customerMap = new Map<string, { frequency: number; recency: number; totalSpend: number }>();
  for (const r of records) {
    const c = customerMap.get(r.customer_id) || { frequency: r.purchase_frequency, recency: r.recency_days, totalSpend: 0 };
    c.totalSpend += r.sales_amount;
    customerMap.set(r.customer_id, c);
  }
  const customers = Array.from(customerMap.values());
  const spends = customers.map(c => c.totalSpend).sort((a, b) => a - b);
  const p33 = spends[Math.floor(spends.length * 0.33)];
  const p66 = spends[Math.floor(spends.length * 0.66)];

  const segs = {
    'High Value': { count: 0, total: 0, color: '#10b981' },
    'Medium Value': { count: 0, total: 0, color: '#3b82f6' },
    'Low Value': { count: 0, total: 0, color: '#f59e0b' },
    'Churn Risk': { count: 0, total: 0, color: '#ef4444' },
  };

  for (const c of customers) {
    if (c.recency > 200 && c.frequency < 5) { segs['Churn Risk'].count++; segs['Churn Risk'].total += c.totalSpend; }
    else if (c.totalSpend >= p66) { segs['High Value'].count++; segs['High Value'].total += c.totalSpend; }
    else if (c.totalSpend >= p33) { segs['Medium Value'].count++; segs['Medium Value'].total += c.totalSpend; }
    else { segs['Low Value'].count++; segs['Low Value'].total += c.totalSpend; }
  }

  const total = customers.length;
  return Object.entries(segs).map(([name, d]) => ({
    name, count: d.count,
    percentage: parseFloat(((d.count / total) * 100).toFixed(1)),
    avgValue: d.count > 0 ? parseFloat((d.total / d.count).toFixed(2)) : 0,
    color: d.color,
  }));
}

export function getTopCategory(records: SalesRecord[]): string {
  const map = new Map<string, number>();
  for (const r of records) map.set(r.product_category, (map.get(r.product_category) || 0) + r.sales_amount);
  return [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}

export function getTopRegion(records: SalesRecord[]): string {
  const map = new Map<string, number>();
  for (const r of records) map.set(r.region, (map.get(r.region) || 0) + r.sales_amount);
  return [...map.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
}
