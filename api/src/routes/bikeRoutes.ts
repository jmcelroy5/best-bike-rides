import { Router } from 'express';
import { PrismaClient } from '../generated/prisma';

export const createBikeRoutesRouter = (prisma: PrismaClient) => {
  const router = Router();

  // GET /api/bike-routes - List all routes
  router.get('/', async (req, res) => {
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

  // GET /api/bike-routes/:id - Get specific route
  router.get('/:id', async (req, res) => {
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

  // POST /api/bike-routes - Create new route
  router.post('/', async (req, res) => {
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

  // PUT /api/bike-routes/:id - Update route
  router.put('/:id', async (req, res) => {
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

  // DELETE /api/bike-routes/:id - Delete route
  router.delete('/:id', async (req, res) => {
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

  return router;
};