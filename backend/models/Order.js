const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: { type: String, unique: true, required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Order Items
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    subtotal: Number
  }],
  
  // Pricing
  subtotal: { type: Number, required: true },
  taxAmount: Number,
  deliveryCharge: { type: Number, default: 0 },
  discountApplied: Number,
  totalAmount: { type: Number, required: true },
  
  // Delivery Address
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    latitude: Number,
    longitude: Number
  },
  
  // Order Status
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'],
    default: 'PENDING'
  },
  
  // Status Timestamps
  confirmedAt: Date,
  packedAt: Date,
  dispatchedAt: Date,
  outForDeliveryAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  
  // Payment
  paymentMethod: { type: String, enum: ['CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'WALLET', 'COD'] },
  paymentStatus: { type: String, enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' },
  paymentId: String,
  transactionId: String,
  
  // Delivery Tracking
  deliveryTrackingId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryTracking' },
  deliveryAgentId: { type: mongoose.Schema.Types.ObjectId, ref: 'DeliveryAgent' },
  estimatedDeliveryTime: Date,
  actualDeliveryTime: Date,
  
  // Notes
  specialInstructions: String,
  cancellationReason: String,
  
  // Ratings & Reviews
  productRating: { type: Number, min: 1, max: 5 },
  deliveryRating: { type: Number, min: 1, max: 5 },
  agentRating: { type: Number, min: 1, max: 5 },
  customerReview: String,
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes for performance
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ deliveryTrackingId: 1 });

module.exports = mongoose.model('Order', OrderSchema);
