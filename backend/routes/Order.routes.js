const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const DeliveryTracking = require('../models/DeliveryTracking');
const authenticate = require('../middleware/authenticate');
const { body, validationResult } = require('express-validator');

// Create new order
router.post('/create', [
  authenticate,
  // Validate items
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*.productId').isMongoId().withMessage('Invalid product ID'),
  body('items.*.productName').optional().isString().trim().escape(),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('items.*.subtotal').isFloat({ min: 0 }).withMessage('Subtotal must be a positive number'),

  body('totalPrice').isFloat({ min: 0 }).withMessage('Total price must be a positive number'),

  // Validate deliveryAddress
  body('deliveryAddress').optional().isObject().withMessage('Delivery address must be an object'),
  body('deliveryAddress.street').optional().isString().trim().escape(),
  body('deliveryAddress.city').optional().isString().trim().escape(),
  body('deliveryAddress.state').optional().isString().trim().escape(),
  body('deliveryAddress.postalCode').optional().isString().trim().escape(),
  body('deliveryAddress.country').optional().isString().trim().escape(),
  body('deliveryAddress.latitude').optional().isNumeric(),
  body('deliveryAddress.longitude').optional().isNumeric(),

  // Validate deliveryPhone
  body('deliveryPhone').optional().isString().trim().escape()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { items, totalPrice, deliveryAddress, deliveryPhone } = req.body;

    const order = new Order({
      userId: req.user._id,
      items,
      totalPrice,
      deliveryAddress,
      deliveryPhone,
      status: 'Pending'
    });

    await order.save();

    // Create delivery tracking record
    const tracking = new DeliveryTracking({
      orderId: order._id,
      currentLocation: {
        latitude: 0,
        longitude: 0,
        address: 'Warehouse'
      },
      destinationLocation: {
        latitude: req.body.destLat || 0,
        longitude: req.body.destLng || 0,
        address: deliveryAddress
      },
      status: 'Pending'
    });

    await tracking.save();

    res.json({
      success: true,
      message: 'Order created successfully',
      order,
      tracking
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get all orders for user
router.get('/my-orders', authenticate, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get order details with tracking
router.get('/:orderId/track', authenticate, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    const tracking = await DeliveryTracking.findOne({ orderId: req.params.orderId });

    if (!order || !tracking) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order, tracking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update order status
router.put('/:orderId/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status },
      { new: true }
    );

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Cancel order
router.post('/:orderId/cancel', authenticate, async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: 'Cancelled' },
      { new: true }
    );

    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
