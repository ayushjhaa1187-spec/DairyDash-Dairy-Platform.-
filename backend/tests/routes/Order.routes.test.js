const express = require('express');
const request = require('supertest');
const router = require('../../routes/Order.routes');

const Order = require('../../models/Order');
const DeliveryTracking = require('../../models/DeliveryTracking');

jest.mock('../../models/Order');
jest.mock('../../models/DeliveryTracking');
jest.mock('../../middleware/authenticate', () => (req, res, next) => {
  req.user = { _id: 'mockUserId' };
  next();
}, { virtual: true });

const app = express();
app.use(express.json());
app.use('/orders', router);

describe('Order Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /orders/create', () => {
    it('should create an order successfully', async () => {
      const mockOrder = { _id: 'mockOrderId', save: jest.fn() };
      const mockTracking = { save: jest.fn() };
      Order.mockImplementation(() => mockOrder);
      DeliveryTracking.mockImplementation(() => mockTracking);

      const res = await request(app)
        .post('/orders/create')
        .send({
          items: [],
          totalPrice: 100,
          deliveryAddress: '123 Main St',
          deliveryPhone: '1234567890'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockOrder.save).toHaveBeenCalled();
      expect(mockTracking.save).toHaveBeenCalled();
    });

    it('should return 400 when order creation fails', async () => {
      // Mock Order creation to throw an error
      const mockError = new Error('Database error');
      const mockOrder = {
        save: jest.fn().mockRejectedValue(mockError)
      };
      Order.mockImplementation(() => mockOrder);

      const res = await request(app)
        .post('/orders/create')
        .send({
          items: [],
          totalPrice: 100,
          deliveryAddress: '123 Main St',
          deliveryPhone: '1234567890'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database error');
    });
  });
});
