const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const config = require('./config');

// Initialize app
const app = express();

// Middleware
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.error('MongoDB Connection Error:', err));

// Routes
const authRoutes = require('./routes/auth.routes');
const productRoutes = require('./routes/Product.routes');
const orderRoutes = require('./routes/Order.routes');
const deliveryRoutes = require('./routes/Delivery.routes');

const apiPath = `${config.API_PREFIX}/${config.API_VERSION}`;

app.use(`${apiPath}/auth`, authRoutes);
app.use(`${apiPath}/products`, productRoutes);
app.use(`${apiPath}/orders`, orderRoutes);
app.use(`${apiPath}/delivery`, deliveryRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to DairyDash API',
    version: config.API_VERSION,
    documentation: '/api/docs'
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server if main module
if (require.main === module) {
  const PORT = config.PORT;
  app.listen(PORT, () => {
    console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
  });
}

module.exports = app;
