const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  discountPrice: {
    type: Number,
    min: 0
  },
  unit: {
    type: String,
    default: '500ml' // e.g., 500ml, 1kg, 200g
  },
  category: {
    type: String,
    required: true,
    enum: ['Milk', 'Paneer & Cheese', 'Curd & Yogurt', 'Butter & Ghee', 'Ice Cream', 'Beverages', 'Other']
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    default: 'https://placehold.co/300x300?text=Product+Image'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBestSeller: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for search
ProductSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', ProductSchema);
