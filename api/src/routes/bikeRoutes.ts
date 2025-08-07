import multer from 'multer';
import { Router } from 'express';
import { PrismaClient } from '../generated/prisma';
import { JSDOM } from 'jsdom';
import { gpx } from '@tmcw/togeojson';
import { calculateDistance, calculateElevationGain } from '../util/geoUtils';

export const createBikeRoutesRouter = (prisma: PrismaClient) => {
  const router = Router();
  const upload = multer({ storage: multer.memoryStorage() });

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

  // POST /api/bike-routes - Create new route (with GPX upload)
  router.post('/', upload.single('gpxFile'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'GPX file is required' });
      }
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }
      
      // Parse GPX file from buffer and convert to GeoJSON
      const gpxStr = req.file.buffer.toString('utf8');
      const dom = new JSDOM(gpxStr, { contentType: 'text/xml' });
      const geoJSON = gpx(dom.window.document);
      
      // Find the first LineString (the route) and get the coordinates
      const line = geoJSON.features.find((f: any) => f.geometry.type === 'LineString');
      if (!line) {
        return res.status(400).json({ error: 'No LineString found in GPX' });
      }
      const coords = line.geometry.coordinates;
    
      // Calculate distance in miles
      const distance = calculateDistance(coords);
      // Calculate elevation gain in feet
      const elevationGain = calculateElevationGain(coords);
      // Grab the start point
      const startPoint = {
        type: 'Point',
        coordinates: coords[0].slice(0, 2),
      };
      
      const route = await prisma.bikeRoute.create({
        data: {
          name,
          description,
          geoJSON,
          distance,
          elevationGain,
          startPoint,
        },
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