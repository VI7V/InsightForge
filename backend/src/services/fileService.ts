import { parse } from 'csv-parse/sync';
import { SalesRecord } from '../types';

export function parseCSV(buffer: Buffer): SalesRecord[] {
  const content = buffer.toString('utf-8');
  const records = parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    cast: false,
  }) as Record<string, string>[];

  const parsed: SalesRecord[] = [];
  for (const row of records) {
    const date = row['date'] || row['Date'] || row['DATE'] || '';
    const salesAmount = parseFloat(row['sales_amount'] || row['Sales Amount'] || row['amount'] || '0');
    if (!date || isNaN(salesAmount)) continue;
    parsed.push({
      date,
      customer_id: row['customer_id'] || row['Customer ID'] || `C${Math.random()}`,
      customer_name: row['customer_name'] || row['Customer Name'] || 'Unknown',
      sales_amount: salesAmount,
      product_category: row['product_category'] || row['Category'] || 'General',
      region: row['region'] || row['Region'] || 'Unknown',
      purchase_frequency: parseInt(row['purchase_frequency'] || '1', 10) || 1,
      recency_days: parseInt(row['recency_days'] || '30', 10) || 30,
      customer_lifetime_value: parseFloat(row['customer_lifetime_value'] || '0') || 0,
      feedback_text: row['feedback_text'] || row['Feedback'] || row['feedback'] || '',
      channel: row['channel'] || row['Channel'] || 'Online',
    });
  }
  if (parsed.length === 0) throw new Error('No valid records found. Ensure CSV has date and sales_amount columns.');
  return parsed.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
