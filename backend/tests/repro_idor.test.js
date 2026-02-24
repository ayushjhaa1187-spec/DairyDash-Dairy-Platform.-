const request = require('supertest');
const express = require('express');

// Mocks
jest.mock('../models/Order');
jest.mock('../models/DeliveryTracking');
// Use virtual mock because the middleware file might not exist in the environment
jest.mock('../middleware/authenticate', () => (req, res, next) => {
  req.user = { _id: 'user123' }; // Simulate logged-in user
  next();
}, { virtual: true });

const Order = require('../models/Order');
const DeliveryTracking = require('../models/DeliveryTracking');
const orderRoutes = require('../routes/Order.routes');

const app = express();
app.use(express.json());
app.use('/orders', orderRoutes);

describe('GET /orders/:orderId/track - IDOR Vulnerability', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should deny access if the order does not belong to the requesting user (userId check)', async () => {
    // Setup mocks
    const mockOrder = {
      _id: 'order456',
      userId: 'otherUser789',
      status: 'Pending'
    };

    Order.findById.mockResolvedValue(mockOrder);

    const mockTracking = {
      orderId: 'order456',
      status: 'Pending'
    };
    DeliveryTracking.findOne.mockResolvedValue(mockTracking);

    const response = await request(app).get('/orders/order456/track');

    // We expect 403 Forbidden
    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/unauthorized|access denied/i);
  });

  it('should allow access if the order belongs to the requesting user (userId check)', async () => {
    // Setup mocks
    const mockOrder = {
      _id: 'order123',
      userId: 'user123',
      status: 'Pending'
    };

    Order.findById.mockResolvedValue(mockOrder);

    const mockTracking = {
      orderId: 'order123',
      status: 'Pending'
    };
    DeliveryTracking.findOne.mockResolvedValue(mockTracking);

    const response = await request(app).get('/orders/order123/track');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.order).toEqual(mockOrder);
  });

  it('should deny access if order uses customerId and it does not match', async () => {
    // Setup mocks
    const mockOrder = {
      _id: 'order789',
      customerId: 'otherUser789',
      status: 'Pending'
    };

    Order.findById.mockResolvedValue(mockOrder);

    const mockTracking = {
      orderId: 'order789',
      status: 'Pending'
    };
    DeliveryTracking.findOne.mockResolvedValue(mockTracking);

    const response = await request(app).get('/orders/order789/track');

    expect(response.status).toBe(403);
  });

  it('should allow access if order uses customerId and it matches', async () => {
    // Setup mocks
    const mockOrder = {
      _id: 'order999',
      customerId: 'user123',
      status: 'Pending'
    };

    Order.findById.mockResolvedValue(mockOrder);

    const mockTracking = {
      orderId: 'order999',
      status: 'Pending'
    };
    DeliveryTracking.findOne.mockResolvedValue(mockTracking);

    const response = await request(app).get('/orders/order999/track');

    expect(response.status).toBe(200);
  });
});
