import request from 'supertest';
import { Application } from 'express';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '../generated/prisma';
import { createApp } from '../app';
import path from 'path';

describe('Bike Routes API', () => {
  let app: Application;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(() => {
    prismaMock = mockDeep<PrismaClient>();
    const { app: testApp } = createApp(prismaMock);
    app = testApp;
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/bike-routes', () => {
    it('should return all bike routes', async () => {
      const mockRoutes = [
        {
          id: '1',
          name: 'Golden Gate Loop',
          description: 'Beautiful ride across the Golden Gate Bridge',
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
          geoJSON: { type: 'LineString', coordinates: [[-122.4194, 37.7749]] },
          distance: 12.5,
          elevationGain: 800,
          startPoint: { type: 'Point', coordinates: [-122.4194, 37.7749] }
        },
        {
          id: '2',
          name: 'Bay Trail',
          description: 'Scenic bay trail ride',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
          geoJSON: { type: 'LineString', coordinates: [[-122.3, 37.8]] },
          distance: 8.2,
          elevationGain: 200,
          startPoint: { type: 'Point', coordinates: [-122.3, 37.8] }
        }
      ];

      // Expected response with serialized dates
      const expectedRoutes = mockRoutes.map(route => ({
        ...route,
        createdAt: route.createdAt.toISOString(),
        updatedAt: route.updatedAt.toISOString()
      }));

      prismaMock.bikeRoute.findMany.mockResolvedValue(mockRoutes);

      const response = await request(app)
        .get('/api/bike-routes')
        .expect(200);

      expect(response.body).toEqual(expectedRoutes);
    });

    it('should handle database errors', async () => {
      prismaMock.bikeRoute.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/bike-routes')
        .expect(500);

      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('GET /api/bike-routes/:id', () => {
    it('should return a specific bike route', async () => {
      const mockRoute = {
        id: '1',
        name: 'Golden Gate Loop',
        description: 'Beautiful ride across the Golden Gate Bridge',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        geoJSON: { type: 'LineString', coordinates: [[-122.4194, 37.7749]] },
        distance: 12.5,
        elevationGain: 800,
        startPoint: { type: 'Point', coordinates: [-122.4194, 37.7749] }
      };

      const expectedRoute = {
        ...mockRoute,
        createdAt: mockRoute.createdAt.toISOString(),
        updatedAt: mockRoute.updatedAt.toISOString()
      };

      prismaMock.bikeRoute.findUnique.mockResolvedValue(mockRoute);

      const response = await request(app)
        .get('/api/bike-routes/1')
        .expect(200);

      expect(response.body).toEqual(expectedRoute);
    });

    it('should return 404 when route not found', async () => {
      prismaMock.bikeRoute.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/bike-routes/nonexistent')
        .expect(404);

      expect(response.body).toEqual({ error: 'Route not found' });
    });

    it('should handle database errors', async () => {
      prismaMock.bikeRoute.findUnique.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/bike-routes/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('POST /api/bike-routes', () => {
    it('should create a new bike route using a GPX file upload', async () => {
      const mockCreatedRoute = {
        id: '3',
        name: 'New Trail',
        description: 'A new exciting route',
        geoJSON: {},
        distance:36.6,
        elevationGain: 3369,
        startPoint: { type: 'Point', coordinates: [-105.2598700, 40.0230370]  },
        createdAt: new Date('2024-01-03'),
        updatedAt: new Date('2024-01-03')
      };
  
      prismaMock.bikeRoute.create.mockResolvedValue(mockCreatedRoute);
  
      const response = await request(app)
        .post('/api/bike-routes')
        .field('name', 'New Route')
        .field('description', 'A new exciting route')
        .attach('gpxFile',  path.join(__dirname, '../fixtures/boulder_gravelanche.gpx'))
        .expect(201);
  
      expect(prismaMock.bikeRoute.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: 'New Route',
          description: 'A new exciting route',
          geoJSON: expect.any(Object),
          distance:36.6,
          elevationGain: 3369,
          startPoint: { type: 'Point', coordinates: [-105.2598700, 40.0230370]  },
        }),
      });

      expect(response.body).toEqual({
        ...mockCreatedRoute,
        createdAt: mockCreatedRoute.createdAt.toISOString(),
        updatedAt: mockCreatedRoute.updatedAt.toISOString()
      });
    });

    it('should not accept a route without a GPX file', async () => {
      const response = await request(app)
        .post('/api/bike-routes')
        .send({
          name: 'Error Route',
          description: 'A new exciting route'
        })
        .expect(400);

      expect(response.body).toEqual({ error: 'GPX file is required' });
    });

    it('should not accept a route without a name', async () => {
      const response = await request(app)
        .post('/api/bike-routes')
        .field('description', 'A new exciting route')
        .attach('gpxFile',  path.join(__dirname, '../fixtures/boulder_gravelanche.gpx'))
        .expect(400);

      expect(response.body).toEqual({ error: 'Name is required' });
    });
  });

  describe('PUT /api/bike-routes/:id', () => {
    it('should update a bike route', async () => {
      const updateData = {
        name: 'Updated Trail',
        description: 'Updated description',
        geoJSON: { type: 'LineString', coordinates: [[-122.8, 37.8]] },
        distance: 20.0,
        elevationGain: 1500,
        startPoint: { type: 'Point', coordinates: [-122.8, 37.8] }
      };

      const updatedRoute = {
        id: '1',
        ...updateData,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-05')
      };

      const expectedUpdatedRoute = {
        ...updatedRoute,
        createdAt: updatedRoute.createdAt.toISOString(),
        updatedAt: updatedRoute.updatedAt.toISOString()
      };

      prismaMock.bikeRoute.update.mockResolvedValue(updatedRoute);

      const response = await request(app)
        .put('/api/bike-routes/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(expectedUpdatedRoute);
    });

    it('should handle database errors during update', async () => {
      const updateData = {
        name: 'Error Update',
        geoJSON: { type: 'LineString', coordinates: [[-122.9, 37.9]] },
        distance: 25.0,
        elevationGain: 2000
      };

      prismaMock.bikeRoute.update.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/bike-routes/1')
        .send(updateData)
        .expect(500);

      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });

  describe('DELETE /api/bike-routes/:id', () => {
    it('should delete a bike route', async () => {
      const deletedRoute = {
        id: '1',
        name: 'To Delete',
        description: null,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
        geoJSON: { type: 'LineString', coordinates: [[-122.1, 37.1]] },
        distance: 5.0,
        elevationGain: 100,
        startPoint: null
      };

      prismaMock.bikeRoute.delete.mockResolvedValue(deletedRoute);

      const response = await request(app)
        .delete('/api/bike-routes/1')
        .expect(204);

      expect(response.body).toEqual({});
    });

    it('should handle database errors during deletion', async () => {
      prismaMock.bikeRoute.delete.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .delete('/api/bike-routes/1')
        .expect(500);

      expect(response.body).toEqual({ error: 'Internal server error' });
    });
  });
});