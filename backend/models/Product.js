const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  image: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Compound text index for search
productSchema.index({ name: 'text', description: 'text' });
// Index for category filtering
productSchema.index({ category: 1 });

module.exports = mongoose.model('Product', productSchema);
