const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const config = require('../config');

// Mock Mongoose models
jest.mock('../models/User');
jest.mock('../models/Order', () => ({
  find: jest.fn().mockReturnThis(),
  populate: jest.fn().mockReturnThis(),
  sort: jest.fn().mockResolvedValue([])
}));

describe('Auth Middleware & Routes', () => {
  let mockUser;
  let token;

  beforeEach(() => {
    mockUser = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'Test User',
      email: 'test@example.com',
      role: 'user'
    };
    token = jwt.sign({ id: mockUser._id }, config.JWT_SECRET);
    User.findById.mockResolvedValue(mockUser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/orders/my-orders', () => {
    it('should return 401 if no Authorization header', async () => {
      const res = await request(app).get('/api/orders/my-orders');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Not authorized/);
    });

    it('should return 401 if invalid token', async () => {
      const res = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', 'Bearer invalidtoken');
      expect(res.status).toBe(401);
    });

    it('should return 200 and user orders if token is valid', async () => {
      const res = await request(app)
        .get('/api/orders/my-orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(User.findById).toHaveBeenCalledWith(mockUser._id);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        _id: 'newuser123',
        name: 'New User',
        email: 'new@example.com',
        role: 'user'
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });
  });
});
