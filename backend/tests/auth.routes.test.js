const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mocks
jest.mock('../models/User');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock User.findOne to return null (user doesn't exist)
      User.findOne.mockResolvedValue(null);

      // Mock bcrypt.hash
      bcrypt.hash.mockResolvedValue('hashed_password');

      // Mock User.create or new User().save
      // Since typically we do new User(req.body).save(), we mock the save method
      const mockSave = jest.fn().mockResolvedValue({
        _id: 'user_id_123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      });
      User.mockImplementation(() => ({
        save: mockSave
      }));

      // Mock jwt.sign
      jwt.sign.mockReturnValue('valid_token');

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token', 'valid_token');
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should return 400 if user already exists', async () => {
      User.findOne.mockResolvedValue({ email: 'test@example.com' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('msg', 'User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      const mockUser = {
        _id: 'user_id_123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'user',
      };

      // Mock User.findOne.select to return user with password
      // Since select is chainable, we mock it carefully
      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({
        select: mockSelect
      });

      // Mock bcrypt.compare
      bcrypt.compare.mockResolvedValue(true);

      // Mock jwt.sign
      jwt.sign.mockReturnValue('valid_token');

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token', 'valid_token');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
    });

    it('should return 400 for invalid credentials (password)', async () => {
      const mockUser = {
        _id: 'user_id_123',
        email: 'test@example.com',
        password: 'hashed_password',
      };

      const mockSelect = jest.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({
        select: mockSelect
      });

      bcrypt.compare.mockResolvedValue(false);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrong_password'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('msg', 'Invalid credentials');
    });

    it('should return 400 if user not found', async () => {
      const mockSelect = jest.fn().mockResolvedValue(null);
      User.findOne.mockReturnValue({
        select: mockSelect
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('msg', 'Invalid credentials');
    });
  });
});
