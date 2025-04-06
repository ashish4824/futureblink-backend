const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../src/app');
const User = require('../src/models/User');
const dotenv = require('dotenv');
dotenv.config();
beforeAll(async () => {
  const testMongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/email-scheduler-test';
  await mongoose.connect(testMongoUri);
});

// Clear the database between tests
beforeEach(async () => {
  await User.deleteMany({});
});

// Close database connection after tests
afterAll(async () => {
  await mongoose.connection.close();
});

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.message).toEqual('User registered successfully');
    });

    it('should not register a user with existing email', async () => {
      // Create a user first
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      
      // Try to register with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser2',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('User already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', async () => {
      // Register a user first
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      
      // Login with the registered user
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.message).toEqual('Login successful');
    });

    it('should not login with incorrect password', async () => {
      // Register a user first
      await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        });
      
      // Try to login with incorrect password
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual('Invalid credentials');
    });
  });
});