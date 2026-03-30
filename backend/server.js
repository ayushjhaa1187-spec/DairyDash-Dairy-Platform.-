require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');

const app = express();

// Security and middleware
app.use(helmet());
app.use(cors({
  origin: config.NODE_ENV === 'production'
    ? config.CORS_ORIGIN
    : ['http://localhost:3000', 'http://localhost:8000', 'http://127.0.0.1:3000', 'http://127.0.0.1:8000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'DairyDash API is running' });
});

// Import Routes
try {
  const productRoutes = require('./routes/Product.routes');
  app.use(`${config.API_PREFIX}/products`, productRoutes);
} catch (e) {
  console.log('Skipping product routes due to missing/empty file:', e.message);
}

try {
  const orderRoutes = require('./routes/Order.routes');
  app.use(`${config.API_PREFIX}/orders`, orderRoutes);
} catch (e) {
  console.log('Skipping order routes due to missing/empty file:', e.message);
}

try {
  const deliveryRoutes = require('./routes/Delivery.routes');
  app.use(`${config.API_PREFIX}/delivery`, deliveryRoutes);
} catch (e) {
  console.log('Skipping delivery routes due to missing/empty file:', e.message);
}

try {
  const authRoutes = require('./routes/auth.routes');
  app.use(`${config.API_PREFIX}/auth`, authRoutes);
} catch (e) {
  console.log('Skipping auth routes due to missing/empty file:', e.message);
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: config.MESSAGES.SERVER_ERROR || 'Something went wrong!',
    error: config.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Database connection & Server start
const startServer = async () => {
  try {
    if (config.MONGODB_URI) {
      await mongoose.connect(config.MONGODB_URI);
      console.log('MongoDB connected successfully');
    } else {
      console.log('MONGODB_URI not provided, running without DB connection');
    }

    if (require.main === module) {
      const PORT = config.PORT || 5000;
      app.listen(PORT, () => {
        console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
