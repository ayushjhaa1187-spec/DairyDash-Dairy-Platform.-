const request = require('supertest');
const express = require('express');
const productRoutes = require('../../routes/Product.routes');
const Product = require('../../models/Product');

jest.mock('../../models/Product', () => {
  return {
    find: jest.fn(),
    countDocuments: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
  };
});
jest.mock('../../middleware/authenticate', () => (req, res, next) => next(), { virtual: true });

const app = express();
app.use(express.json());
app.use('/products', productRoutes);

describe('Product Routes - GET /all', () => {
  let mockSort;
  let mockSkip;
  let mockLimit;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSort = jest.fn().mockResolvedValue([{ _id: '1', name: 'Test Product' }]);
    mockSkip = jest.fn().mockReturnValue({ sort: mockSort });
    mockLimit = jest.fn().mockReturnValue({ skip: mockSkip });
    Product.find.mockReturnValue({ limit: mockLimit });
    Product.countDocuments.mockResolvedValue(1);
  });

  it('should return products with default pagination and sorting', async () => {
    const res = await request(app).get('/products/all');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.products.length).toBe(1);
    expect(res.body.pagination).toEqual({
      total: 1,
      pages: 1,
      currentPage: 1
    });

    expect(Product.find).toHaveBeenCalledWith({});
    expect(mockLimit).toHaveBeenCalledWith(12);
    expect(mockSkip).toHaveBeenCalledWith(0);
    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(Product.countDocuments).toHaveBeenCalledWith({});
  });

  it('should apply category filter when provided in query', async () => {
    const res = await request(app).get('/products/all?category=Dairy');

    expect(res.status).toBe(200);
    expect(Product.find).toHaveBeenCalledWith({ category: 'Dairy' });
    expect(Product.countDocuments).toHaveBeenCalledWith({ category: 'Dairy' });
  });

  it('should apply search filter when provided in query', async () => {
    const res = await request(app).get('/products/all?search=milk');

    const expectedQuery = {
      $or: [
        { name: { $regex: 'milk', $options: 'i' } },
        { description: { $regex: 'milk', $options: 'i' } }
      ]
    };

    expect(res.status).toBe(200);
    expect(Product.find).toHaveBeenCalledWith(expectedQuery);
    expect(Product.countDocuments).toHaveBeenCalledWith(expectedQuery);
  });

  it('should apply both category and search filters', async () => {
    const res = await request(app).get('/products/all?category=Dairy&search=milk');

    const expectedQuery = {
      category: 'Dairy',
      $or: [
        { name: { $regex: 'milk', $options: 'i' } },
        { description: { $regex: 'milk', $options: 'i' } }
      ]
    };

    expect(res.status).toBe(200);
    expect(Product.find).toHaveBeenCalledWith(expectedQuery);
  });

  it('should correctly calculate skip and limit based on pagination parameters', async () => {
    Product.countDocuments.mockResolvedValue(25);

    const res = await request(app).get('/products/all?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(mockLimit).toHaveBeenCalledWith(10);
    expect(mockSkip).toHaveBeenCalledWith(10); // (2 - 1) * 10
    expect(res.body.pagination).toEqual({
      total: 25,
      pages: 3, // Math.ceil(25 / 10)
      currentPage: 2
    });
  });

  it('should return 400 and success: false on database error', async () => {
    const error = new Error('Database connection failed');
    Product.find.mockImplementation(() => {
      throw error;
    });

    const res = await request(app).get('/products/all');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Database connection failed');
  });
});
