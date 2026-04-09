const express = require('express');
const request = require('supertest');

// Mocks have to be defined before required so that Jest hoists them
jest.mock('../../models/Order');
jest.mock('../../models/DeliveryTracking');

// If the middleware doesn't exist at all yet in the real code, we must use virtual mock
jest.mock('../../middleware/authenticate', () => {
  return (req, res, next) => {
    req.user = { _id: 'mock-user-id' };
    next();
  };
}, { virtual: true });

const Order = require('../../models/Order');
const DeliveryTracking = require('../../models/DeliveryTracking');
const authenticate = require('../../middleware/authenticate');
const orderRoutes = require('../../routes/Order.routes');

describe('Order Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/orders', orderRoutes);
    jest.clearAllMocks();
  });

  describe('POST /api/orders/create', () => {
    it('should create an order and tracking successfully', async () => {
      const mockOrder = { _id: 'order123', status: 'Pending' };
      const mockTracking = { _id: 'tracking123', status: 'Pending' };

      Order.prototype.save = jest.fn().mockResolvedValue(mockOrder);
      DeliveryTracking.prototype.save = jest.fn().mockResolvedValue(mockTracking);

      const reqBody = {
        items: [{ productId: 'prod1', quantity: 2 }],
        totalPrice: 100,
        deliveryAddress: '123 Main St',
        deliveryPhone: '555-1234',
        destLat: 40.7128,
        destLng: -74.0060
      };

      const res = await request(app)
        .post('/api/orders/create')
        .send(reqBody);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order created successfully');

      expect(Order.prototype.save).toHaveBeenCalledTimes(1);
      expect(DeliveryTracking.prototype.save).toHaveBeenCalledTimes(1);
    });

    it('should return 400 on error', async () => {
      Order.prototype.save = jest.fn().mockRejectedValue(new Error('Save failed'));

      const res = await request(app)
        .post('/api/orders/create')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Save failed');
    });
  });

  describe('GET /api/orders/my-orders', () => {
    it('should return user orders successfully', async () => {
      const mockOrders = [
        { _id: 'order1', userId: 'mock-user-id', items: [] },
        { _id: 'order2', userId: 'mock-user-id', items: [] }
      ];

      const populateMock = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockOrders)
      });
      Order.find = jest.fn().mockReturnValue({
        populate: populateMock
      });

      const res = await request(app).get('/api/orders/my-orders');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.orders).toEqual(mockOrders);
      expect(Order.find).toHaveBeenCalledWith({ userId: 'mock-user-id' });
    });

    it('should return 400 on error', async () => {
      Order.find = jest.fn().mockImplementation(() => {
        throw new Error('Find failed');
      });

      const res = await request(app).get('/api/orders/my-orders');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Find failed');
    });
  });

  describe('GET /api/orders/:orderId/track', () => {
    it('should return order and tracking details successfully', async () => {
      const mockOrder = { _id: 'order123' };
      const mockTracking = { _id: 'tracking123', orderId: 'order123' };

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

    it('should return 404 if order not found', async () => {
      Order.findById = jest.fn().mockResolvedValue(null);
      DeliveryTracking.findOne = jest.fn().mockResolvedValue(null);

      const res = await request(app).get('/api/orders/order123/track');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Order not found');
    });

    it('should return 400 on error', async () => {
      Order.findById = jest.fn().mockRejectedValue(new Error('Track failed'));

      const res = await request(app).get('/api/orders/order123/track');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Track failed');
    });
  });

  describe('PUT /api/orders/:orderId/status', () => {
    it('should update order status successfully', async () => {
      const mockOrder = { _id: 'order123', status: 'Shipped' };
      Order.findByIdAndUpdate = jest.fn().mockResolvedValue(mockOrder);

      const res = await request(app)
        .put('/api/orders/order123/status')
        .send({ status: 'Shipped' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order status updated');
      expect(res.body.order).toEqual(mockOrder);
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        'order123',
        { status: 'Shipped' },
        { new: true }
      );
    });

    it('should return 400 on error', async () => {
      Order.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Update failed'));

      const res = await request(app)
        .put('/api/orders/order123/status')
        .send({ status: 'Shipped' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Update failed');
    });
  });

  describe('POST /api/orders/:orderId/cancel', () => {
    it('should cancel order successfully', async () => {
      const mockOrder = { _id: 'order123', status: 'Cancelled' };
      Order.findByIdAndUpdate = jest.fn().mockResolvedValue(mockOrder);

      const res = await request(app)
        .post('/api/orders/order123/cancel');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Order cancelled successfully');
      expect(res.body.order).toEqual(mockOrder);
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
        'order123',
        { status: 'Cancelled' },
        { new: true }
      );
    });

    it('should return 400 on error', async () => {
      Order.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Cancel failed'));

      const res = await request(app)
        .post('/api/orders/order123/cancel');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Cancel failed');
    });
  });
});
