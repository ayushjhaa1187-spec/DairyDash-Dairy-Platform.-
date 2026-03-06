const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const config = require('./config');

// Load environment variables
dotenv.config();

// Route files
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/Product.routes');
const orderRoutes = require('./routes/Order.routes');
const deliveryRoutes = require('./routes/Delivery.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB...'))
.catch(err => console.error('Could not connect to MongoDB...', err));

// Mount routes
app.use(`${config.API_PREFIX}/auth`, authRoutes);
app.use(`${config.API_PREFIX}/products`, productRoutes);
app.use(`${config.API_PREFIX}/orders`, orderRoutes);
app.use(`${config.API_PREFIX}/delivery`, deliveryRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: config.MESSAGES.SERVER_ERROR,
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = config.PORT || 5000;

// Export for testing
module.exports = app;

// Start server only if not in test environment
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
  });
}
