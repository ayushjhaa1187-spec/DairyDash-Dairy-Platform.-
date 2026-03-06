const request = require('supertest');
const express = require('express');

// Mock authentication middleware
jest.mock('../../middleware/authenticate', () => (req, res, next) => {
  req.user = { _id: 'mockUserId', role: 'user' };
  next();
}, { virtual: true });

// Mock models
jest.mock('../../models/Order');
jest.mock('../../models/DeliveryTracking');

const orderRoutes = require('../../routes/Order.routes');
const Order = require('../../models/Order');
const DeliveryTracking = require('../../models/DeliveryTracking');

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /create', () => {
    it('should create a new order and tracking record successfully', async () => {
      // Setup model mocks
      const mockSave = jest.fn().mockResolvedValue(true);
      Order.mockImplementation(() => ({
        _id: 'mockOrderId',
        save: mockSave
      }));
      DeliveryTracking.mockImplementation(() => ({
        save: mockSave
      }));

      const res = await request(app)
        .post('/api/orders/create')
        .send({
          items: [{ productId: 'prod1', quantity: 2 }],
          totalPrice: 100,
          deliveryAddress: '123 Test St',
          deliveryPhone: '1234567890',
          destLat: 40.7128,
          destLng: -74.0060
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order created successfully');
      expect(mockSave).toHaveBeenCalledTimes(2);
    });

    it('should handle errors during creation', async () => {
      Order.mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Database error'))
      }));

      const res = await request(app)
        .post('/api/orders/create')
        .send({
          items: [],
          totalPrice: 100
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database error');
    });
  });

  describe('GET /my-orders', () => {
    it('should return all orders for the user', async () => {
      const mockOrders = [
        { _id: 'order1', totalPrice: 100 },
        { _id: 'order2', totalPrice: 200 }
      ];

      const mockSort = jest.fn().mockResolvedValue(mockOrders);
      const mockPopulate = jest.fn().mockReturnValue({ sort: mockSort });
      Order.find = jest.fn().mockReturnValue({ populate: mockPopulate });

      const res = await request(app).get('/api/orders/my-orders');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orders).toEqual(mockOrders);
      expect(Order.find).toHaveBeenCalledWith({ userId: 'mockUserId' });
      expect(mockPopulate).toHaveBeenCalledWith('items.productId');
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    });

    it('should handle errors when fetching orders', async () => {
      Order.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get('/api/orders/my-orders');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database error');
    });
  });

  describe('GET /:orderId/track', () => {
    it('should return order details and tracking info', async () => {
      const mockOrder = { _id: 'order123', status: 'Pending' };
      const mockTracking = { _id: 'tracking123', status: 'Pending' };

      Order.findById = jest.fn().mockResolvedValue(mockOrder);
      DeliveryTracking.findOne = jest.fn().mockResolvedValue(mockTracking);

      const res = await request(app).get('/api/orders/order123/track');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.order).toEqual(mockOrder);
      expect(res.body.tracking).toEqual(mockTracking);
      expect(Order.findById).toHaveBeenCalledWith('order123');
      expect(DeliveryTracking.findOne).toHaveBeenCalledWith({ orderId: 'order123' });
    });

    it('should return 404 if order is not found', async () => {
      Order.findById = jest.fn().mockResolvedValue(null);
      DeliveryTracking.findOne = jest.fn().mockResolvedValue(null);

      const res = await request(app).get('/api/orders/order123/track');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Order not found');
    });

    it('should return 404 if tracking is not found', async () => {
      const mockOrder = { _id: 'order123', status: 'Pending' };
      Order.findById = jest.fn().mockResolvedValue(mockOrder);
      DeliveryTracking.findOne = jest.fn().mockResolvedValue(null);

      const res = await request(app).get('/api/orders/order123/track');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Order not found');
    });

    it('should handle errors when tracking order', async () => {
      Order.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/api/orders/order123/track');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database error');
    });
  });

  describe('PUT /:orderId/status', () => {
    it('should update order status', async () => {
      const updatedOrder = { _id: 'order123', status: 'Delivered' };
      Order.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedOrder);

      const res = await request(app)
        .put('/api/orders/order123/status')
        .send({ status: 'Delivered' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order status updated');
      expect(res.body.order).toEqual(updatedOrder);
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        'order123',
        { status: 'Delivered' },
        { new: true }
      );
    });

    it('should handle errors when updating status', async () => {
      Order.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'));

      const res = await request(app)
        .put('/api/orders/order123/status')
        .send({ status: 'Delivered' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database error');
    });
  });

  describe('POST /:orderId/cancel', () => {
    it('should cancel the order', async () => {
      const cancelledOrder = { _id: 'order123', status: 'Cancelled' };
      Order.findByIdAndUpdate = jest.fn().mockResolvedValue(cancelledOrder);

      const res = await request(app).post('/api/orders/order123/cancel');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order cancelled successfully');
      expect(res.body.order).toEqual(cancelledOrder);
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        'order123',
        { status: 'Cancelled' },
        { new: true }
      );
    });

    it('should handle errors when cancelling order', async () => {
      Order.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Database error'));

      const res = await request(app).post('/api/orders/order123/cancel');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database error');
    });
  });
});
