const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const authenticate = require('../middleware/authenticate');

// Get all products
router.get('/all', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 12 } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    const numericLimit = parseInt(limit);

    const result = await Product.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      {
        $facet: {
          metadata: [ { $count: "total" } ],
          data: [ { $skip: skip }, { $limit: numericLimit } ]
        }
      }
    ]);

    const products = result[0].data;
    const total = result[0].metadata[0] ? result[0].metadata[0].total : 0;

    res.json({
      success: true,
      products,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: parseInt(page)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get single product
router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Create product (admin only)
router.post('/create', authenticate, async (req, res) => {
  try {
    const { name, description, price, category, stock, image } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      image
    });

    await product.save();
    res.json({ success: true, message: 'Product created', product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update product (admin only)
router.put('/:productId/update', authenticate, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Product updated', product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Delete product (admin only)
router.delete('/:productId/delete', authenticate, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.productId);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Get products by category
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json({ success: true, products });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
