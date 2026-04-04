import { SalesRecord, Anomaly } from '../types';
import { aggregateDailySales } from './forecastingService';

export function detectAnomalies(records: SalesRecord[]): Anomaly[] {
  const daily = aggregateDailySales(records);
  const amounts = daily.map(d => d.amount);
  const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const sd = Math.sqrt(amounts.reduce((s, v) => s + (v - avg) ** 2, 0) / amounts.length);

  return daily
    .map(d => ({ d, z: sd !== 0 ? (d.amount - avg) / sd : 0 }))
    .filter(({ z }) => Math.abs(z) >= 2.0)
    .map(({ d, z }) => ({
      date: d.date, amount: d.amount,
      type: z > 0 ? 'spike' as const : 'drop' as const,
      deviation: parseFloat((d.amount - avg).toFixed(2)),
      zScore: parseFloat(z.toFixed(2)),
    }))
    .sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore))
    .slice(0, 20);
}
