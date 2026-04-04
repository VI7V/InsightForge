export const typeDefs = `#graphql
  type User {
    id: String!
    email: String!
    name: String!
    createdAt: String!
    plan: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type CSVHistory {
    id: String!
    fileName: String!
    uploadedAt: String!
    rowCount: Int!
    totalRevenue: Float!
    growthRate: Float!
    status: String!
  }

  type DailySales { date: String! amount: Float! month: String! }
  type MonthlyForecast { month: String! predicted: Float! actual: Float isForecasted: Boolean! }
  type Anomaly { date: String! amount: Float! type: String! deviation: Float! zScore: Float! }
  type CustomerSegment { name: String! count: Int! percentage: Float! avgValue: Float! color: String! }
  type SentimentResult { positive: Float! negative: Float! neutral: Float! overallScore: Float! }
  type RegionBreakdown { region: String! revenue: Float! count: Int! }
  type CategoryBreakdown { category: String! revenue: Float! count: Int! }
  type ChannelBreakdown { channel: String! revenue: Float! percentage: Float! }

  type DashboardData {
    id: String!
    fileName: String!
    salesTrend: [DailySales!]!
    forecast: [MonthlyForecast!]!
    anomalies: [Anomaly!]!
    salesInsights: String!
    anomalyExplanation: String!
    customerSegments: [CustomerSegment!]!
    marketingStrategies: String!
    sentiment: SentimentResult!
    feedbackSummary: String!
    totalRevenue: Float!
    avgOrderValue: Float!
    totalCustomers: Int!
    topCategory: String!
    topRegion: String!
    growthRate: Float!
    regionBreakdown: [RegionBreakdown!]!
    categoryBreakdown: [CategoryBreakdown!]!
    channelBreakdown: [ChannelBreakdown!]!
    peakMonth: String!
    totalOrders: Int!
    revenuePerCustomer: Float!
    processedAt: String!
  }

  type UploadResult { id: String! status: String! message: String! }

  type Query {
    me: User
    getDashboardData(id: String!): DashboardData
    getUserHistory: [CSVHistory!]!
    health: String!
  }

  type Mutation {
    register(email: String!, password: String!, name: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    uploadFile(fileContent: String!, fileName: String!): UploadResult!
    deleteHistory(historyId: String!): Boolean!
  }
`;
