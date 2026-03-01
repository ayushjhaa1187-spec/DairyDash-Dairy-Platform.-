const express = require('express');
const request = require('supertest');
const deliveryRoutes = require('../../routes/Delivery.routes');
const DeliveryTracking = require('../../models/DeliveryTracking');
const Order = require('../../models/Order');

// Mock authenticate middleware
jest.mock('../../middleware/authenticate', () => (req, res, next) => next(), { virtual: true });

// Mock models
jest.mock('../../models/DeliveryTracking');
jest.mock('../../models/Order');

const app = express();
app.use(express.json());
app.use('/api/delivery', deliveryRoutes);

describe('Delivery Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /:orderId/update-location', () => {
    const orderId = 'test-order-id';
    const reqBody = {
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'Test Address',
      status: 'In Transit'
    };

    it('should update delivery location successfully', async () => {
      const mockTracking = {
        orderId,
        trackingHistory: [],
        save: jest.fn().mockResolvedValue(true)
      };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);
      Order.findByIdAndUpdate.mockResolvedValue(true);

      const response = await request(app)
        .put(`/api/delivery/${orderId}/update-location`)
        .send(reqBody);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockTracking.save).toHaveBeenCalled();
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(orderId, { status: 'In Transit' });
    });

    it('should update delivery location without status successfully', async () => {
      const reqBodyNoStatus = {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'Test Address'
      };
      const mockTracking = {
        orderId,
        status: 'Dispatched',
        trackingHistory: [],
        save: jest.fn().mockResolvedValue(true)
      };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);
      Order.findByIdAndUpdate.mockResolvedValue(true);

      const response = await request(app)
        .put(`/api/delivery/${orderId}/update-location`)
        .send(reqBodyNoStatus);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockTracking.save).toHaveBeenCalled();
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(orderId, { status: 'Dispatched' });
    });

    it('should return 404 if tracking not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/delivery/${orderId}/update-location`)
        .send(reqBody);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Tracking not found');
    });

    it('should handle errors when updating location', async () => {
      const errorMessage = 'Database error';
      DeliveryTracking.findOne.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .put(`/api/delivery/${orderId}/update-location`)
        .send(reqBody);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe('GET /:orderId', () => {
    const orderId = 'test-order-id';

    it('should get tracking details successfully', async () => {
      const mockTracking = { orderId, status: 'In Transit' };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);

      const response = await request(app).get(`/api/delivery/${orderId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.tracking).toEqual(mockTracking);
    });

    it('should return 404 if tracking not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const response = await request(app).get(`/api/delivery/${orderId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Tracking not found');
    });

    it('should handle errors when getting tracking details', async () => {
      const errorMessage = 'Database error';
      DeliveryTracking.findOne.mockRejectedValue(new Error(errorMessage));

      const response = await request(app).get(`/api/delivery/${orderId}`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe('GET /:orderId/history', () => {
    const orderId = 'test-order-id';

    it('should get tracking history successfully', async () => {
      const mockTracking = {
        orderId,
        status: 'In Transit',
        trackingHistory: [{ status: 'Dispatched' }]
      };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);

      const response = await request(app).get(`/api/delivery/${orderId}/history`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.history).toEqual(mockTracking.trackingHistory);
      expect(response.body.status).toBe(mockTracking.status);
    });

    it('should return 404 if tracking not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const response = await request(app).get(`/api/delivery/${orderId}/history`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Tracking not found');
    });

    it('should handle errors when getting tracking history', async () => {
      const errorMessage = 'Database error';
      DeliveryTracking.findOne.mockRejectedValue(new Error(errorMessage));

      const response = await request(app).get(`/api/delivery/${orderId}/history`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe('PUT /:orderId/delivery-person', () => {
    const orderId = 'test-order-id';
    const reqBody = {
      deliveryPersonName: 'John Doe',
      deliveryPersonPhone: '1234567890',
      vehicleNumber: 'AB-12-CD-3456',
      estimatedDeliveryTime: new Date().toISOString()
    };

    it('should update delivery person details successfully', async () => {
      const mockTracking = {
        orderId,
        save: jest.fn().mockResolvedValue(true)
      };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);

      const response = await request(app)
        .put(`/api/delivery/${orderId}/delivery-person`)
        .send(reqBody);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockTracking.save).toHaveBeenCalled();
      expect(mockTracking.deliveryPersonName).toBe(reqBody.deliveryPersonName);
    });

    it('should return 404 if tracking not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/delivery/${orderId}/delivery-person`)
        .send(reqBody);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Tracking not found');
    });

    it('should handle errors when updating delivery person details', async () => {
      const errorMessage = 'Database error';
      DeliveryTracking.findOne.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .put(`/api/delivery/${orderId}/delivery-person`)
        .send(reqBody);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(errorMessage);
    });
  });

  describe('PUT /:orderId/mark-delivered', () => {
    const orderId = 'test-order-id';

    it('should mark order as delivered successfully', async () => {
      const mockTracking = {
        orderId,
        currentLocation: { lat: 0, lng: 0 },
        trackingHistory: [],
        save: jest.fn().mockResolvedValue(true)
      };
      DeliveryTracking.findOne.mockResolvedValue(mockTracking);
      Order.findByIdAndUpdate.mockResolvedValue(true);

      const response = await request(app)
        .put(`/api/delivery/${orderId}/mark-delivered`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockTracking.status).toBe('Delivered');
      expect(mockTracking.save).toHaveBeenCalled();
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(orderId, { status: 'Delivered' });
    });

    it('should return 404 if tracking not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const response = await request(app)
        .put(`/api/delivery/${orderId}/mark-delivered`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Tracking not found');
    });

    it('should handle errors when marking as delivered', async () => {
      const errorMessage = 'Database error';
      DeliveryTracking.findOne.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .put(`/api/delivery/${orderId}/mark-delivered`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe(errorMessage);
    });
  });
});
