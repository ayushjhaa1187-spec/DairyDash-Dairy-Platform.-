const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: config.MESSAGES.UNAUTHORIZED
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: config.MESSAGES.USER_NOT_FOUND
      });
    }

    // Attach user and token to request
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: config.MESSAGES.INVALID_TOKEN
    });
  }
};

module.exports = authenticate;
