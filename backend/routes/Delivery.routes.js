const express = require('express');
const router = express.Router();
const DeliveryTracking = require('../models/DeliveryTracking');
const Order = require('../models/Order');
const authenticate = require('../middleware/authenticate');

// Update delivery location (real-time tracking)
router.put('/:orderId/update-location', authenticate, async (req, res) => {
  try {
    const { latitude, longitude, address, status } = req.body;

    const tracking = await DeliveryTracking.findOne({ orderId: req.params.orderId });
    if (!tracking) {
      return res.status(404).json({ success: false, message: 'Tracking not found' });
    }

    // Update current location
    tracking.currentLocation = {
      latitude,
      longitude,
      address
    };

    // Update status if provided
    if (status) {
      tracking.status = status;
    }

    // Add to tracking history
    tracking.trackingHistory.push({
      status: tracking.status,
      location: {
        latitude,
        longitude,
        address
      }
    });

    await tracking.save();

    // Update order status
    await Order.findByIdAndUpdate(req.params.orderId, { status: tracking.status });

    res.json({ success: true, message: 'Location updated', tracking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get delivery tracking details
router.get('/:orderId', authenticate, async (req, res) => {
  try {
    const tracking = await DeliveryTracking.findOne({ orderId: req.params.orderId });
    if (!tracking) {
      return res.status(404).json({ success: false, message: 'Tracking not found' });
    }
    res.json({ success: true, tracking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get tracking history
router.get('/:orderId/history', authenticate, async (req, res) => {
  try {
    const tracking = await DeliveryTracking.findOne({ orderId: req.params.orderId });
    if (!tracking) {
      return res.status(404).json({ success: false, message: 'Tracking not found' });
    }
    res.json({
      success: true,
      history: tracking.trackingHistory,
      status: tracking.status
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update delivery person details
router.put('/:orderId/delivery-person', authenticate, async (req, res) => {
  try {
    const { deliveryPersonName, deliveryPersonPhone, vehicleNumber, estimatedDeliveryTime } = req.body;

    const tracking = await DeliveryTracking.findOne({ orderId: req.params.orderId });
    if (!tracking) {
      return res.status(404).json({ success: false, message: 'Tracking not found' });
    }

    tracking.deliveryPersonName = deliveryPersonName;
    tracking.deliveryPersonPhone = deliveryPersonPhone;
    tracking.vehicleNumber = vehicleNumber;
    tracking.estimatedDeliveryTime = estimatedDeliveryTime;

    await tracking.save();
    res.json({ success: true, message: 'Delivery person details updated', tracking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Mark as delivered
router.put('/:orderId/mark-delivered', authenticate, async (req, res) => {
  try {
    const tracking = await DeliveryTracking.findOne({ orderId: req.params.orderId });
    if (!tracking) {
      return res.status(404).json({ success: false, message: 'Tracking not found' });
    }

    tracking.status = 'Delivered';
    tracking.actualDeliveryTime = new Date();
    tracking.trackingHistory.push({
      status: 'Delivered',
      location: tracking.currentLocation
    });

    await Promise.all([
      tracking.save(),
      Order.findByIdAndUpdate(req.params.orderId, { status: 'Delivered' })
    ]);

    res.json({ success: true, message: 'Order marked as delivered', tracking });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
