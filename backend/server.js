const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
// Allow all origins for simplicity during initial deployment.
// For production security, restrict to specific domains (e.g., GitHub Pages URL).
app.use(cors({
    origin: '*',
    credentials: true
}));
app.use(express.json());

// Connect to Database (only if not already connected in serverless)
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dairydash', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log('MongoDB Connected'))
    .catch((err) => console.error('MongoDB Connection Error:', err));
}

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/Product.routes'));
app.use('/api/orders', require('./routes/Order.routes'));
app.use('/api/delivery', require('./routes/Delivery.routes'));

// Basic route
app.get('/', (req, res) => {
  res.send('DairyDash API is running...');
});

app.get('/api', (req, res) => {
    res.send('DairyDash API Endpoint');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});

// For local development
if (require.main === module) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;
