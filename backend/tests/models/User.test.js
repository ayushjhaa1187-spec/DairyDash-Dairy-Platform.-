const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../../models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('User Model Test', () => {
  it('should create user successfully with required fields', async () => {
    const validUser = {
      email: 'test@example.com',
      password: 'password123'
    };
    const user = new User(validUser);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.role).toBe('user'); // Default role
  });

  it('should create user successfully with all fields', async () => {
    const fullUser = {
      email: 'full@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '1234567890',
      address: '123 Main St',
      role: 'admin'
    };
    const user = new User(fullUser);
    const savedUser = await user.save();

    expect(savedUser.firstName).toBe(fullUser.firstName);
    expect(savedUser.lastName).toBe(fullUser.lastName);
    expect(savedUser.phone).toBe(fullUser.phone);
    expect(savedUser.address).toBe(fullUser.address);
    expect(savedUser.role).toBe('admin');
  });

  it('should fail if email is missing', async () => {
    const user = new User({ password: 'password123' });
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it('should fail if password is missing', async () => {
    const user = new User({ email: 'test@example.com' });
    let err;
    try {
      await user.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it('should fail if email is not unique', async () => {
    const user1 = new User({ email: 'unique@example.com', password: 'password123' });
    await user1.save();

    const user2 = new User({ email: 'unique@example.com', password: 'password456' });
    let err;
    try {
      await user2.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    // Unique constraint error code is 11000
    expect(err.code).toBe(11000);
  });

  it('should hash password before saving', async () => {
    const plainPassword = 'password123';
    const user = new User({ email: 'hash@example.com', password: plainPassword });
    const savedUser = await user.save();

    expect(savedUser.password).not.toBe(plainPassword);
    // Basic check for bcrypt hash length (usually 60 chars)
    expect(savedUser.password.length).toBeGreaterThan(50);
  });

  it('should match password correctly', async () => {
    const plainPassword = 'password123';
    const user = new User({ email: 'match@example.com', password: plainPassword });
    const savedUser = await user.save();

    const isMatch = await savedUser.matchPassword(plainPassword);
    const isNotMatch = await savedUser.matchPassword('wrongpassword');

    expect(isMatch).toBe(true);
    expect(isNotMatch).toBe(false);
  });

  it('should not re-hash password if not modified', async () => {
    const plainPassword = 'password123';
    const user = new User({ email: 'update@example.com', password: plainPassword });
    const savedUser = await user.save();

    // Store original hashed password
    const originalHash = savedUser.password;

    // Update user but not password
    savedUser.firstName = 'Updated';
    await savedUser.save();

    expect(savedUser.password).toBe(originalHash);

    // Double check that it still matches
    const isMatch = await savedUser.matchPassword(plainPassword);
    expect(isMatch).toBe(true);
  });
});
