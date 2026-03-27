const express = require('express');
const request = require('supertest');

// Create mock models
const mockOrderSave = jest.fn();
const mockTrackingSave = jest.fn();

// Mock Mongoose models
jest.mock('../../models/Order', () => {
  return jest.fn().mockImplementation((data) => {
    return {
      ...data,
      _id: 'mock-order-id',
      save: mockOrderSave
    };
  });
});

jest.mock('../../models/DeliveryTracking', () => {
  return jest.fn().mockImplementation((data) => {
    return {
      ...data,
      _id: 'mock-tracking-id',
      save: mockTrackingSave
    };
  });
});

// Mock Authenticate middleware BEFORE requiring the routes
jest.mock('../../middleware/authenticate', () => {
  return (req, res, next) => {
    req.user = { _id: 'mock-user-id' };
    next();
  };
}, { virtual: true });

// Require the router AFTER mocking dependencies
const orderRoutes = require('../../routes/Order.routes');

// Setup Express app
const app = express();
app.use(express.json());
app.use('/api/orders', orderRoutes);

describe('Order Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/orders/create', () => {
    it('should return 200 and create an order and delivery tracking on valid input', async () => {
      // Setup mock returns
      mockOrderSave.mockResolvedValueOnce(true);
      mockTrackingSave.mockResolvedValueOnce(true);

      const requestBody = {
        items: [{ productId: 'prod1', quantity: 2, price: 10 }],
        totalPrice: 20,
        deliveryAddress: '123 Test St',
        deliveryPhone: '555-1234',
        destLat: 40.7128,
        destLng: -74.0060
      };

      const response = await request(app)
        .post('/api/orders/create')
        .send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Order created successfully');

      // Verify Order creation
      const Order = require('../../models/Order');
      expect(Order).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'mock-user-id',
        items: requestBody.items,
        totalPrice: requestBody.totalPrice,
        deliveryAddress: requestBody.deliveryAddress,
        deliveryPhone: requestBody.deliveryPhone,
        status: 'Pending'
      }));
      expect(mockOrderSave).toHaveBeenCalled();

      // Verify Tracking creation
      const DeliveryTracking = require('../../models/DeliveryTracking');
      expect(DeliveryTracking).toHaveBeenCalledWith(expect.objectContaining({
        orderId: 'mock-order-id',
        currentLocation: expect.objectContaining({
            latitude: 0,
            longitude: 0,
            address: 'Warehouse'
        }),
        destinationLocation: expect.objectContaining({
            latitude: requestBody.destLat,
            longitude: requestBody.destLng,
            address: requestBody.deliveryAddress
        }),
        status: 'Pending'
      }));
      expect(mockTrackingSave).toHaveBeenCalled();
    });

    it('should return 400 when order creation fails due to db error', async () => {
      const errorMessage = 'Database connection failed';
      mockOrderSave.mockRejectedValueOnce(new Error(errorMessage));

      const requestBody = {
        items: [{ productId: 'prod1', quantity: 1, price: 50 }],
        totalPrice: 50,
        deliveryAddress: '456 Fail Ave',
        deliveryPhone: '555-9999'
      };

      const response = await request(app)
        .post('/api/orders/create')
        .send(requestBody);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(errorMessage);

      expect(mockOrderSave).toHaveBeenCalled();
      expect(mockTrackingSave).not.toHaveBeenCalled();
    });
  });
});
