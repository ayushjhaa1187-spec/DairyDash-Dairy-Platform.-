const mongoose = require('mongoose');
const Order = require('../../models/Order');

describe('Order Model Status Enum Tests', () => {

    // Helper to create valid order data
    const createValidOrderData = () => ({
        orderNumber: 'ORD-' + Math.random().toString(36).substr(2, 9),
        customerId: new mongoose.Types.ObjectId(),
        subtotal: 100,
        totalAmount: 110,
        items: [{
            productId: new mongoose.Types.ObjectId(),
            productName: 'Milk',
            quantity: 2,
            price: 50,
            subtotal: 100
        }],
        deliveryAddress: {
            street: '123 Test St',
            city: 'Test City',
            state: 'Test State',
            postalCode: '12345',
            country: 'Test Country',
            latitude: 0,
            longitude: 0
        }
    });

    test('should default to PENDING status when no status is provided', () => {
        const orderData = createValidOrderData();
        const order = new Order(orderData);

        // Validation should pass
        const error = order.validateSync();
        expect(error).toBeUndefined();

        // Check default value
        expect(order.status).toBe('PENDING');
    });

    test('should accept all valid status values', () => {
        const validStatuses = [
            'PENDING',
            'CONFIRMED',
            'PACKED',
            'DISPATCHED',
            'OUT_FOR_DELIVERY',
            'DELIVERED',
            'CANCELLED'
        ];

        validStatuses.forEach(status => {
            const orderData = createValidOrderData();
            orderData.status = status;
            const order = new Order(orderData);

            const error = order.validateSync();
            expect(error).toBeUndefined();
            expect(order.status).toBe(status);
        });
    });

    test('should reject invalid status values', () => {
        const invalidStatuses = ['INVALID', 'SHIPPED', 'pending', 'COMPLETED', 'archive'];

        invalidStatuses.forEach(status => {
            const orderData = createValidOrderData();
            orderData.status = status;
            const order = new Order(orderData);

            const error = order.validateSync();
            expect(error).toBeDefined();
            expect(error.errors['status']).toBeDefined();
            expect(error.errors['status'].kind).toBe('enum');
        });
    });
});
