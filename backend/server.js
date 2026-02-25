const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const config = require('./config');

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}));
app.use(helmet());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/Product.routes'));
app.use('/api/orders', require('./routes/Order.routes'));
app.use('/api/delivery', require('./routes/Delivery.routes'));

app.get('/', (req, res) => {
  res.send('DairyDash API is running');
});

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

connectDB();

module.exports = app;

if (require.main === module) {
  const PORT = config.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`);
  });
}
