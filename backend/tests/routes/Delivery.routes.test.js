const request = require('supertest');
const express = require('express');

jest.mock('../../middleware/authenticate', () => (req, res, next) => next(), { virtual: true });
jest.mock('../../models/DeliveryTracking');
jest.mock('../../models/Order');

const DeliveryTracking = require('../../models/DeliveryTracking');
const Order = require('../../models/Order');
const deliveryRoutes = require('../../routes/Delivery.routes');

const app = express();
app.use(express.json());
app.use('/api/delivery', deliveryRoutes);

describe('Delivery Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PUT /:orderId/update-location', () => {
    it('should update location successfully', async () => {
      const orderId = 'someOrderId';
      const mockTracking = {
        _id: 'trackingId',
        orderId,
        trackingHistory: [],
        save: jest.fn().mockResolvedValue(true)
      };

      DeliveryTracking.findOne.mockResolvedValue(mockTracking);
      Order.findByIdAndUpdate.mockResolvedValue({ _id: orderId });

      const payload = {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY',
        status: 'In Transit'
      };

      const response = await request(app)
        .put(`/api/delivery/${orderId}/update-location`)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Location updated');
      expect(response.body.tracking).toBeDefined();

      expect(mockTracking.currentLocation).toEqual({
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address
      });
      expect(mockTracking.status).toBe(payload.status);
      expect(mockTracking.trackingHistory.length).toBe(1);
      expect(mockTracking.trackingHistory[0].status).toBe(payload.status);
      expect(mockTracking.trackingHistory[0].location).toEqual({
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address
      });

      expect(mockTracking.save).toHaveBeenCalled();
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(orderId, { status: payload.status });
    });

    it('should update location without status', async () => {
      const orderId = 'someOrderId';
      const mockTracking = {
        _id: 'trackingId',
        orderId,
        status: 'Pending',
        trackingHistory: [],
        save: jest.fn().mockResolvedValue(true)
      };

      DeliveryTracking.findOne.mockResolvedValue(mockTracking);
      Order.findByIdAndUpdate.mockResolvedValue({ _id: orderId });

      const payload = {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY'
      };

      const response = await request(app)
        .put(`/api/delivery/${orderId}/update-location`)
        .send(payload);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Location updated');
      expect(response.body.tracking).toBeDefined();

      expect(mockTracking.currentLocation).toEqual({
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address
      });
      expect(mockTracking.status).toBe('Pending'); // Status remains unchanged
      expect(mockTracking.trackingHistory.length).toBe(1);
      expect(mockTracking.trackingHistory[0].status).toBe('Pending'); // Uses original status
      expect(mockTracking.trackingHistory[0].location).toEqual({
        latitude: payload.latitude,
        longitude: payload.longitude,
        address: payload.address
      });

      expect(mockTracking.save).toHaveBeenCalled();
      expect(Order.findByIdAndUpdate).toHaveBeenCalledWith(orderId, { status: 'Pending' });
    });

    it('should return 404 if tracking not found', async () => {
      const orderId = 'someOrderId';
      DeliveryTracking.findOne.mockResolvedValue(null);

      const payload = {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY',
        status: 'In Transit'
      };

      const response = await request(app)
        .put(`/api/delivery/${orderId}/update-location`)
        .send(payload);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Tracking not found');
      expect(DeliveryTracking.findOne).toHaveBeenCalledWith({ orderId });
    });

    it('should return 400 on error', async () => {
      const orderId = 'someOrderId';
      DeliveryTracking.findOne.mockRejectedValue(new Error('Database error'));

      const payload = {
        latitude: 40.7128,
        longitude: -74.0060,
        address: 'New York, NY',
        status: 'In Transit'
      };

      const response = await request(app)
        .put(`/api/delivery/${orderId}/update-location`)
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database error');
    });
  });
});
