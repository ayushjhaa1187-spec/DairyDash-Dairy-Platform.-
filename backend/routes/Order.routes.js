const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const DeliveryTracking = require('../models/DeliveryTracking');
const authenticate = require('../middleware/authenticate');

// Create new order
router.post('/create', authenticate, async (req, res) => {
  try {
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
    const query = req.user.role === 'admin'
      ? { _id: req.params.orderId }
      : {
          _id: req.params.orderId,
          $or: [{ userId: req.user._id }, { customerId: req.user._id }]
        };

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or unauthorized' });
    }

    const tracking = await DeliveryTracking.findOne({ orderId: req.params.orderId });

    if (!tracking) {
      return res.status(404).json({ success: false, message: 'Tracking not found for this order' });
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

    // Only admins or the order owner can update status (though usually only admins/delivery partners should update status, we align with the cancellation logic for safety)
    const query = req.user.role === 'admin'
      ? { _id: req.params.orderId }
      : {
          _id: req.params.orderId,
          $or: [{ userId: req.user._id }, { customerId: req.user._id }]
        };

    const order = await Order.findOneAndUpdate(
      query,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or unauthorized' });
    }

    res.json({ success: true, message: 'Order status updated', order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Cancel order
router.post('/:orderId/cancel', authenticate, async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.orderId }
      : {
          _id: req.params.orderId,
          $or: [{ userId: req.user._id }, { customerId: req.user._id }]
        };

    const order = await Order.findOneAndUpdate(
      query,
      { status: 'Cancelled' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found or unauthorized' });
    }

    res.json({ success: true, message: 'Order cancelled successfully', order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
