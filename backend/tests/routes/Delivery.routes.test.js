const request = require('supertest');
const express = require('express');

// Mock dependencies
jest.mock('../../models/DeliveryTracking');
jest.mock('../../models/Order');
jest.mock('../../middleware/authenticate', () => (req, res, next) => next(), { virtual: true });

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

    describe('PUT /api/delivery/:orderId/update-location', () => {
        it('should update delivery location and status successfully', async () => {
            const mockTracking = {
                orderId: 'order123',
                status: 'Out for Delivery',
                currentLocation: {},
                trackingHistory: [],
                save: jest.fn().mockResolvedValue(true)
            };

            DeliveryTracking.findOne.mockResolvedValue(mockTracking);
            Order.findByIdAndUpdate.mockResolvedValue(true);

            const updateData = {
                latitude: 40.7128,
                longitude: -74.0060,
                address: '123 Main St',
                status: 'Delivered'
            };

            const response = await request(app)
                .put('/api/delivery/order123/update-location')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Location updated');

            // Verify mockTracking was updated
            expect(mockTracking.currentLocation).toEqual({
                latitude: 40.7128,
                longitude: -74.0060,
                address: '123 Main St'
            });
            expect(mockTracking.status).toBe('Delivered');
            expect(mockTracking.trackingHistory).toHaveLength(1);
            expect(mockTracking.trackingHistory[0]).toEqual({
                status: 'Delivered',
                location: {
                    latitude: 40.7128,
                    longitude: -74.0060,
                    address: '123 Main St'
                }
            });

            // Verify save was called
            expect(mockTracking.save).toHaveBeenCalled();

            // Verify Order.findByIdAndUpdate was called
            expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('order123', { status: 'Delivered' });
        });

        it('should update location without status change', async () => {
            const mockTracking = {
                orderId: 'order123',
                status: 'Out for Delivery',
                currentLocation: {},
                trackingHistory: [],
                save: jest.fn().mockResolvedValue(true)
            };

            DeliveryTracking.findOne.mockResolvedValue(mockTracking);
            Order.findByIdAndUpdate.mockResolvedValue(true);

            const updateData = {
                latitude: 40.7128,
                longitude: -74.0060,
                address: '123 Main St'
            };

            const response = await request(app)
                .put('/api/delivery/order123/update-location')
                .send(updateData);

            expect(response.status).toBe(200);
            expect(mockTracking.status).toBe('Out for Delivery'); // Unchanged
            expect(mockTracking.trackingHistory[0].status).toBe('Out for Delivery');

            expect(mockTracking.trackingHistory[0].location).toEqual({
                latitude: 40.7128,
                longitude: -74.0060,
                address: '123 Main St'
            });

            expect(Order.findByIdAndUpdate).toHaveBeenCalledWith('order123', { status: 'Out for Delivery' });
        });

        it('should return 404 if tracking not found', async () => {
            DeliveryTracking.findOne.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/delivery/order123/update-location')
                .send({ latitude: 1, longitude: 1 });

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Tracking not found');
            expect(Order.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        it('should return 400 if database error occurs during findOne', async () => {
            DeliveryTracking.findOne.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .put('/api/delivery/order123/update-location')
                .send({ latitude: 1, longitude: 1 });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Database error');
        });

        it('should return 400 if database error occurs during save', async () => {
            const mockTracking = {
                orderId: 'order123',
                status: 'Out for Delivery',
                currentLocation: {},
                trackingHistory: [],
                save: jest.fn().mockRejectedValue(new Error('Save error'))
            };

            DeliveryTracking.findOne.mockResolvedValue(mockTracking);

            const response = await request(app)
                .put('/api/delivery/order123/update-location')
                .send({ latitude: 1, longitude: 1 });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Save error');
        });
    });
});
