import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import { typeDefs } from './graphql/schema';
import { resolvers, buildContext } from './graphql/resolvers';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function startServer() {
  const app = express();

  app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  }));

  const server = new ApolloServer({ typeDefs, resolvers, introspection: true });
  await server.start();

  app.use('/graphql', json({ limit: '50mb' }), expressMiddleware(server, {
    context: async ({ req }) => buildContext(req as any),
  }));

  app.get('/health', (_, res) => res.json({ status: 'ok', version: '2.0.0', timestamp: new Date().toISOString() }));

  app.listen(PORT, () => console.log(`🚀 InsightForge API running at http://localhost:${PORT}/graphql`));
}

startServer().catch(console.error);
