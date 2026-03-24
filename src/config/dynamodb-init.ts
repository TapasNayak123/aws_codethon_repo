/**
 * DynamoDB initialization - automatically creates tables if they don't exist
 */

import {
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { dynamoDBClient as client } from './database.config';
import { config } from './env.config';
import { logger } from '../utils/logger';

/**
 * Check if a table exists
 */
async function tableExists(tableName: string): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    return true;
  } catch (error) {
    if (error instanceof ResourceNotFoundException) {
      return false;
    }
    throw error;
  }
}

/**
 * Create Users table
 */
async function createUsersTable(): Promise<void> {
  const tableName = config.dynamodb.usersTable;

  logger.info(`Creating DynamoDB table: ${tableName}`);

  const command = new CreateTableCommand({
    TableName: tableName,
    KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'email-index',
        KeySchema: [{ AttributeName: 'email', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5,
        },
      },
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  });

  await client.send(command);
  logger.info(`Table created: ${tableName}`);

  // Wait for table to be active
  await waitForTableActive(tableName);
}

/**
 * Create Products table
 */
async function createProductsTable(): Promise<void> {
  const tableName = config.dynamodb.productsTable;

  logger.info(`Creating DynamoDB table: ${tableName}`);

  const command = new CreateTableCommand({
    TableName: tableName,
    KeySchema: [{ AttributeName: 'productId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'productId', AttributeType: 'S' }],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5,
    },
  });

  await client.send(command);
  logger.info(`Table created: ${tableName}`);

  // Wait for table to be active
  await waitForTableActive(tableName);
}

/**
 * Wait for table to become active
 */
async function waitForTableActive(tableName: string, maxAttempts = 30): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await client.send(new DescribeTableCommand({ TableName: tableName }));
      if (response.Table?.TableStatus === 'ACTIVE') {
        logger.info(`Table ${tableName} is now active`);
        return;
      }
      logger.info(`Waiting for table ${tableName} to become active... (${i + 1}/${maxAttempts})`);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
    } catch (error) {
      logger.error(`Error checking table status: ${error}`);
      throw error;
    }
  }
  throw new Error(`Table ${tableName} did not become active within expected time`);
}

/**
 * Initialize DynamoDB tables - creates them if they don't exist
 */
export async function initializeDynamoDB(): Promise<void> {
  logger.info('Initializing DynamoDB tables', {
    region: config.aws.region,
    endpoint: config.aws.dynamodbEndpoint || 'AWS DynamoDB',
    usersTable: config.dynamodb.usersTable,
    productsTable: config.dynamodb.productsTable,
  });

  try {
    // Check and create Users table
    const usersTableExists = await tableExists(config.dynamodb.usersTable);
    if (!usersTableExists) {
      logger.info(`Table ${config.dynamodb.usersTable} does not exist, creating...`);
      await createUsersTable();
    } else {
      logger.info(`Table ${config.dynamodb.usersTable} already exists`);
    }

    // Check and create Products table
    const productsTableExists = await tableExists(config.dynamodb.productsTable);
    if (!productsTableExists) {
      logger.info(`Table ${config.dynamodb.productsTable} does not exist, creating...`);
      await createProductsTable();
    } else {
      logger.info(`Table ${config.dynamodb.productsTable} already exists`);
    }

    logger.info('DynamoDB initialization complete');
  } catch (error: any) {
    logger.error('Failed to initialize DynamoDB tables', {
      error: error.message || error,
      code: error.code,
      name: error.name,
    });
    throw error;
  }
}
