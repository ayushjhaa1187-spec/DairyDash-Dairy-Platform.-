const request = require('supertest');
const express = require('express');

// Mock dependencies
jest.mock('../../models/Product', () => {
  const ProductMock = function(data) {
    Object.assign(this, data);
  };
  ProductMock.find = jest.fn();
  ProductMock.findById = jest.fn();
  ProductMock.findByIdAndUpdate = jest.fn();
  ProductMock.findByIdAndDelete = jest.fn();
  ProductMock.countDocuments = jest.fn();
  ProductMock.prototype.save = jest.fn();
  return ProductMock;
});

jest.mock('../../middleware/authenticate', () => (req, res, next) => {
  req.user = { id: 'mockAdminId', role: 'admin' };
  next();
}, { virtual: true });

const productRoutes = require('../../routes/Product.routes');
const Product = require('../../models/Product');

const app = express();
app.use(express.json());
app.use('/api/products', productRoutes);

describe('Product Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/products/all', () => {
    it('should return all products with default pagination', async () => {
      const mockProducts = [
        { _id: '1', name: 'Milk', price: 2.99, category: 'Dairy' },
        { _id: '2', name: 'Cheese', price: 4.99, category: 'Dairy' }
      ];

      const mockFind = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockResolvedValue(mockProducts);

      Product.find = mockFind;
      Product.find.mockReturnValue({
        limit: mockLimit,
        skip: mockSkip,
        sort: mockSort
      });
      Product.countDocuments = jest.fn().mockResolvedValue(2);

      const res = await request(app).get('/api/products/all');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products).toEqual(mockProducts);
      expect(res.body.pagination).toEqual({
        total: 2,
        pages: 1,
        currentPage: 1
      });

      expect(Product.find).toHaveBeenCalledWith({});
      expect(Product.countDocuments).toHaveBeenCalledWith({});
    });

    it('should handle category and search queries', async () => {
      const mockProducts = [{ _id: '1', name: 'Milk', price: 2.99, category: 'Dairy' }];

      const mockFind = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockSkip = jest.fn().mockReturnThis();
      const mockSort = jest.fn().mockResolvedValue(mockProducts);

      Product.find = mockFind;
      Product.find.mockReturnValue({
        limit: mockLimit,
        skip: mockSkip,
        sort: mockSort
      });
      Product.countDocuments = jest.fn().mockResolvedValue(1);

      const res = await request(app).get('/api/products/all?category=Dairy&search=mil');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const expectedQuery = {
        category: 'Dairy',
        $or: [
          { name: { $regex: 'mil', $options: 'i' } },
          { description: { $regex: 'mil', $options: 'i' } }
        ]
      };
      expect(Product.find).toHaveBeenCalledWith(expectedQuery);
      expect(Product.countDocuments).toHaveBeenCalledWith(expectedQuery);
    });

    it('should handle errors', async () => {
      Product.find = jest.fn().mockImplementation(() => {
        throw new Error('Database error');
      });

      const res = await request(app).get('/api/products/all');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Database error');
    });
  });

  describe('GET /api/products/:productId', () => {
    it('should return a product successfully', async () => {
      const mockProduct = { _id: '1', name: 'Milk', price: 2.99, category: 'Dairy' };
      Product.findById = jest.fn().mockResolvedValue(mockProduct);

      const res = await request(app).get('/api/products/1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.product).toEqual(mockProduct);
      expect(Product.findById).toHaveBeenCalledWith('1');
    });

    it('should return 404 if product not found', async () => {
      Product.findById = jest.fn().mockResolvedValue(null);

      const res = await request(app).get('/api/products/999');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Product not found');
    });

    it('should handle errors', async () => {
      Product.findById = jest.fn().mockRejectedValue(new Error('Invalid ID'));

      const res = await request(app).get('/api/products/invalid');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid ID');
    });
  });

  describe('POST /api/products/create', () => {
    it('should create a product successfully', async () => {
      const mockProductData = {
        name: 'Milk',
        description: 'Fresh milk',
        price: 2.99,
        category: 'Dairy',
        stock: 10,
        image: 'milk.jpg'
      };

      const mockSavedProduct = { ...mockProductData, _id: '1' };
      Product.prototype.save = jest.fn().mockResolvedValue(mockSavedProduct);

      const res = await request(app)
        .post('/api/products/create')
        .send(mockProductData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Product created');
      expect(Product.prototype.save).toHaveBeenCalled();
    });

    it('should handle errors during creation', async () => {
      Product.prototype.save = jest.fn().mockRejectedValue(new Error('Validation error'));

      const res = await request(app)
        .post('/api/products/create')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation error');
    });
  });

  describe('PUT /api/products/:productId/update', () => {
    it('should update a product successfully', async () => {
      const updateData = { price: 3.99 };
      const updatedProduct = { _id: '1', name: 'Milk', price: 3.99 };

      Product.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedProduct);

      const res = await request(app)
        .put('/api/products/1/update')
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Product updated');
      expect(res.body.product).toEqual(updatedProduct);
      expect(Product.findByIdAndUpdate).toHaveBeenCalledWith(
        '1',
        updateData,
        { new: true, runValidators: true }
      );
    });

    it('should handle errors during update', async () => {
      Product.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error('Update failed'));

      const res = await request(app)
        .put('/api/products/1/update')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Update failed');
    });
  });

  describe('DELETE /api/products/:productId/delete', () => {
    it('should delete a product successfully', async () => {
      Product.findByIdAndDelete = jest.fn().mockResolvedValue({ _id: '1' });

      const res = await request(app).delete('/api/products/1/delete');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Product deleted');
      expect(Product.findByIdAndDelete).toHaveBeenCalledWith('1');
    });

    it('should handle errors during deletion', async () => {
      Product.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Deletion failed'));

      const res = await request(app).delete('/api/products/1/delete');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Deletion failed');
    });
  });

  describe('GET /api/products/category/:category', () => {
    it('should return products by category', async () => {
      const mockProducts = [{ _id: '1', name: 'Milk', category: 'Dairy' }];
      Product.find = jest.fn().mockResolvedValue(mockProducts);

      const res = await request(app).get('/api/products/category/Dairy');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.products).toEqual(mockProducts);
      expect(Product.find).toHaveBeenCalledWith({ category: 'Dairy' });
    });

    it('should handle errors during category fetch', async () => {
      Product.find = jest.fn().mockRejectedValue(new Error('Fetch failed'));

      const res = await request(app).get('/api/products/category/Dairy');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Fetch failed');
    });
  });
});
