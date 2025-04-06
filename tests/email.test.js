const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const User = require('../src/models/User');
const EmailSchedule = require('../src/models/EmailSchedule');
const { agenda } = require('../src/config/agenda');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();
// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    verify: jest.fn().mockImplementation(callback => callback(null, true)),
    sendMail: jest.fn().mockResolvedValue({ response: 'Success' })
  })
}));

// Mock the agenda schedule method
jest.mock('../src/config/agenda', () => ({
  agenda: {
    schedule: jest.fn().mockResolvedValue({}),
    cancel: jest.fn().mockResolvedValue({})
  },
  startAgenda: jest.fn()
}));

let authToken;
let userId;

// Connect to a test database before running tests
beforeAll(async () => {
  const testMongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/email-scheduler-test';
  await mongoose.connect(testMongoUri);
  
  // Clear all users before starting tests to avoid duplicate key errors
  await User.deleteMany({});
  
  // Create a test user
  const user = new User({
    username: 'testuser_email',  // Changed username to avoid conflicts
    email: 'test_email@example.com',  // Changed email to avoid conflicts
    password: 'password123'
  });
  
  await user.save();
  userId = user._id;
  
  // Generate a token for the test user with fallback secret
  authToken = jwt.sign(
    { userId: user._id }, 
    process.env.JWT_SECRET || 'test_jwt_secret'
  );
});

// Clear email schedules between tests
beforeEach(async () => {
  await EmailSchedule.deleteMany({});
});

// Close database connection after tests
afterAll(async () => {
  // Clean up all test data
  await EmailSchedule.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('Email API', () => {
  describe('POST /api/emails/schedule', () => {
    it('should schedule an email', async () => {
      const res = await request(app)
        .post('/api/emails/schedule')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          recipient: 'recipient@example.com',
          subject: 'Test Email',
          body: '<p>This is a test email</p>'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('emailSchedule');
      expect(res.body.emailSchedule.recipient).toEqual('recipient@example.com');
      expect(res.body.emailSchedule.subject).toEqual('Test Email');
      expect(res.body.emailSchedule.status).toEqual('scheduled');
      
      // Check that agenda.schedule was called
      expect(agenda.schedule).toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/emails/schedule')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          subject: 'Test Email',
          body: '<p>This is a test email</p>'
          // recipient is missing
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toEqual('Recipient, subject, and body are required');
    });

    it('should return 401 if not authenticated', async () => {
      const res = await request(app)
        .post('/api/emails/schedule')
        .send({
          recipient: 'recipient@example.com',
          subject: 'Test Email',
          body: '<p>This is a test email</p>'
        });
      
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('GET /api/emails', () => {
    it('should get all scheduled emails for the user', async () => {
      // Create a test email schedule
      const emailSchedule = new EmailSchedule({
        recipient: 'recipient@example.com',
        subject: 'Test Email',
        body: '<p>This is a test email</p>',
        scheduledTime: new Date(Date.now() + 60 * 60 * 1000),
        createdBy: userId
      });
      
      await emailSchedule.save();
      
      const res = await request(app)
        .get('/api/emails')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('emails');
      expect(res.body.emails.length).toEqual(1);
      expect(res.body.emails[0].recipient).toEqual('recipient@example.com');
    });
  });

  describe('GET /api/emails/:id', () => {
    it('should get a specific email by ID', async () => {
      // Create a test email schedule
      const emailSchedule = new EmailSchedule({
        recipient: 'recipient@example.com',
        subject: 'Test Email',
        body: '<p>This is a test email</p>',
        scheduledTime: new Date(Date.now() + 60 * 60 * 1000),
        createdBy: userId
      });
      
      await emailSchedule.save();
      
      const res = await request(app)
        .get(`/api/emails/${emailSchedule._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('email');
      expect(res.body.email.recipient).toEqual('recipient@example.com');
    });

    it('should return 404 if email not found', async () => {
      const res = await request(app)
        .get(`/api/emails/${new mongoose.Types.ObjectId()}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Email not found');
    });
  });

  describe('DELETE /api/emails/:id', () => {
    it('should cancel a scheduled email', async () => { 
      // Create a test email schedule
      const emailSchedule = new EmailSchedule({
        recipient: 'recipient@example.com',
        subject: 'Test Email',
        body: '<p>This is a test email</p>',
        scheduledTime: new Date(Date.now() + 60 * 60 * 1000),
        createdBy: userId
      });
      
      await emailSchedule.save();
      
      const res = await request(app)
        .delete(`/api/emails/${emailSchedule._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.message).toEqual('Email cancelled successfully');
      
      // Check that agenda.cancel was called
      expect(agenda.cancel).toHaveBeenCalled();
      
      // Check that the email status was updated
      const updatedEmail = await EmailSchedule.findById(emailSchedule._id);
      expect(updatedEmail.status).toEqual('cancelled');
    });

    it('should return 404 when trying to cancel an already cancelled email', async () => {
      // Create a test email schedule
      const emailSchedule = new EmailSchedule({
        recipient: 'recipient@example.com',
        subject: 'Test Email',
        body: '<p>This is a test email</p>',
        scheduledTime: new Date(Date.now() + 60 * 60 * 1000),
        createdBy: userId,
        status: 'cancelled'  // Set initial status as cancelled
      });
      
      await emailSchedule.save();
      
      const res = await request(app)
        .delete(`/api/emails/${emailSchedule._id}`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual('Email not found or already sent');
    });
  });
});