const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config');

// Register User
router.post('/register', async (req, res) => {
  try {
    const { email, phone, password, firstName, lastName, address } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { phone }] });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: config.MESSAGES.USER_EXISTS
      });
    }

    // Create user
    const user = new User({
      email,
      phone,
      password,
      firstName,
      lastName,
      address,
      role: 'user' // Default role
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE
    });

    res.status(201).json({
      success: true,
      message: config.MESSAGES.REGISTER_SUCCESS,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Login User
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: config.MESSAGES.USER_NOT_FOUND
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: config.MESSAGES.INVALID_TOKEN
      });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRE
    });

    res.json({
      success: true,
      message: config.MESSAGES.LOGIN_SUCCESS,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Logout User
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: config.MESSAGES.LOGOUT_SUCCESS
  });
});

module.exports = router;
