const request = require('supertest');
const express = require('express');

// Mock authenticate middleware virtually before requiring the router
jest.mock('../../middleware/authenticate', () => (req, res, next) => {
  req.user = { id: 'mockUserId', role: 'user' };
  next();
}, { virtual: true });

const router = require('../../routes/Delivery.routes');
const DeliveryTracking = require('../../models/DeliveryTracking');
const Order = require('../../models/Order');
const mongoose = require('mongoose');

// Mock Mongoose Models
jest.mock('../../models/DeliveryTracking');
jest.mock('../../models/Order');

const app = express();
app.use(express.json());
app.use('/api/delivery', router);

describe('Delivery Routes', () => {
  const mockOrderId = new mongoose.Types.ObjectId().toString();
  const mockTrackingId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /:orderId/update-location', () => {
    it('should update delivery location and history successfully', async () => {
      const mockTracking = {
        _id: mockTrackingId,
        orderId: mockOrderId,
        currentLocation: { latitude: 10, longitude: 20, address: 'Old Address' },
        status: 'In Transit',
        trackingHistory: [],
        save: jest.fn().mockResolvedValue(true)
      };

      DeliveryTracking.findOne.mockResolvedValue(mockTracking);
      Order.findByIdAndUpdate.mockResolvedValue({ _id: mockOrderId });

      const res = await request(app)
        .put(`/api/delivery/${mockOrderId}/update-location`)
        .send({
          latitude: 12.34,
          longitude: 56.78,
          address: 'New Address',
          status: 'Out for Delivery'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Location updated');
      expect(mockTracking.save).toHaveBeenCalled();
      expect(mockTracking.currentLocation.latitude).toBe(12.34);
      expect(mockTracking.status).toBe('Out for Delivery');
      expect(mockTracking.trackingHistory.length).toBe(1);

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        mockOrderId,
        { status: 'Out for Delivery' }
      );
    });

    it('should return 404 if tracking not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const res = await request(app)
        .put(`/api/delivery/${mockOrderId}/update-location`)
        .send({
          latitude: 12.34,
          longitude: 56.78
        });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Tracking not found');
    });

    it('should handle database errors gracefully', async () => {
      DeliveryTracking.findOne.mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put(`/api/delivery/${mockOrderId}/update-location`)
        .send({
          latitude: 12.34,
          longitude: 56.78
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database error');
    });
  });

  describe('GET /:orderId', () => {
    it('should fetch delivery tracking details successfully', async () => {
      const mockTracking = {
        _id: mockTrackingId,
        orderId: mockOrderId,
        status: 'In Transit'
      };

      DeliveryTracking.findOne.mockResolvedValue(mockTracking);

      const res = await request(app).get(`/api/delivery/${mockOrderId}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.tracking).toEqual(mockTracking);
    });

    it('should return 404 if tracking not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const res = await request(app).get(`/api/delivery/${mockOrderId}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Tracking not found');
    });
  });

  describe('GET /:orderId/history', () => {
    it('should fetch tracking history successfully', async () => {
      const mockTracking = {
        _id: mockTrackingId,
        orderId: mockOrderId,
        status: 'In Transit',
        trackingHistory: [
          { status: 'Pending', location: { latitude: 1, longitude: 1 } },
          { status: 'In Transit', location: { latitude: 2, longitude: 2 } }
        ]
      };

      DeliveryTracking.findOne.mockResolvedValue(mockTracking);

      const res = await request(app).get(`/api/delivery/${mockOrderId}/history`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.history).toEqual(mockTracking.trackingHistory);
      expect(res.body.status).toBe(mockTracking.status);
    });
  });

  describe('PUT /:orderId/delivery-person', () => {
    it('should update delivery person details successfully', async () => {
      const mockTracking = {
        _id: mockTrackingId,
        orderId: mockOrderId,
        deliveryPersonName: '',
        deliveryPersonPhone: '',
        vehicleNumber: '',
        estimatedDeliveryTime: '',
        save: jest.fn().mockResolvedValue(true)
      };

      DeliveryTracking.findOne.mockResolvedValue(mockTracking);

      const res = await request(app)
        .put(`/api/delivery/${mockOrderId}/delivery-person`)
        .send({
          deliveryPersonName: 'John Doe',
          deliveryPersonPhone: '1234567890',
          vehicleNumber: 'AB12CD3456',
          estimatedDeliveryTime: '2023-01-01T12:00:00Z'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockTracking.deliveryPersonName).toBe('John Doe');
      expect(mockTracking.save).toHaveBeenCalled();
    });
  });

  describe('PUT /:orderId/mark-delivered', () => {
    it('should mark order as delivered and update history successfully', async () => {
      const mockTracking = {
        _id: mockTrackingId,
        orderId: mockOrderId,
        status: 'Out for Delivery',
        currentLocation: { latitude: 10, longitude: 20 },
        trackingHistory: [],
        save: jest.fn().mockResolvedValue(true)
      };

      DeliveryTracking.findOne.mockResolvedValue(mockTracking);
      Order.findByIdAndUpdate.mockResolvedValue({ _id: mockOrderId });

      const res = await request(app).put(`/api/delivery/${mockOrderId}/mark-delivered`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order marked as delivered');
      expect(mockTracking.status).toBe('Delivered');
      expect(mockTracking.actualDeliveryTime).toBeDefined();
      expect(mockTracking.trackingHistory.length).toBe(1);
      expect(mockTracking.trackingHistory[0].status).toBe('Delivered');
      expect(mockTracking.save).toHaveBeenCalled();

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        mockOrderId,
        { status: 'Delivered' }
      );
    });

    it('should return 404 if tracking not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const res = await request(app).put(`/api/delivery/${mockOrderId}/mark-delivered`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Tracking not found');
    });
  });
});
