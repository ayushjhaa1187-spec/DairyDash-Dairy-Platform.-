const request = require('supertest');
const mongoose = require('mongoose');

// Mock mongoose to prevent actual DB connection and handle model definitions
jest.mock('mongoose', () => {
  const mMongoose = {
    connect: jest.fn().mockResolvedValue(true),
    connection: {
      on: jest.fn(),
      once: jest.fn(),
    },
    Schema: Object.assign(
      jest.fn().mockImplementation(() => ({
         pre: jest.fn(),
         post: jest.fn(),
         index: jest.fn(),
      })),
      {
        Types: {
          ObjectId: 'ObjectId',
          String: String,
          Number: Number,
          Boolean: Boolean,
          Date: Date
        }
      }
    ),
    model: jest.fn().mockReturnValue({
       find: jest.fn().mockReturnThis(),
       findById: jest.fn().mockReturnThis(),
       findByIdAndUpdate: jest.fn().mockReturnThis(),
       findByIdAndDelete: jest.fn().mockReturnThis(),
       limit: jest.fn().mockReturnThis(),
       skip: jest.fn().mockReturnThis(),
       sort: jest.fn().mockReturnThis(),
       countDocuments: jest.fn().mockResolvedValue(0),
       populate: jest.fn().mockReturnThis(),
       save: jest.fn().mockResolvedValue(true),
       findOne: jest.fn().mockReturnThis(),
    }),
    Types: {
        ObjectId: jest.fn(),
    }
  };
  return mMongoose;
});

describe('Server Entry Point', () => {
  let app;

  beforeAll(() => {
    // Import the server. It should export the express app.
    app = require('../server');
  });

  test('mongoose.connect should be called', () => {
      expect(mongoose.connect).toHaveBeenCalled();
  });

  test('GET / should return 200 and welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Welcome to DairyDash API');
  });

  test('GET /api/health should return 200 and status ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('GET /api/v1/non-existent-route should return 404', async () => {
    const res = await request(app).get('/api/v1/non-existent-route');
    expect(res.statusCode).toEqual(404);
  });
});
