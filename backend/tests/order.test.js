const mongoose = require('mongoose');
const Order = require('../models/Order');

describe('Order Model Items Validation', () => {

    it('should be invalid if items array contains an item without required fields', () => {
        const order = new Order({
            items: [{}] // Empty item object
        });

        const err = order.validateSync();
        expect(err.errors['items.0.productId']).toBeDefined();
        expect(err.errors['items.0.productName']).toBeDefined();
        expect(err.errors['items.0.quantity']).toBeDefined();
        expect(err.errors['items.0.price']).toBeDefined();
    });

    it('should be invalid if quantity is less than 1', () => {
        const order = new Order({
            items: [{
                productId: new mongoose.Types.ObjectId(),
                productName: 'Test Product',
                quantity: 0,
                price: 10
            }]
        });

        const err = order.validateSync();
        expect(err.errors['items.0.quantity']).toBeDefined();
    });

    it('should be invalid if price is negative', () => {
        const order = new Order({
            items: [{
                productId: new mongoose.Types.ObjectId(),
                productName: 'Test Product',
                quantity: 1,
                price: -5
            }]
        });

        const err = order.validateSync();
        expect(err.errors['items.0.price']).toBeDefined();
    });

    it('should be valid with correct item structure', () => {
        const order = new Order({
            orderNumber: 'ORD-123',
            customerId: new mongoose.Types.ObjectId(),
            items: [{
                productId: new mongoose.Types.ObjectId(),
                productName: 'Test Product',
                quantity: 2,
                price: 100,
                subtotal: 200
            }],
            subtotal: 200,
            totalAmount: 200,
            status: 'PENDING'
        });

        const err = order.validateSync();
        expect(err).toBeUndefined();
    });
});
