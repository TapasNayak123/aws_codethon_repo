import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../src/app';
import { generateJWT } from '../../../src/services/token.service';

// Mock DynamoDB
vi.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: vi.fn(() => ({
      send: vi.fn(),
    })),
  },
  PutCommand: vi.fn(),
  GetCommand: vi.fn(),
  ScanCommand: vi.fn(),
}));

describe('Products API Integration Tests', () => {
  let app: ReturnType<typeof createApp>;
  let validToken: string;

  beforeAll(() => {
    app = createApp();

    // Generate valid JWT token for tests
    validToken = generateJWT('test-user-123', 'test@example.com');
  });

  describe('POST /api/products', () => {
    it('should reject request without authentication token', async () => {
      const response = await request(app)
        .post('/api/products')
        .send({
          productName: 'Test Product',
          price: 10.99,
          availableQuantity: 100,
          description: 'Test description',
          imageUrl: 'https://example.com/image.jpg',
        });

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', 'Bearer invalid-token')
        .send({
          productName: 'Test Product',
          price: 10.99,
          availableQuantity: 100,
          description: 'Test description',
          imageUrl: 'https://example.com/image.jpg',
        });

      expect(response.status).toBe(401);
    });

    it('should reject product with missing required fields', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${validToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject product with invalid price', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          productName: 'Test Product',
          price: -10,
          availableQuantity: 100,
          description: 'Test description',
          imageUrl: 'https://example.com/image.jpg',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject product with price exceeding maximum', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          productName: 'Test Product',
          price: 1000000,
          availableQuantity: 100,
          description: 'Test description',
          imageUrl: 'https://example.com/image.jpg',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject product with negative quantity', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          productName: 'Test Product',
          price: 10.99,
          availableQuantity: -1,
          description: 'Test description',
          imageUrl: 'https://example.com/image.jpg',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject product with short description', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          productName: 'Test Product',
          price: 10.99,
          availableQuantity: 100,
          description: 'Short',
          imageUrl: 'https://example.com/image.jpg',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject product with invalid image URL', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          productName: 'Test Product',
          price: 10.99,
          availableQuantity: 100,
          description: 'Test description for product',
          imageUrl: 'not-a-url',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject product with short name', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          productName: 'A',
          price: 10.99,
          availableQuantity: 100,
          description: 'Test description for product',
          imageUrl: 'https://example.com/image.jpg',
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should reject array with more than 100 products', async () => {
      const products = Array(101).fill({
        productName: 'Test Product',
        price: 10.99,
        availableQuantity: 100,
        description: 'Test description for product',
        imageUrl: 'https://example.com/image.jpg',
      });

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${validToken}`)
        .send(products);

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('GET /api/products', () => {
    it('should reject request without authentication token', async () => {
      const response = await request(app)
        .get('/api/products');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/products')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/products/:productId', () => {
    it('should reject request without authentication token', async () => {
      const response = await request(app)
        .get('/api/products/test-id-123');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/products/test-id-123')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
    });
  });
});
