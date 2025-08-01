import express from 'express';
import cors from 'cors';
import { PrismaClient } from './generated/prisma';
import { createBikeRoutesRouter } from './routes/bikeRoutes';

export const createApp = (prismaClient?: PrismaClient) => {
  const app = express();
  const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

  // Initialize Prisma client (use provided one or create new)
  const prisma = prismaClient || new PrismaClient();

  // Middleware
  app.use(cors({ origin: ALLOWED_ORIGIN }));
  app.use(express.json());

  // Routes
  app.get('/', (req, res) => {
    res.send('API is running');
  });

  // Bike routes API
  app.use('/api/bike-routes', createBikeRoutesRouter(prisma));

  return { app, prisma };
};