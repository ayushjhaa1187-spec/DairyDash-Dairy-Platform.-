const express = require('express');
const request = require('supertest');

// Mock dependencies
jest.mock('../../models/Order');
jest.mock('../../models/DeliveryTracking');
jest.mock('../../middleware/authenticate', () => (req, res, next) => {
  req.user = { _id: 'testUserId' };
  next();
}, { virtual: true });

const Order = require('../../models/Order');
const DeliveryTracking = require('../../models/DeliveryTracking');
const OrderRoutes = require('../../routes/Order.routes');

const app = express();
app.use(express.json());
app.use('/orders', OrderRoutes);

describe('Order Routes - POST /create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create an order and tracking successfully', async () => {
    const mockOrder = {
      _id: 'testOrderId',
      userId: 'testUserId',
      items: [{ productId: 'prod1', quantity: 2 }],
      totalPrice: 100,
      deliveryAddress: '123 Test St',
      deliveryPhone: '1234567890',
      status: 'Pending',
      save: jest.fn().mockResolvedValue(true)
    };

    const mockTracking = {
      _id: 'testTrackingId',
      orderId: 'testOrderId',
      status: 'Pending',
      save: jest.fn().mockResolvedValue(true)
    };

    Order.mockImplementation(() => mockOrder);
    DeliveryTracking.mockImplementation(() => mockTracking);

    const res = await request(app)
      .post('/orders/create')
      .send({
        items: [{ productId: 'prod1', quantity: 2 }],
        totalPrice: 100,
        deliveryAddress: '123 Test St',
        deliveryPhone: '1234567890',
        destLat: 40.7128,
        destLng: -74.0060
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Order created successfully');
    expect(Order).toHaveBeenCalledTimes(1);
    expect(mockOrder.save).toHaveBeenCalledTimes(1);
    expect(DeliveryTracking).toHaveBeenCalledTimes(1);
    expect(mockTracking.save).toHaveBeenCalledTimes(1);
  });

  it('should return 400 if order save fails', async () => {
    const mockOrder = {
      save: jest.fn().mockRejectedValue(new Error('Validation error'))
    };

    Order.mockImplementation(() => mockOrder);

    const res = await request(app)
      .post('/orders/create')
      .send({
        items: [],
        totalPrice: 100
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation error');
    expect(DeliveryTracking).not.toHaveBeenCalled();
  });
});
