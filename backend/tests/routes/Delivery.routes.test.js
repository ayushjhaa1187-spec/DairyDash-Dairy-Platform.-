const express = require('express');
const request = require('supertest');

// Mock middlewares
jest.mock('../../middleware/authenticate', () => (req, res, next) => next(), { virtual: true });

// Mock models
jest.mock('../../models/DeliveryTracking', () => ({
  findOne: jest.fn(),
  save: jest.fn()
}));

jest.mock('../../models/Order', () => ({
  findByIdAndUpdate: jest.fn()
}));

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
    it('should return 404 if tracking is not found', async () => {
      DeliveryTracking.findOne.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/delivery/123/update-location')
        .send({
          latitude: 10,
          longitude: 20,
          address: '123 Main St'
        });

      expect(DeliveryTracking.findOne).toHaveBeenCalledWith({ orderId: '123' });
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ success: false, message: 'Tracking not found' });
    });

    it('should update location if tracking is found', async () => {
      const mockTracking = {
        orderId: '123',
        status: 'Out for delivery',
        currentLocation: {},
        trackingHistory: [],
        save: jest.fn().mockResolvedValue(true)
      };

      DeliveryTracking.findOne.mockResolvedValue(mockTracking);
      Order.findByIdAndUpdate.mockResolvedValue(true);

      const res = await request(app)
        .put('/api/delivery/123/update-location')
        .send({
          latitude: 10,
          longitude: 20,
          address: '123 Main St',
          status: 'Delivered'
        });

      expect(DeliveryTracking.findOne).toHaveBeenCalledWith({ orderId: '123' });
      expect(mockTracking.save).toHaveBeenCalled();
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('123', { status: 'Delivered' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Location updated');
    });
  });
});
