import { vi } from 'vitest';

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3000';
process.env.AWS_REGION = 'us-east-1';
process.env.AWS_ACCESS_KEY_ID = 'test-key';
process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
process.env.DYNAMODB_USERS_TABLE = 'test-Users';
process.env.DYNAMODB_PRODUCTS_TABLE = 'test-Products';
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only';
process.env.JWT_EXPIRATION = '1h';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.LOG_LEVEL = 'error';

// Mock AWS SDK
vi.mock('@aws-sdk/client-dynamodb');
vi.mock('@aws-sdk/lib-dynamodb');
