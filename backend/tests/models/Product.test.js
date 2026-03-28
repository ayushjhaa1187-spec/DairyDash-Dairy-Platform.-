const mongoose = require('mongoose');
const Product = require('../../models/Product');

describe('Product Model Test', () => {

  it('should exist', () => {
    expect(Product).toBeDefined();
  });

  it('create and validate a valid product', async () => {
    const validProduct = new Product({
      name: 'Milk',
      description: 'Fresh whole milk',
      price: 2.50,
      category: 'Dairy',
      stock: 50,
      image: 'milk.jpg'
    });

    let error = null;
    try {
      await validProduct.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeNull();
  });

  it('fail validation if required fields are missing', async () => {
    const invalidProduct = new Product({});

    let error = null;
    try {
      await invalidProduct.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.name).toBeDefined();
    expect(error.errors.description).toBeDefined();
    expect(error.errors.price).toBeDefined();
    expect(error.errors.category).toBeDefined();
    expect(error.errors.image).toBeDefined();
  });

  it('should set default stock to 0 if not provided', () => {
    const productWithoutStock = new Product({
      name: 'Eggs',
      description: 'Dozen large eggs',
      price: 3.00,
      category: 'Dairy',
      image: 'eggs.jpg'
    });

    expect(productWithoutStock.stock).toBe(0);
  });

  it('should fail validation if price is less than 0', async () => {
    const negativePriceProduct = new Product({
      name: 'Bread',
      description: 'Whole wheat bread',
      price: -1,
      category: 'Bakery',
      stock: 10,
      image: 'bread.jpg'
    });

    let error = null;
    try {
      await negativePriceProduct.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(error.errors.price).toBeDefined();
  });
});
