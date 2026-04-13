import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:4000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('insightforge_token');
  return { headers: { ...headers, authorization: token ? `Bearer ${token}` : '' } };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: { watchQuery: { fetchPolicy: 'no-cache' }, query: { fetchPolicy: 'no-cache' } },
});

export const REGISTER = gql`
  mutation Register($email: String!, $password: String!, $name: String!) {
    register(email: $email, password: $password, name: $name) {
      token
      user { id email name createdAt plan }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id email name createdAt plan }
    }
  }
`;

export const ME = gql`
  query Me { me { id email name createdAt plan } }
`;

export const UPLOAD_FILE = gql`
  mutation UploadFile($fileContent: String!, $fileName: String!) {
    uploadFile(fileContent: $fileContent, fileName: $fileName) { id status message }
  }
`;

export const GET_DASHBOARD = gql`
  query GetDashboard($id: String!) {
    getDashboardData(id: $id) {
      id fileName processedAt
      totalRevenue avgOrderValue totalCustomers topCategory topRegion growthRate peakMonth totalOrders revenuePerCustomer
      salesTrend { date amount month }
      forecast { month predicted actual isForecasted }
      anomalies { date amount type deviation zScore }
      salesInsights anomalyExplanation marketingStrategies feedbackSummary
      customerSegments { name count percentage avgValue color }
      sentiment { positive negative neutral overallScore }
      regionBreakdown { region revenue count }
      categoryBreakdown { category revenue count }
      channelBreakdown { channel revenue percentage }
    }
  }
`;

export const GET_HISTORY = gql`
  query GetHistory { getUserHistory { id fileName uploadedAt rowCount totalRevenue growthRate status } }
`;

export const DELETE_HISTORY = gql`
  mutation DeleteHistory($historyId: String!) { deleteHistory(historyId: $historyId) }
`;
