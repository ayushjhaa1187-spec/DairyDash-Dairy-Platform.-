const express = require('express');
const request = require('supertest');
const Order = require('../../models/Order');
const DeliveryTracking = require('../../models/DeliveryTracking');

// Mock dependencies
jest.mock('../../models/Order');
jest.mock('../../models/DeliveryTracking');

// Mock authentication middleware before requiring the routes
jest.mock('../../middleware/authenticate', () => {
  return (req, res, next) => {
    // Inject a dummy user context
    req.user = { _id: 'mockUserId123' };
    next();
  };
}, { virtual: true });

const orderRoutes = require('../../routes/Order.routes');

const app = express();
app.use(express.json());
app.use('/orders', orderRoutes);

describe('Order Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /orders/:orderId/status', () => {
    it('should update the order status and return the updated order', async () => {
      const mockOrder = {
        _id: 'mockOrderId123',
        status: 'Delivered',
        userId: 'mockUserId123'
      };

      Order.findByIdAndUpdate.mockResolvedValue(mockOrder);

      const response = await request(app)
        .put('/orders/mockOrderId123/status')
        .send({ status: 'Delivered' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order status updated');
      expect(response.body.order).toEqual(mockOrder);

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockOrderId123',
        { status: 'Delivered' },
        { new: true }
      );
    });

    it('should return 400 if updating the order status fails', async () => {
      const errorMessage = 'Database error';
      Order.findByIdAndUpdate.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .put('/orders/mockOrderId123/status')
        .send({ status: 'Delivered' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(errorMessage);

      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        'mockOrderId123',
        { status: 'Delivered' },
        { new: true }
      );
    });
  });
});
