import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from './generated/prisma';

dotenv.config();
const app = express();
const PORT = 3001;
const ALLOWED_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// Initialize Prisma client
const prisma = new PrismaClient();

// Middleware
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API is running');
});

// Bike routes endpoints
app.get('/api/bike-routes', async (req, res) => {
  try {
    const routes = await prisma.bikeRoute.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(routes);
  } catch (error) {
    console.error('Error fetching bike routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/bike-routes/:id', async (req, res) => {
  try {
    const route = await prisma.bikeRoute.findUnique({
      where: { id: req.params.id }
    });
    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }
    res.json(route);
  } catch (error) {
    console.error('Error fetching bike route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/bike-routes', async (req, res) => {
  try {
    const { name, description, geoJSON, distance, elevationGain, startPoint } = req.body;
    
    const route = await prisma.bikeRoute.create({
      data: {
        name,
        description,
        geoJSON,
        distance,
        elevationGain,
        startPoint
      }
    });
    
    res.status(201).json(route);
  } catch (error) {
    console.error('Error creating bike route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/bike-routes/:id', async (req, res) => {
  try {
    const { name, description, geoJSON, distance, elevationGain, startPoint } = req.body;
    
    const route = await prisma.bikeRoute.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        geoJSON,
        distance,
        elevationGain,
        startPoint
      }
    });
    
    res.json(route);
  } catch (error) {
    console.error('Error updating bike route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/bike-routes/:id', async (req, res) => {
  try {
    await prisma.bikeRoute.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting bike route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
