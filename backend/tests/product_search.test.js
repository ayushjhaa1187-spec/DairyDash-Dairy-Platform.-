const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const Product = require('../models/Product');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Product.deleteMany({});

  const products = [
    { name: 'Apple', description: 'Fresh Red Apple', price: 1, category: 'Fruit' },
    { name: 'Banana', description: 'Yellow Banana', price: 1, category: 'Fruit' },
    { name: 'Milk', description: 'Organic Milk', price: 2, category: 'Dairy' },
    { name: 'Bread', description: 'Whole Wheat Bread', price: 2, category: 'Bakery' }
  ];
  await Product.insertMany(products);

  // Give some time for index to be ready
  await new Promise(resolve => setTimeout(resolve, 500));
});

describe('Product Search', () => {
  test('should find products by name using text search', async () => {
    const results = await Product.find({ $text: { $search: 'Apple' } });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Apple');
  });

  test('should find products by description using text search', async () => {
    const results = await Product.find({ $text: { $search: 'Fresh' } });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Apple');
  });

  test('should find products with mixed case search', async () => {
    const results = await Product.find({ $text: { $search: 'organic' } });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Milk');
  });

  test('should return empty array for no matches', async () => {
    const results = await Product.find({ $text: { $search: 'Nonexistent' } });
    expect(results).toHaveLength(0);
  });
});
