/**
 * Script to create DynamoDB tables for the authentication API
 *
 * Usage:
 * - For AWS DynamoDB: node scripts/create-dynamodb-tables.js
 * - For DynamoDB Local: node scripts/create-dynamodb-tables.js local
 */

const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

const isLocal = process.argv[2] === 'local';

const config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

if (isLocal) {
  config.endpoint = 'http://localhost:8000';
}

const client = new DynamoDBClient(config);

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'dev-Users';
const PRODUCTS_TABLE = process.env.DYNAMODB_PRODUCTS_TABLE || 'dev-Products';

async function checkTableExists(tableName) {
  try {
    const response = await client.send(new ListTablesCommand({}));
    return response.TableNames.includes(tableName);
  } catch (error) {
    console.error('Error checking tables:', error.message);
    return false;
  }
}

async function createUsersTable() {
  const exists = await checkTableExists(USERS_TABLE);

  if (exists) {
    console.log(`  Table "${USERS_TABLE}" already exists, skipping.`);
    return;
  }

  console.log(`  Creating table: ${USERS_TABLE}...`);

  await client.send(new CreateTableCommand({
    TableName: USERS_TABLE,
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
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  }));

  console.log(`  Table "${USERS_TABLE}" created.`);
}

async function createProductsTable() {
  const exists = await checkTableExists(PRODUCTS_TABLE);

  if (exists) {
    console.log(`  Table "${PRODUCTS_TABLE}" already exists, skipping.`);
    return;
  }

  console.log(`  Creating table: ${PRODUCTS_TABLE}...`);

  await client.send(new CreateTableCommand({
    TableName: PRODUCTS_TABLE,
    KeySchema: [{ AttributeName: 'productId', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'productId', AttributeType: 'S' }],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  }));

  console.log(`  Table "${PRODUCTS_TABLE}" created.`);
}

async function main() {
  console.log('\nDynamoDB Table Creation Script\n');
  console.log('Configuration:');
  console.log(`  Region:         ${config.region}`);
  console.log(`  Endpoint:       ${isLocal ? 'http://localhost:8000 (Local)' : 'AWS DynamoDB'}`);
  console.log(`  Users Table:    ${USERS_TABLE}`);
  console.log(`  Products Table: ${PRODUCTS_TABLE}\n`);

  try {
    await createUsersTable();
    await createProductsTable();

    console.log('\nAll tables ready.\n');
    console.log('Table Details:');
    console.log(`  1. ${USERS_TABLE}`);
    console.log('     - Primary Key: userId (String)');
    console.log('     - GSI: email-index (email)');
    console.log(`  2. ${PRODUCTS_TABLE}`);
    console.log('     - Primary Key: productId (String)\n');
  } catch (error) {
    console.error('\nFailed to create tables');
    console.error('Error:', error.message);
    console.log('\nTroubleshooting:');
    console.log('  1. Check your AWS credentials in .env file');
    console.log('  2. Verify AWS_REGION is correct');
    console.log('  3. Ensure IAM user has DynamoDB permissions');
    console.log('  4. For local: Make sure Docker is running with DynamoDB Local');
    process.exit(1);
  }
}

main();
