const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const deliveryRoutes = require('../../routes/Delivery.routes');
const DeliveryTracking = require('../../models/DeliveryTracking');
const Order = require('../../models/Order');

const app = express();
app.use(express.json());
app.use('/api/delivery', deliveryRoutes);

// Mock the middleware and models
jest.mock('../../middleware/authenticate', () => (req, res, next) => next(), { virtual: true });
jest.mock('../../models/DeliveryTracking');
jest.mock('../../models/Order');

describe('Delivery Routes Error Handling', () => {
  const orderId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/delivery/:orderId/update-location', () => {
    it('should return 400 if a database error occurs during findOne', async () => {
      const mockError = new Error('Database connection failed');

      // Setup mock to throw an error
      DeliveryTracking.findOne.mockRejectedValue(mockError);

      const res = await request(app)
        .put(`/api/delivery/${orderId}/update-location`)
        .send({
          latitude: 40.7128,
          longitude: -74.0060,
          address: '123 Main St',
          status: 'In Transit'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Database connection failed'
      });
      expect(DeliveryTracking.findOne).toHaveBeenCalledWith({ orderId });
    });
  });

  describe('GET /api/delivery/:orderId', () => {
    it('should return 400 if a database error occurs during findOne', async () => {
      const mockError = new Error('Database connection failed');
      DeliveryTracking.findOne.mockRejectedValue(mockError);

      const res = await request(app).get(`/api/delivery/${orderId}`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Database connection failed'
      });
      expect(DeliveryTracking.findOne).toHaveBeenCalledWith({ orderId });
    });
  });

  describe('GET /api/delivery/:orderId/history', () => {
    it('should return 400 if a database error occurs during findOne', async () => {
      const mockError = new Error('Database connection failed');
      DeliveryTracking.findOne.mockRejectedValue(mockError);

      const res = await request(app).get(`/api/delivery/${orderId}/history`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Database connection failed'
      });
      expect(DeliveryTracking.findOne).toHaveBeenCalledWith({ orderId });
    });
  });

  describe('PUT /api/delivery/:orderId/delivery-person', () => {
    it('should return 400 if a database error occurs during findOne', async () => {
      const mockError = new Error('Database connection failed');
      DeliveryTracking.findOne.mockRejectedValue(mockError);

      const res = await request(app)
        .put(`/api/delivery/${orderId}/delivery-person`)
        .send({
          deliveryPersonName: 'John Doe',
          deliveryPersonPhone: '1234567890'
        });

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Database connection failed'
      });
      expect(DeliveryTracking.findOne).toHaveBeenCalledWith({ orderId });
    });
  });

  describe('PUT /api/delivery/:orderId/mark-delivered', () => {
    it('should return 400 if a database error occurs during findOne', async () => {
      const mockError = new Error('Database connection failed');
      DeliveryTracking.findOne.mockRejectedValue(mockError);

      const res = await request(app).put(`/api/delivery/${orderId}/mark-delivered`);

      expect(res.status).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Database connection failed'
      });
      expect(DeliveryTracking.findOne).toHaveBeenCalledWith({ orderId });
    });
  });
});

describe('Delivery Routes Success and 404 Handling', () => {
  const orderId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /api/delivery/:orderId/update-location', () => {
    it('should return 404 if tracking is not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/delivery/${orderId}/update-location`)
        .send({
          latitude: 40.7128,
          longitude: -74.0060,
          address: '123 Main St'
        });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Tracking not found'
      });
    });

    it('should return 200 and update location when tracking is found', async () => {
      const mockTracking = {
        _id: 'tracking123',
        orderId,
        currentLocation: {},
        trackingHistory: [],
        save: jest.fn().mockResolvedValue(true)
      };

      DeliveryTracking.findOne.mockResolvedValue(mockTracking);
      Order.findByIdAndUpdate.mockResolvedValue(true);

      const res = await request(app)
        .put(`/api/delivery/${orderId}/update-location`)
        .send({
          latitude: 40.7128,
          longitude: -74.0060,
          address: '123 Main St',
          status: 'In Transit'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Location updated');
      expect(mockTracking.save).toHaveBeenCalled();
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(orderId, { status: 'In Transit' });
      expect(mockTracking.status).toBe('In Transit');
      expect(mockTracking.currentLocation).toEqual({
        latitude: 40.7128,
        longitude: -74.0060,
        address: '123 Main St'
      });
      expect(mockTracking.trackingHistory.length).toBe(1);
    });
  });

  describe('GET /api/delivery/:orderId', () => {
    it('should return 404 if tracking is not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const res = await request(app).get(`/api/delivery/${orderId}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Tracking not found'
      });
    });

    it('should return 200 and tracking details when found', async () => {
      const mockTracking = { orderId, status: 'In Transit' };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);

      const res = await request(app).get(`/api/delivery/${orderId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.tracking).toEqual(mockTracking);
    });
  });

  describe('GET /api/delivery/:orderId/history', () => {
    it('should return 404 if tracking is not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const res = await request(app).get(`/api/delivery/${orderId}/history`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Tracking not found'
      });
    });

    it('should return 200 and tracking history when found', async () => {
      const mockTracking = {
        orderId,
        status: 'In Transit',
        trackingHistory: [{ status: 'Pending' }]
      };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);

      const res = await request(app).get(`/api/delivery/${orderId}/history`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.history).toEqual(mockTracking.trackingHistory);
      expect(res.body.status).toBe(mockTracking.status);
    });
  });

  describe('PUT /api/delivery/:orderId/delivery-person', () => {
    it('should return 404 if tracking is not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/delivery/${orderId}/delivery-person`)
        .send({
          deliveryPersonName: 'John Doe'
        });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Tracking not found'
      });
    });

    it('should return 200 and update delivery person details when found', async () => {
      const mockTracking = {
        save: jest.fn().mockResolvedValue(true)
      };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);

      const res = await request(app)
        .put(`/api/delivery/${orderId}/delivery-person`)
        .send({
          deliveryPersonName: 'John Doe',
          deliveryPersonPhone: '1234567890',
          vehicleNumber: 'AB12CD3456',
          estimatedDeliveryTime: '2023-12-01T12:00:00Z'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Delivery person details updated');
      expect(mockTracking.deliveryPersonName).toBe('John Doe');
      expect(mockTracking.deliveryPersonPhone).toBe('1234567890');
      expect(mockTracking.vehicleNumber).toBe('AB12CD3456');
      expect(mockTracking.estimatedDeliveryTime).toBe('2023-12-01T12:00:00Z');
      expect(mockTracking.save).toHaveBeenCalled();
    });
  });

  describe('PUT /api/delivery/:orderId/mark-delivered', () => {
    it('should return 404 if tracking is not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const res = await request(app).put(`/api/delivery/${orderId}/mark-delivered`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'Tracking not found'
      });
    });

    it('should return 200 and mark as delivered when found', async () => {
      const mockTracking = {
        currentLocation: { lat: 0, lng: 0 },
        trackingHistory: [],
        save: jest.fn().mockResolvedValue(true)
      };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);
      Order.findByIdAndUpdate.mockResolvedValue(true);

      const res = await request(app).put(`/api/delivery/${orderId}/mark-delivered`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order marked as delivered');
      expect(mockTracking.status).toBe('Delivered');
      expect(mockTracking.trackingHistory.length).toBe(1);
      expect(mockTracking.trackingHistory[0].status).toBe('Delivered');
      expect(mockTracking.save).toHaveBeenCalled();
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(orderId, { status: 'Delivered' });
    });
  });
});
