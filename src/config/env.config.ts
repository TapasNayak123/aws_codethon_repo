import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface EnvConfig {
  nodeEnv: string;
  port: number;
  aws: {
    region: string;
    accessKeyId: string;
    secretAccessKey: string;
    dynamodbEndpoint?: string;
  };
  dynamodb: {
    usersTable: string;
    productsTable: string;
  };
  jwt: {
    secret: string;
    expiration: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  logging: {
    level: string;
  };
}

function validateEnv(): EnvConfig {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'DYNAMODB_USERS_TABLE',
    'DYNAMODB_PRODUCTS_TABLE',
    'JWT_SECRET',
    'JWT_EXPIRATION',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS',
    'LOG_LEVEL',
  ];

  const missingVars = requiredEnvVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  return {
    nodeEnv: process.env.NODE_ENV!,
    port: parseInt(process.env.PORT!, 10),
    aws: {
      region: process.env.AWS_REGION!,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      dynamodbEndpoint: process.env.DYNAMODB_ENDPOINT,
    },
    dynamodb: {
      usersTable: process.env.DYNAMODB_USERS_TABLE!,
      productsTable: process.env.DYNAMODB_PRODUCTS_TABLE!,
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiration: process.env.JWT_EXPIRATION!,
    },
    rateLimit: {
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS!, 10),
      maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS!, 10),
    },
    logging: {
      level: process.env.LOG_LEVEL!,
    },
  };
}

export const config = validateEnv();
