const express = require('express');
const request = require('supertest');

// Mock dependencies
jest.mock('../../middleware/authenticate', () => (req, res, next) => {
  req.user = { _id: 'testUserId' };
  next();
}, { virtual: true });

jest.mock('../../models/Order');
jest.mock('../../models/DeliveryTracking');

const Order = require('../../models/Order');
const orderRoutes = require('../../routes/Order.routes');

const app = express();
app.use(express.json());
app.use('/orders', orderRoutes);

describe('POST /orders/:orderId/cancel', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully cancel an order', async () => {
    const mockOrder = { _id: 'testOrderId', status: 'Cancelled' };
    Order.findByIdAndUpdate.mockResolvedValue(mockOrder);

    const response = await request(app)
      .post('/orders/testOrderId/cancel')
      .expect(200);

    expect(response.body).toEqual({
      success: true,
      message: 'Order cancelled successfully',
      order: mockOrder
    });
    expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(
      'testOrderId',
      { status: 'Cancelled' },
      { new: true }
    );
  });

  it('should return 400 if cancellation fails', async () => {
    Order.findByIdAndUpdate.mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .post('/orders/testOrderId/cancel')
      .expect(400);

    expect(response.body).toEqual({
      success: false,
      message: 'Database error'
    });
  });
});
