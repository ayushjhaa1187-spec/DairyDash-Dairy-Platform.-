require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');

// Initialize app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/orders', require('./routes/Order.routes'));
app.use('/api/products', require('./routes/Product.routes'));
app.use('/api/delivery', require('./routes/Delivery.routes'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'DairyDash API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URI);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit process with failure in production
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  connectDB();
  const PORT = config.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
