const express = require('express');
const request = require('supertest');

// Need to define a custom mongoose connection mock if we don't have mongodb-memory-server
jest.mock('../../models/Order');
jest.mock('../../models/DeliveryTracking');

const Order = require('../../models/Order');
const DeliveryTracking = require('../../models/DeliveryTracking');
const orderRoutes = require('../../routes/Order.routes');

// Create a mock authenticate middleware for our test app
jest.mock('../../middleware/authenticate', () => (req, res, next) => {
  // We'll set req.user in our tests using headers for simplicity
  req.user = {
    _id: req.headers['x-user-id'] || 'mockUserId',
    role: req.headers['x-user-role'] || 'user'
  };
  next();
});

const app = express();
app.use(express.json());
app.use('/orders', orderRoutes);

describe('Order Routes IDOR Fix', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /orders/:orderId/cancel', () => {
    it('should cancel the order if the user owns it (userId matches)', async () => {
      Order.findOneAndUpdate.mockResolvedValue({ _id: 'order123', status: 'Cancelled' });

      const res = await request(app)
        .post('/orders/order123/cancel')
        .set('x-user-id', 'user123')
        .send();

      expect(res.statusCode).toBe(200);
      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: 'order123',
          $or: [{ userId: 'user123' }, { customerId: 'user123' }]
        },
        { status: 'Cancelled' },
        { new: true }
      );
    });

    it('should cancel the order if the user is an admin', async () => {
      Order.findOneAndUpdate.mockResolvedValue({ _id: 'order123', status: 'Cancelled' });

      const res = await request(app)
        .post('/orders/order123/cancel')
        .set('x-user-role', 'admin')
        .send();

      expect(res.statusCode).toBe(200);
      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'order123' },
        { status: 'Cancelled' },
        { new: true }
      );
    });

    it('should return 404/unauthorized if user does not own order', async () => {
      Order.findOneAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .post('/orders/order123/cancel')
        .set('x-user-id', 'differentUser')
        .send();

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Order not found or unauthorized');
    });
  });

  describe('PUT /orders/:orderId/status', () => {
    it('should update the order if the user owns it', async () => {
      Order.findOneAndUpdate.mockResolvedValue({ _id: 'order123', status: 'Delivered' });

      const res = await request(app)
        .put('/orders/order123/status')
        .set('x-user-id', 'user123')
        .send({ status: 'Delivered' });

      expect(res.statusCode).toBe(200);
      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        {
          _id: 'order123',
          $or: [{ userId: 'user123' }, { customerId: 'user123' }]
        },
        { status: 'Delivered' },
        { new: true }
      );
    });

    it('should update the order if the user is an admin', async () => {
      Order.findOneAndUpdate.mockResolvedValue({ _id: 'order123', status: 'Delivered' });

      const res = await request(app)
        .put('/orders/order123/status')
        .set('x-user-role', 'admin')
        .send({ status: 'Delivered' });

      expect(res.statusCode).toBe(200);
      expect(Order.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: 'order123' },
        { status: 'Delivered' },
        { new: true }
      );
    });

    it('should return 404/unauthorized if user does not own order', async () => {
      Order.findOneAndUpdate.mockResolvedValue(null);

      const res = await request(app)
        .put('/orders/order123/status')
        .set('x-user-id', 'differentUser')
        .send({ status: 'Delivered' });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Order not found or unauthorized');
    });
  });

  describe('GET /orders/:orderId/track', () => {
    it('should get tracking if user owns order', async () => {
      Order.findOne.mockResolvedValue({ _id: 'order123' });
      DeliveryTracking.findOne.mockResolvedValue({ _id: 'tracking123' });

      const res = await request(app)
        .get('/orders/order123/track')
        .set('x-user-id', 'user123')
        .send();

      expect(res.statusCode).toBe(200);
      expect(Order.findOne).toHaveBeenCalledWith(
        {
          _id: 'order123',
          $or: [{ userId: 'user123' }, { customerId: 'user123' }]
        }
      );
    });

    it('should return 404/unauthorized if user does not own order', async () => {
      Order.findOne.mockResolvedValue(null);

      const res = await request(app)
        .get('/orders/order123/track')
        .set('x-user-id', 'differentUser')
        .send();

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe('Order not found or unauthorized');
    });
  });
});
