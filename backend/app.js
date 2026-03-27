const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth.routes');
const config = require('./config');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({ origin: config.CORS_ORIGIN }));

// Routes
app.use('/api/auth', authRoutes);

module.exports = app;
