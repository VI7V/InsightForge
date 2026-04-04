import { v4 as uuidv4 } from 'uuid';
import { GraphQLError } from 'graphql';
import { registerUser, loginUser, getUserById, verifyToken } from '../services/authService';
import { parseCSV } from '../services/fileService';
import { aggregateDailySales, forecastNextPeriods, calculateGrowthRate, getRegionBreakdown, getCategoryBreakdown, getChannelBreakdown, getPeakMonth } from '../services/forecastingService';
import { detectAnomalies } from '../services/anomalyService';
import { segmentCustomers, getTopCategory, getTopRegion } from '../services/segmentationService';
import { analyzeSentiment, extractKeyThemes } from '../services/feedbackService';
import { generateSalesInsights, generateAnomalyExplanation, generateMarketingStrategies, generateFeedbackSummary } from '../services/aiService';
import { saveHistory, getUserHistory, deleteHistory } from '../services/historyService';
import { storeJSON, getJSON } from '../utils/storage';
import { DashboardData } from '../types';

interface Context {
  userId?: string;
}

function requireAuth(ctx: Context): string {
  if (!ctx.userId) throw new GraphQLError('Authentication required.', { extensions: { code: 'UNAUTHENTICATED' } });
  return ctx.userId;
}

export const resolvers = {
  Query: {
    health: () => 'InsightForge API v2.0 running',
    me: async (_: unknown, __: unknown, ctx: Context) => {
      if (!ctx.userId) return null;
      return getUserById(ctx.userId);
    },
    getDashboardData: async (_: unknown, { id }: { id: string }, ctx: Context) => {
      requireAuth(ctx);
      return getJSON<DashboardData>(`dashboard:${ctx.userId}:${id}`);
    },
    getUserHistory: async (_: unknown, __: unknown, ctx: Context) => {
      requireAuth(ctx);
      return getUserHistory(ctx.userId!);
    },
  },

  Mutation: {
    register: async (_: unknown, { email, password, name }: { email: string; password: string; name: string }) => {
      if (!email || !password || !name) throw new GraphQLError('All fields required.');
      if (password.length < 6) throw new GraphQLError('Password must be at least 6 characters.');
      return registerUser(email, password, name);
    },

    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      return loginUser(email, password);
    },

    uploadFile: async (_: unknown, { fileContent, fileName }: { fileContent: string; fileName: string }, ctx: Context) => {
      requireAuth(ctx);
      const id = uuidv4();
      try {
        let buffer: Buffer;
        try { buffer = Buffer.from(fileContent, 'base64'); }
        catch { buffer = Buffer.from(fileContent, 'utf-8'); }

        const records = parseCSV(buffer);
        const [salesTrend, forecast, anomalies, segments] = await Promise.all([
          Promise.resolve(aggregateDailySales(records)),
          Promise.resolve(forecastNextPeriods(records)),
          Promise.resolve(detectAnomalies(records)),
          Promise.resolve(segmentCustomers(records)),
        ]);

        const sentiment = analyzeSentiment(records);
        const themes = extractKeyThemes(records);
        const topCategory = getTopCategory(records);
        const topRegion = getTopRegion(records);
        const growthRate = calculateGrowthRate(records);
        const regionBreakdown = getRegionBreakdown(records);
        const categoryBreakdown = getCategoryBreakdown(records);
        const channelBreakdown = getChannelBreakdown(records);
        const peakMonth = getPeakMonth(records);
        const totalRevenue = records.reduce((s, r) => s + r.sales_amount, 0);
        const uniqueCustomers = new Set(records.map(r => r.customer_id)).size;

        const [salesInsights, anomalyExplanation, marketingStrategies, feedbackSummary] = await Promise.all([
          generateSalesInsights(salesTrend, forecast, totalRevenue, growthRate, regionBreakdown, categoryBreakdown),
          generateAnomalyExplanation(anomalies),
          generateMarketingStrategies(segments, topCategory, topRegion),
          generateFeedbackSummary(sentiment, themes, records.filter(r => r.feedback_text).length),
        ]);

        const dashboard: DashboardData = {
          id, userId: ctx.userId!, fileName,
          salesTrend, forecast, anomalies, salesInsights, anomalyExplanation,
          customerSegments: segments, marketingStrategies, sentiment, feedbackSummary,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          avgOrderValue: parseFloat((totalRevenue / records.length).toFixed(2)),
          totalCustomers: uniqueCustomers,
          topCategory, topRegion, growthRate,
          regionBreakdown, categoryBreakdown, channelBreakdown, peakMonth,
          totalOrders: records.length,
          revenuePerCustomer: parseFloat((totalRevenue / uniqueCustomers).toFixed(2)),
          processedAt: new Date().toISOString(),
        };

        await storeJSON(`dashboard:${ctx.userId}:${id}`, dashboard, 60 * 60 * 24 * 90);
        await saveHistory({
          id, userId: ctx.userId!, fileName,
          uploadedAt: dashboard.processedAt,
          rowCount: records.length,
          totalRevenue: dashboard.totalRevenue,
          growthRate: dashboard.growthRate,
          status: 'ready',
        });

        return { id, status: 'success', message: `Processed ${records.length} records` };
      } catch (err) {
        return { id, status: 'error', message: err instanceof Error ? err.message : 'Processing failed' };
      }
    },

    deleteHistory: async (_: unknown, { historyId }: { historyId: string }, ctx: Context) => {
      requireAuth(ctx);
      await deleteHistory(ctx.userId!, historyId);
      return true;
    },
  },
};

export async function buildContext(req: { headers: { authorization?: string } }): Promise<Context> {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  if (!token) return {};
  const payload = verifyToken(token);
  return payload ? { userId: payload.userId } : {};
}
