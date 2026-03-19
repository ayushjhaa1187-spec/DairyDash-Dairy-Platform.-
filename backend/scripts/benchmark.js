const mongoose = require('mongoose');
const Product = require('../models/Product');
const { performance } = require('perf_hooks');

// Use local mongo or memory server
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dairydash-benchmark';

async function seedData(count = 10000) {
  console.log(`Seeding ${count} products...`);
  const batchSize = 1000;
  const products = [];

  for (let i = 0; i < count; i++) {
    products.push({
      name: `Product ${i} ${Math.random() > 0.5 ? 'Organic' : 'Regular'} Milk`,
      description: `Fresh dairy product description ${i} with details about quality and source.`,
      price: Math.floor(Math.random() * 100) + 10,
      category: ['Milk', 'Cheese', 'Yogurt'][Math.floor(Math.random() * 3)],
      stock: 100
    });

    if (products.length >= batchSize) {
      await Product.insertMany(products);
      products.length = 0;
      process.stdout.write('.');
    }
  }
  if (products.length > 0) {
    await Product.insertMany(products);
  }
  console.log('\nSeeding complete.');
}

async function runBenchmark() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if we need to seed
    const count = await Product.countDocuments();
    if (count < 10000) {
      await Product.deleteMany({}); // Clear existing
      await seedData(10000);
    } else {
      console.log(`Database has ${count} products`);
    }

    const searchTerm = 'Organic';

    // Benchmark Regex (simulated query logic)
    // Note: This requires manually constructing the query as the code would have before optimization
    // We can't easily revert the code here, but we can test the $text query performance.

    console.log('Benchmarking $text search...');
    const start = performance.now();

    // Execute search 100 times to get average
    const iterations = 100;
    for (let i = 0; i < iterations; i++) {
       await Product.find({ $text: { $search: searchTerm } }).limit(12);
    }

    const end = performance.now();
    const avgTime = (end - start) / iterations;
    console.log(`Average time per query ($text): ${avgTime.toFixed(2)}ms`);

    // To compare with Regex, we can run a regex query explicitly
    console.log('Benchmarking $regex search (for comparison)...');
    const startRegex = performance.now();

    for (let i = 0; i < iterations; i++) {
       await Product.find({
         $or: [
           { name: { $regex: searchTerm, $options: 'i' } },
           { description: { $regex: searchTerm, $options: 'i' } }
         ]
       }).limit(12);
    }

    const endRegex = performance.now();
    const avgTimeRegex = (endRegex - startRegex) / iterations;
    console.log(`Average time per query ($regex): ${avgTimeRegex.toFixed(2)}ms`);

    const improvement = ((avgTimeRegex - avgTime) / avgTimeRegex) * 100;
    console.log(`Improvement: ${improvement.toFixed(2)}%`);

  } catch (err) {
    console.error('Benchmark failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

runBenchmark();
