const mongoose = require('mongoose');
const Order = require('../../models/Order');

describe('Order Model Test', () => {
  it('should be valid with required fields', () => {
    const orderData = {
      orderNumber: 'ORD-12345',
      customerId: new mongoose.Types.ObjectId(),
      subtotal: 100,
      totalAmount: 110,
    };
    const order = new Order(orderData);
    const err = order.validateSync();
    expect(err).toBeUndefined();
  });

  it('should be invalid if required fields are empty', () => {
    const order = new Order();
    const err = order.validateSync();
    expect(err.errors.orderNumber).toBeDefined();
    expect(err.errors.customerId).toBeDefined();
    expect(err.errors.subtotal).toBeDefined();
    expect(err.errors.totalAmount).toBeDefined();
  });

  it('should save order items correctly', () => {
    const orderData = {
      orderNumber: 'ORD-12346',
      customerId: new mongoose.Types.ObjectId(),
      items: [
        {
          productId: new mongoose.Types.ObjectId(),
          productName: 'Milk',
          quantity: 2,
          price: 50,
          subtotal: 100
        }
      ],
      subtotal: 100,
      totalAmount: 100,
    };
    const order = new Order(orderData);
    const err = order.validateSync();
    expect(err).toBeUndefined();
    expect(order.items.length).toBe(1);
    expect(order.items[0].productName).toBe('Milk');
    expect(order.items[0].quantity).toBe(2);
    expect(order.items[0].price).toBe(50);
    expect(order.items[0].subtotal).toBe(100);
  });

  it('should correctly handle default values', () => {
     const orderData = {
      orderNumber: 'ORD-12347',
      customerId: new mongoose.Types.ObjectId(),
      subtotal: 100,
      totalAmount: 100,
    };
    const order = new Order(orderData);

    expect(order.status).toBe('PENDING');
    expect(order.paymentStatus).toBe('PENDING');
    expect(order.deliveryCharge).toBe(0);
  });
});
