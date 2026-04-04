import { SalesRecord, DailySales, MonthlyForecast, RegionBreakdown, CategoryBreakdown, ChannelBreakdown } from '../types';

export function aggregateDailySales(records: SalesRecord[]): DailySales[] {
  const map = new Map<string, number>();
  for (const r of records) map.set(r.date, (map.get(r.date) || 0) + r.sales_amount);
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, amount]) => ({ date, amount: parseFloat(amount.toFixed(2)), month: date.substring(0, 7) }));
}

export function aggregateMonthlySales(daily: DailySales[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const d of daily) map.set(d.month, (map.get(d.month) || 0) + d.amount);
  return map;
}

export function forecastNextPeriods(records: SalesRecord[]): MonthlyForecast[] {
  const daily = aggregateDailySales(records);
  const monthly = aggregateMonthlySales(daily);
  const months = Array.from(monthly.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  const values = months.map(([, v]) => v);
  const n = values.length;
  const xMean = (n - 1) / 2;
  const yMean = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (i - xMean) * (values[i] - yMean); den += (i - xMean) ** 2; }
  const slope = den !== 0 ? num / den : 0;
  const intercept = yMean - slope * xMean;

  const result: MonthlyForecast[] = months.map(([month, actual], i) => ({
    month, predicted: parseFloat((intercept + slope * i).toFixed(2)),
    actual: parseFloat(actual.toFixed(2)), isForecasted: false,
  }));

  const lastMonth = months[months.length - 1][0];
  for (let f = 1; f <= 3; f++) {
    const [yr, mo] = lastMonth.split('-').map(Number);
    const d = new Date(yr, mo - 1 + f, 1);
    const futureMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    result.push({ month: futureMonth, predicted: parseFloat(Math.max(0, intercept + slope * (n + f - 1)).toFixed(2)), isForecasted: true });
  }
  return result;
}

export function calculateGrowthRate(records: SalesRecord[]): number {
  const daily = aggregateDailySales(records);
  const monthly = aggregateMonthlySales(daily);
  const months = Array.from(monthly.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  if (months.length < 2) return 0;
  const first = months[0][1], last = months[months.length - 1][1];
  return first === 0 ? 0 : parseFloat((((last - first) / first) * 100).toFixed(2));
}

export function getRegionBreakdown(records: SalesRecord[]): RegionBreakdown[] {
  const map = new Map<string, { revenue: number; count: number }>();
  for (const r of records) {
    const e = map.get(r.region) || { revenue: 0, count: 0 };
    e.revenue += r.sales_amount; e.count++;
    map.set(r.region, e);
  }
  return Array.from(map.entries()).map(([region, d]) => ({ region, revenue: parseFloat(d.revenue.toFixed(2)), count: d.count }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function getCategoryBreakdown(records: SalesRecord[]): CategoryBreakdown[] {
  const map = new Map<string, { revenue: number; count: number }>();
  for (const r of records) {
    const e = map.get(r.product_category) || { revenue: 0, count: 0 };
    e.revenue += r.sales_amount; e.count++;
    map.set(r.product_category, e);
  }
  return Array.from(map.entries()).map(([category, d]) => ({ category, revenue: parseFloat(d.revenue.toFixed(2)), count: d.count }))
    .sort((a, b) => b.revenue - a.revenue);
}

export function getChannelBreakdown(records: SalesRecord[]): ChannelBreakdown[] {
  const total = records.reduce((s, r) => s + r.sales_amount, 0);
  const map = new Map<string, number>();
  for (const r of records) map.set(r.channel, (map.get(r.channel) || 0) + r.sales_amount);
  return Array.from(map.entries()).map(([channel, revenue]) => ({
    channel, revenue: parseFloat(revenue.toFixed(2)), percentage: parseFloat(((revenue / total) * 100).toFixed(1))
  })).sort((a, b) => b.revenue - a.revenue);
}

export function getPeakMonth(records: SalesRecord[]): string {
  const daily = aggregateDailySales(records);
  const monthly = aggregateMonthlySales(daily);
  let peak = '', max = 0;
  for (const [m, v] of monthly) { if (v > max) { max = v; peak = m; } }
  return peak;
}
