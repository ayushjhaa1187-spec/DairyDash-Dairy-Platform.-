const request = require('supertest');
const express = require('express');

// Mock authentication middleware before importing the router
jest.mock('../../middleware/authenticate', () => {
  return (req, res, next) => {
    req.user = { _id: 'mockUserId' };
    next();
  };
}, { virtual: true });

// Mock Models
jest.mock('../../models/Order');
jest.mock('../../models/DeliveryTracking');

const Order = require('../../models/Order');
const DeliveryTracking = require('../../models/DeliveryTracking');
const orderRoutes = require('../../routes/Order.routes');

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('GET /api/orders/:orderId/track', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 404 if order is not found', async () => {
    Order.findById.mockResolvedValue(null);
    DeliveryTracking.findOne.mockResolvedValue({ status: 'Pending' });

    const response = await request(app).get('/api/orders/123/track');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ success: false, message: 'Order not found' });
    expect(Order.findById).toHaveBeenCalledWith('123');
    expect(DeliveryTracking.findOne).toHaveBeenCalledWith({ orderId: '123' });
  });

  it('should return 404 if tracking is not found', async () => {
    Order.findById.mockResolvedValue({ _id: '123' });
    DeliveryTracking.findOne.mockResolvedValue(null);

    const response = await request(app).get('/api/orders/123/track');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ success: false, message: 'Order not found' });
  });

  it('should return 200 with order and tracking details if both exist', async () => {
    const mockOrder = { _id: '123', status: 'Pending' };
    const mockTracking = { orderId: '123', status: 'Pending' };

    Order.findById.mockResolvedValue(mockOrder);
    DeliveryTracking.findOne.mockResolvedValue(mockTracking);

    const response = await request(app).get('/api/orders/123/track');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.order).toEqual(mockOrder);
    expect(response.body.tracking).toEqual(mockTracking);
  });

  it('should return 400 if an error occurs', async () => {
    Order.findById.mockRejectedValue(new Error('Database error'));

    const response = await request(app).get('/api/orders/123/track');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ success: false, message: 'Database error' });
  });
});
