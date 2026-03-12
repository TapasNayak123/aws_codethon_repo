import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import authRoutes from '../../../src/routes/auth.routes';

// Mock DynamoDB
vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: vi.fn(() => ({
      send: vi.fn(),
    })),
  },
  PutCommand: vi.fn(),
  GetCommand: vi.fn(),
  QueryCommand: vi.fn(),
}));

describe('Auth API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  describe('POST /api/auth/register', () => {
    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          dateOfBirth: '1990-01-01',
          email: 'invalid-email',
          password: 'Test1234',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          dateOfBirth: '1990-01-01',
          email: 'test@gmail.com',
          password: 'weak',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject registration with underage user', async () => {
      const today = new Date();
      const underageDate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
      
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'Test User',
          dateOfBirth: underageDate.toISOString().split('T')[0],
          email: 'test@gmail.com',
          password: 'Test1234',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should validate full name length', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          fullName: 'A',
          dateOfBirth: '1990-01-01',
          email: 'test@gmail.com',
          password: 'Test1234',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should reject login with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject login with invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'Test1234',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject login with empty password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@gmail.com',
          password: '',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should validate email is required', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'Test1234',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should validate password is required', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@gmail.com',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });
});
