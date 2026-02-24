const request = require('supertest');
const express = require('express');

// We need to mock BEFORE requiring the routes
jest.mock('../models/Product', () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  findById: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}));

// Mock the missing middleware using virtual: true
jest.mock('../middleware/authenticate', () => (req, res, next) => next(), { virtual: true });

const productRoutes = require('./Product.routes');
const Product = require('../models/Product');

const app = express();
app.use(express.json());
app.use('/products', productRoutes);

describe('Product Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should escape special regex characters in search query', async () => {
    const searchString = '(a+)+';
    const expectedEscaped = '\\(a\\+\\)\\+';

    const mockSort = jest.fn().mockResolvedValue([]);
    const mockSkip = jest.fn().mockReturnValue({ sort: mockSort });
    const mockLimit = jest.fn().mockReturnValue({ skip: mockSkip });

    Product.find.mockReturnValue({
      limit: mockLimit
    });
    Product.countDocuments.mockResolvedValue(0);

    await request(app).get('/products/all').query({ search: searchString });

    expect(Product.find).toHaveBeenCalled();
    const callArgs = Product.find.mock.calls[0][0];
    expect(callArgs.$or[0].name.$regex).toBe(expectedEscaped);
    expect(callArgs.$or[1].description.$regex).toBe(expectedEscaped);
  });

  it('should handle normal search string without changes', async () => {
    const searchString = 'milk';
    const expectedEscaped = 'milk';

    const mockSort = jest.fn().mockResolvedValue([]);
    const mockSkip = jest.fn().mockReturnValue({ sort: mockSort });
    const mockLimit = jest.fn().mockReturnValue({ skip: mockSkip });

    Product.find.mockReturnValue({
      limit: mockLimit
    });
    Product.countDocuments.mockResolvedValue(0);

    await request(app).get('/products/all').query({ search: searchString });

    expect(Product.find).toHaveBeenCalled();
    const callArgs = Product.find.mock.calls[0][0];
    expect(callArgs.$or[0].name.$regex).toBe(expectedEscaped);
  });
});
