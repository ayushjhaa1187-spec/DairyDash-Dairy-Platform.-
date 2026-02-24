
const request = require('supertest');
const express = require('express');
const Product = require('../models/Product');
const productRoutes = require('../routes/Product.routes');

// Mock the Product model
jest.mock('../models/Product');

const app = express();
app.use(express.json());
app.use('/', productRoutes);

describe('Product Search Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use $text for search query (Optimized)', async () => {
    // Setup mock return values
    Product.find.mockReturnValue({
      limit: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      sort: jest.fn().mockResolvedValue([])
    });
    Product.countDocuments.mockResolvedValue(0);

    const searchTerm = 'cheese';
    await request(app).get('/all').query({ search: searchTerm });

    // Verify the query structure
    const callArgs = Product.find.mock.calls[0][0];

    // Check if it uses $text
    expect(callArgs).toHaveProperty('$text');
    expect(callArgs.$text).toHaveProperty('$search', searchTerm);

    // Ensure $regex is NOT used
    expect(callArgs).not.toHaveProperty('$or');
  });
});
