export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
  plan: 'free' | 'pro';
}

export interface CSVHistory {
  id: string;
  userId: string;
  fileName: string;
  uploadedAt: string;
  rowCount: number;
  totalRevenue: number;
  growthRate: number;
  status: 'ready';
}

export interface SalesRecord {
  date: string;
  customer_id: string;
  customer_name: string;
  sales_amount: number;
  product_category: string;
  region: string;
  purchase_frequency: number;
  recency_days: number;
  customer_lifetime_value: number;
  feedback_text: string;
  channel: string;
}

export interface DailySales {
  date: string;
  amount: number;
  month: string;
}

export interface MonthlyForecast {
  month: string;
  predicted: number;
  actual?: number;
  isForecasted: boolean;
}

export interface Anomaly {
  date: string;
  amount: number;
  type: 'spike' | 'drop';
  deviation: number;
  zScore: number;
}

export interface CustomerSegment {
  name: string;
  count: number;
  percentage: number;
  avgValue: number;
  color: string;
}

export interface SentimentResult {
  positive: number;
  negative: number;
  neutral: number;
  overallScore: number;
}

export interface RegionBreakdown {
  region: string;
  revenue: number;
  count: number;
}

export interface CategoryBreakdown {
  category: string;
  revenue: number;
  count: number;
}

export interface ChannelBreakdown {
  channel: string;
  revenue: number;
  percentage: number;
}

export interface DashboardData {
  id: string;
  userId: string;
  fileName: string;
  salesTrend: DailySales[];
  forecast: MonthlyForecast[];
  anomalies: Anomaly[];
  salesInsights: string;
  anomalyExplanation: string;
  customerSegments: CustomerSegment[];
  marketingStrategies: string;
  sentiment: SentimentResult;
  feedbackSummary: string;
  totalRevenue: number;
  avgOrderValue: number;
  totalCustomers: number;
  topCategory: string;
  topRegion: string;
  growthRate: number;
  regionBreakdown: RegionBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
  channelBreakdown: ChannelBreakdown[];
  peakMonth: string;
  totalOrders: number;
  revenuePerCustomer: number;
  processedAt: string;
}

export interface AuthPayload {
  token: string;
  user: Omit<User, 'passwordHash'>;
}
