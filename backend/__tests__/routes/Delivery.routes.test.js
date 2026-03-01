const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Mock dependencies
jest.mock('../../models/DeliveryTracking');
jest.mock('../../models/Order');
jest.mock('../../middleware/authenticate', () => (req, res, next) => next());

const DeliveryTracking = require('../../models/DeliveryTracking');
const Order = require('../../models/Order');
const deliveryRoutes = require('../../routes/Delivery.routes');

const app = express();
app.use(express.json());
app.use('/api/delivery', deliveryRoutes);

describe('Delivery Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/delivery/:orderId/update-location', () => {
    const validLocationUpdate = {
      latitude: 40.7128,
      longitude: -74.0060,
      address: '123 Main St',
      status: 'In Transit'
    };

    it('should update location and return 200 on success', async () => {
      const mockTracking = {
        _id: 'trackingId',
        orderId: 'orderId123',
        status: 'Dispatched',
        currentLocation: {},
        trackingHistory: [],
        save: jest.fn().mockResolvedValue(true)
      };

      DeliveryTracking.findOne.mockResolvedValue(mockTracking);
      Order.findByIdAndUpdate.mockResolvedValue({ _id: 'orderId123' });

      const response = await request(app)
        .put('/api/delivery/orderId123/update-location')
        .send(validLocationUpdate);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Location updated');
      expect(mockTracking.save).toHaveBeenCalled();
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('orderId123', { status: 'In Transit' });
      expect(mockTracking.currentLocation.latitude).toBe(validLocationUpdate.latitude);
      expect(mockTracking.status).toBe('In Transit');
    });

    it('should return 404 if tracking is not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/delivery/orderId123/update-location')
        .send(validLocationUpdate);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tracking not found');
    });

    it('should return 400 on error', async () => {
      DeliveryTracking.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .put('/api/delivery/orderId123/update-location')
        .send(validLocationUpdate);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database error');
    });
  });

  describe('GET /api/delivery/:orderId', () => {
    it('should return tracking details on success', async () => {
      const mockTracking = { orderId: 'orderId123', status: 'In Transit' };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);

      const response = await request(app).get('/api/delivery/orderId123');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.tracking.orderId).toBe('orderId123');
    });

    it('should return 404 if tracking not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const response = await request(app).get('/api/delivery/orderId123');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tracking not found');
    });

    it('should return 400 on error', async () => {
      DeliveryTracking.findOne.mockRejectedValue(new Error('DB error'));

      const response = await request(app).get('/api/delivery/orderId123');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/delivery/:orderId/history', () => {
    it('should return tracking history on success', async () => {
      const mockTracking = {
        orderId: 'orderId123',
        status: 'In Transit',
        trackingHistory: [{ status: 'Dispatched' }]
      };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);

      const response = await request(app).get('/api/delivery/orderId123/history');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.history).toHaveLength(1);
      expect(response.body.status).toBe('In Transit');
    });

    it('should return 404 if tracking not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const response = await request(app).get('/api/delivery/orderId123/history');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/delivery/:orderId/delivery-person', () => {
    const validPersonUpdate = {
      deliveryPersonName: 'John Doe',
      deliveryPersonPhone: '1234567890',
      vehicleNumber: 'AB12CD3456',
      estimatedDeliveryTime: new Date().toISOString()
    };

    it('should update delivery person details on success', async () => {
      const mockTracking = {
        orderId: 'orderId123',
        save: jest.fn().mockResolvedValue(true)
      };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);

      const response = await request(app)
        .put('/api/delivery/orderId123/delivery-person')
        .send(validPersonUpdate);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockTracking.save).toHaveBeenCalled();
      expect(mockTracking.deliveryPersonName).toBe('John Doe');
    });

    it('should return 404 if tracking not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/delivery/orderId123/delivery-person')
        .send(validPersonUpdate);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /api/delivery/:orderId/mark-delivered', () => {
    it('should mark order as delivered on success', async () => {
      const mockTracking = {
        orderId: 'orderId123',
        status: 'In Transit',
        currentLocation: { lat: 10, lng: 20 },
        trackingHistory: [],
        save: jest.fn().mockResolvedValue(true)
      };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);
      Order.findByIdAndUpdate.mockResolvedValue({ _id: 'orderId123' });

      const response = await request(app).put('/api/delivery/orderId123/mark-delivered');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockTracking.status).toBe('Delivered');
      expect(mockTracking.actualDeliveryTime).toBeDefined();
      expect(mockTracking.trackingHistory).toHaveLength(1);
      expect(mockTracking.save).toHaveBeenCalled();
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('orderId123', { status: 'Delivered' });
    });

    it('should return 404 if tracking not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const response = await request(app).put('/api/delivery/orderId123/mark-delivered');

      expect(response.status).toBe(404);
    });

    it('should return 400 on error', async () => {
      DeliveryTracking.findOne.mockRejectedValue(new Error('DB error'));

      const response = await request(app).put('/api/delivery/orderId123/mark-delivered');

      expect(response.status).toBe(400);
    });
  });
});
