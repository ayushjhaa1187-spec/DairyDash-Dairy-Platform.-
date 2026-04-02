const request = require('supertest');
const express = require('express');

// Create an express app for testing
const app = express();
app.use(express.json());

// Mock models and middleware BEFORE requiring routes
jest.mock('../../models/DeliveryTracking');
jest.mock('../../models/Order');

// Mock authentication middleware to pass through and attach a mock user
jest.mock('../../middleware/authenticate', () => {
  return (req, res, next) => {
    req.user = { _id: 'mockUserId', role: 'user' };
    next();
  };
}, { virtual: true });

const DeliveryTracking = require('../../models/DeliveryTracking');
const Order = require('../../models/Order');
const deliveryRoutes = require('../../routes/Delivery.routes');

// Use the routes
app.use('/api/delivery', deliveryRoutes);

describe('Delivery Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /:orderId/mark-delivered', () => {
    it('should successfully mark tracking and order as delivered', async () => {
      // Setup
      const mockOrderId = 'order123';
      const mockTracking = {
        orderId: mockOrderId,
        status: 'Out for delivery',
        currentLocation: { lat: 10, lng: 20 },
        trackingHistory: [],
        save: jest.fn().mockResolvedValue(true)
      };

      DeliveryTracking.findOne.mockResolvedValue(mockTracking);
      Order.findByIdAndUpdate.mockResolvedValue({ _id: mockOrderId, status: 'Delivered' });

      // Action
      const response = await request(app)
        .put(`/api/delivery/${mockOrderId}/mark-delivered`)
        .send();

      // Assertion
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order marked as delivered');
      expect(response.body.tracking.status).toBe('Delivered');

      // Verify tracking changes
      expect(mockTracking.status).toBe('Delivered');
      expect(mockTracking.actualDeliveryTime).toBeDefined();
      expect(mockTracking.trackingHistory.length).toBe(1);
      expect(mockTracking.trackingHistory[0]).toEqual({
        status: 'Delivered',
        location: mockTracking.currentLocation
      });

      expect(mockTracking.save).toHaveBeenCalled();

      // Verify Order changes
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        mockOrderId,
        { status: 'Delivered' }
      );
    });

    it('should return 404 if tracking is not found', async () => {
      // Setup
      DeliveryTracking.findOne.mockResolvedValue(null);

      // Action
      const response = await request(app)
        .put('/api/delivery/invalidOrderId/mark-delivered')
        .send();

      // Assertion
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tracking not found');

      expect(Order.findByIdAndUpdate).not.toHaveBeenCalled();
    });

    it('should return 400 if database save fails', async () => {
      // Setup
      const mockOrderId = 'order123';
      const mockTracking = {
        orderId: mockOrderId,
        status: 'Out for delivery',
        currentLocation: { lat: 10, lng: 20 },
        trackingHistory: [],
        save: jest.fn().mockRejectedValue(new Error('Database connection failed'))
      };

      DeliveryTracking.findOne.mockResolvedValue(mockTracking);

      // Action
      const response = await request(app)
        .put(`/api/delivery/${mockOrderId}/mark-delivered`)
        .send();

      // Assertion
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database connection failed');

      expect(Order.findByIdAndUpdate).not.toHaveBeenCalled();
    });
  });
});
