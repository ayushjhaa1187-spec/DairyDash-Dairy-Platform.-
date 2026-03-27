const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

// Create the mock first, without referencing any files that might not exist locally
// Use virtual mock to allow bypassing missing files
jest.mock('../../middleware/authenticate', () => {
  return (req, res, next) => {
    req.user = { _id: 'mockUserId123' };
    next();
  };
}, { virtual: true });

// Mock models
const Order = require('../../models/Order');
jest.mock('../../models/Order', () => ({
  find: jest.fn()
}), { virtual: true });

const DeliveryTracking = require('../../models/DeliveryTracking');
jest.mock('../../models/DeliveryTracking', () => ({}), { virtual: true });

const orderRoutes = require('../../routes/Order.routes');

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/orders/my-orders', () => {
    it('should fetch all orders for the authenticated user and return 200', async () => {
      // Setup the mock chain for Order.find().populate().sort()
      const mockOrders = [
        { _id: 'order1', userId: 'mockUserId123', totalPrice: 100 },
        { _id: 'order2', userId: 'mockUserId123', totalPrice: 200 }
      ];

      const mockSort = jest.fn().mockResolvedValue(mockOrders);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      const mockFind = jest.fn().mockReturnValue({ populate: mockPopulate });

      Order.find.mockImplementation(mockFind);

      const response = await request(app).get('/api/orders/my-orders');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.orders).toEqual(mockOrders);
      expect(Order.find).toHaveBeenCalledWith({ userId: 'mockUserId123' });
      expect(mockPopulate).toHaveBeenCalledWith('items.productId');
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should return 400 if an error occurs', async () => {
      const mockSort = jest.fn().mockRejectedValue(new Error('Database error'));
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      const mockFind = jest.fn().mockReturnValue({ populate: mockPopulate });

      Order.find.mockImplementation(mockFind);

      const response = await request(app).get('/api/orders/my-orders');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database error');
    });
  });
});
