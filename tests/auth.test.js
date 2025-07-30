const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');

describe('Authentication Endpoints', () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/product-inventory-test');
  });

  afterAll(async () => {
    // Clean up and disconnect
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'User registered successfully');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', userData.username);
      expect(response.body.user).toHaveProperty('email', userData.email);
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should return 400 for duplicate email', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('already registered');
    });

    it('should return 400 for invalid input', async () => {
      const invalidData = {
        username: 'ab', // Too short
        email: 'invalid-email',
        password: '123' // Too short
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData);
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Login successful');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', loginData.email);

      // Save token for other tests
      authToken = response.body.token;
      userId = response.body.user._id;
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'Password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('incorrect');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'WrongPassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('incorrect');
    });
  });

  describe('GET /api/auth/profile', () => {
    beforeEach(async () => {
      // Create and login user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = registerResponse.body.token;
      userId = registerResponse.body.user._id;
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Profile retrieved successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('_id', userId);
      expect(response.body.user).toHaveProperty('username', 'testuser');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('No token provided');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('Invalid token');
    });
  });

  describe('PUT /api/auth/profile', () => {
    beforeEach(async () => {
      // Create and login user
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData);

      authToken = registerResponse.body.token;
      userId = registerResponse.body.user._id;
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', updateData.username);
      expect(response.body.user).toHaveProperty('email', updateData.email);
    });

    it('should return 400 for duplicate email', async () => {
      // Create another user
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'anotheruser',
          email: 'another@example.com',
          password: 'Password123'
        });

      const updateData = {
        email: 'another@example.com'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body.message).toContain('already registered');
    });
  });
}); 