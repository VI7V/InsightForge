export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  plan: string;
}

export interface CSVHistory {
  id: string;
  fileName: string;
  uploadedAt: string;
  rowCount: number;
  totalRevenue: number;
  growthRate: number;
  status: string;
}

export interface DailySales { date: string; amount: number; month: string; }
export interface MonthlyForecast { month: string; predicted: number; actual?: number; isForecasted: boolean; }
export interface Anomaly { date: string; amount: number; type: string; deviation: number; zScore: number; }
export interface CustomerSegment { name: string; count: number; percentage: number; avgValue: number; color: string; }
export interface SentimentResult { positive: number; negative: number; neutral: number; overallScore: number; }
export interface RegionBreakdown { region: string; revenue: number; count: number; }
export interface CategoryBreakdown { category: string; revenue: number; count: number; }
export interface ChannelBreakdown { channel: string; revenue: number; percentage: number; }

export interface DashboardData {
  id: string;
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

export type Theme = 'dark' | 'light';
export type AppView = 'landing' | 'auth' | 'upload' | 'dashboard' | 'sales' | 'segmentation' | 'sentiment' | 'insights';
