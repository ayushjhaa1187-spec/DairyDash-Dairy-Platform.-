// DairyDash Backend Configuration
// Production-ready configuration for deployment

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/dairydash',
  DB_NAME: process.env.DATABASE_NAME || 'dairydash',
  
  // JWT Configuration
  JWT_SECRET: (() => {
    if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'test') {
      throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
    }
    return process.env.JWT_SECRET;
  })(),
  JWT_EXPIRE: '7d',
  
  // CORS Configuration
  CORS_ORIGIN: [
    'https://ayushjhaa1187-spec.github.io',
    'https://ayushjhaa1187-spec.github.io/DairyDash-Dairy-Platform.-',
    'http://localhost:3000',
    'http://localhost:8000'
  ],
  
  // API Configuration
  API_VERSION: 'v1',
  API_PREFIX: '/api',
  
  // Security
  BCRYPT_ROUNDS: 10,
  
  // Session Configuration
  SESSION_TIMEOUT: 3600000, // 1 hour
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Email Configuration (Optional)
  EMAIL_SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  
  // Payment Gateway (Optional)
  RAZORPAY_KEY: process.env.RAZORPAY_KEY,
  RAZORPAY_SECRET: process.env.RAZORPAY_SECRET,
  
  // Google Maps
  GOOGLE_MAPS_KEY: process.env.GOOGLE_MAPS_KEY,
  
  // Twilio (SMS)
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE: process.env.TWILIO_PHONE,
  
  // Firebase
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  
  // Response Messages
  MESSAGES: {
    SUCCESS: 'Operation successful',
    ERROR: 'Operation failed',
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Server error',
    LOGIN_SUCCESS: 'Login successful',
    REGISTER_SUCCESS: 'Registration successful',
    LOGOUT_SUCCESS: 'Logout successful',
    TOKEN_EXPIRED: 'Token expired',
    INVALID_TOKEN: 'Invalid token',
    USER_EXISTS: 'User already exists',
    USER_NOT_FOUND: 'User not found',
  },
  
  // Pagination
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};
