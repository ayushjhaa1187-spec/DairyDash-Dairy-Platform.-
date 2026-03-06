const request = require('supertest');
const express = require('express');

// Mock authenticate middleware virtually
jest.mock('../../middleware/authenticate', () => (req, res, next) => {
  req.user = { _id: 'mockUserId' };
  next();
}, { virtual: true });

// Mock Mongoose models
jest.mock('../../models/Order');
jest.mock('../../models/DeliveryTracking');

const Order = require('../../models/Order');
const orderRoutes = require('../../routes/Order.routes');

const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order Routes - POST /:orderId/cancel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully cancel the order', async () => {
    const mockOrder = {
      _id: 'orderId123',
      status: 'Cancelled',
    };

    Order.findByIdAndUpdate.mockResolvedValue(mockOrder);

    const response = await request(app)
      .post('/api/orders/orderId123/cancel')
      .send();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Order cancelled successfully',
      order: mockOrder,
    });

    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
      'orderId123',
      { status: 'Cancelled' },
      { new: true }
    );
  });

  it('should handle errors gracefully', async () => {
    Order.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/api/orders/orderId123/cancel')
      .send();

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      message: 'Database error',
    });
  });
});
