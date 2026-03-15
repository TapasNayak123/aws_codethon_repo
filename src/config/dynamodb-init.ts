/**
 * DynamoDB initialization - automatically creates tables if they don't exist
 */

import {
  DynamoDBClient,
  CreateTableCommand,
  DescribeTableCommand,
  ResourceNotFoundException,
} from '@aws-sdk/client-dynamodb';
import { config } from './env.config';
import { logger } from '../utils/logger';

const client = new DynamoDBClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
  ...(config.aws.dynamodbEndpoint && {
    endpoint: config.aws.dynamodbEndpoint,
  }),
});

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
  logger.info(`✅ Table created: ${tableName}`);

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
  logger.info(`✅ Table created: ${tableName}`);

  // Wait for table to be active
  await waitForTableActive(tableName);
}

/**
 * Create Favourites table
 */
async function createFavouritesTable(): Promise<void> {
  const tableName = config.dynamodb.favouritesTable;

  logger.info(`Creating DynamoDB table: ${tableName}`);

  const command = new CreateTableCommand({
    TableName: tableName,
    KeySchema: [{ AttributeName: 'favouriteId', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'favouriteId', AttributeType: 'S' },
      { AttributeName: 'userId', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'userId-index',
        KeySchema: [{ AttributeName: 'userId', KeyType: 'HASH' }],
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
  logger.info(`✅ Table created: ${tableName}`);

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
  logger.info('Initializing DynamoDB tables...');
  console.log('\n🔧 Initializing DynamoDB tables...');
  console.log(`   Region: ${config.aws.region}`);
  console.log(`   Endpoint: ${config.aws.dynamodbEndpoint || 'AWS DynamoDB'}`);
  console.log(`   Users Table: ${config.dynamodb.usersTable}`);
  console.log(`   Products Table: ${config.dynamodb.productsTable}`);
  console.log(`   Favourites Table: ${config.dynamodb.favouritesTable}\n`);

  try {
    // Check and create Users table
    const usersTableExists = await tableExists(config.dynamodb.usersTable);
    if (!usersTableExists) {
      logger.info(`Table ${config.dynamodb.usersTable} does not exist, creating...`);
      console.log(`📝 Creating table: ${config.dynamodb.usersTable}...`);
      await createUsersTable();
    } else {
      logger.info(`✅ Table ${config.dynamodb.usersTable} already exists`);
      console.log(`✅ Table ${config.dynamodb.usersTable} already exists`);
    }

    // Check and create Products table
    const productsTableExists = await tableExists(config.dynamodb.productsTable);
    if (!productsTableExists) {
      logger.info(`Table ${config.dynamodb.productsTable} does not exist, creating...`);
      console.log(`📝 Creating table: ${config.dynamodb.productsTable}...`);
      await createProductsTable();
    } else {
      logger.info(`✅ Table ${config.dynamodb.productsTable} already exists`);
      console.log(`✅ Table ${config.dynamodb.productsTable} already exists`);
    }

    // Check and create Favourites table
    const favouritesTableExists = await tableExists(config.dynamodb.favouritesTable);
    if (!favouritesTableExists) {
      logger.info(`Table ${config.dynamodb.favouritesTable} does not exist, creating...`);
      console.log(`📝 Creating table: ${config.dynamodb.favouritesTable}...`);
      await createFavouritesTable();
    } else {
      logger.info(`✅ Table ${config.dynamodb.favouritesTable} already exists`);
      console.log(`✅ Table ${config.dynamodb.favouritesTable} already exists`);
    }

    logger.info('✅ DynamoDB initialization complete');
    console.log('✅ DynamoDB initialization complete\n');
  } catch (error: any) {
    logger.error('❌ Failed to initialize DynamoDB tables:', error);
    console.error('\n❌ Failed to initialize DynamoDB tables:');
    console.error('Error:', error.message || error);
    
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
      console.error('\n🌐 Network/Connection Error Detected');
      console.error('Possible causes:');
      console.error('  1. No internet connection');
      console.error('  2. Firewall blocking AWS connection');
      console.error('  3. VPN or proxy issues');
      console.error('  4. AWS service temporarily unavailable');
    } else if (error.name === 'CredentialsProviderError' || error.message?.includes('credentials')) {
      console.error('\n🔑 AWS Credentials Error');
      console.error('Possible causes:');
      console.error('  1. Invalid AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY');
      console.error('  2. IAM user does not have DynamoDB permissions');
      console.error('  3. Credentials expired or revoked');
    } else if (error.name === 'UnrecognizedClientException') {
      console.error('\n🔑 Invalid AWS Credentials');
      console.error('The security token included in the request is invalid');
    }
    
    console.error('\n💡 Quick Fix Options:');
    console.error('  Option 1: Create tables manually');
    console.error('    - Run: npm run create-tables');
    console.error('    - Then restart server');
    console.error('\n  Option 2: Fix AWS connection');
    console.error('    - Check internet connection');
    console.error('    - Verify AWS credentials in .env');
    console.error('    - Check firewall/VPN settings\n');
    
    throw error;
  }
}
