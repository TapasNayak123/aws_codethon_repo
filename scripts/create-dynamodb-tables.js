/**
 * Script to create DynamoDB tables for the authentication API
 * 
 * Usage:
 * - For AWS DynamoDB: node scripts/create-dynamodb-tables.js
 * - For DynamoDB Local: node scripts/create-dynamodb-tables.js local
 */

const { DynamoDBClient, CreateTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
require('dotenv').config();

// Check if running against local DynamoDB
const isLocal = process.argv[2] === 'local';

// Configure DynamoDB client
const config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Add endpoint for local DynamoDB
if (isLocal) {
  config.endpoint = 'http://localhost:8000';
}

const client = new DynamoDBClient(config);

// Table names from environment
const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || 'dev-Users';
const TOKENS_TABLE = process.env.DYNAMODB_TOKENS_TABLE || 'dev-PasswordResetTokens';

async function checkTableExists(tableName) {
  try {
    const command = new ListTablesCommand({});
    const response = await client.send(command);
    return response.TableNames.includes(tableName);
  } catch (error) {
    console.error('Error checking tables:', error.message);
    return false;
  }
}

async function createUsersTable() {
  const exists = await checkTableExists(USERS_TABLE);
  
  if (exists) {
    console.log(`⏭️  Table "${USERS_TABLE}" already exists, skipping...`);
    return;
  }

  console.log(`📝 Creating table: ${USERS_TABLE}...`);

  const command = new CreateTableCommand({
    TableName: USERS_TABLE,
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'userId', AttributeType: 'S' },
      { AttributeName: 'email', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'email-index',
        KeySchema: [
          { AttributeName: 'email', KeyType: 'HASH' },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
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

  try {
    await client.send(command);
    console.log(`✅ Table "${USERS_TABLE}" created successfully!`);
  } catch (error) {
    console.error(`❌ Error creating table "${USERS_TABLE}":`, error.message);
    throw error;
  }
}

async function createTokensTable() {
  const exists = await checkTableExists(TOKENS_TABLE);
  
  if (exists) {
    console.log(`⏭️  Table "${TOKENS_TABLE}" already exists, skipping...`);
    return;
  }

  console.log(`📝 Creating table: ${TOKENS_TABLE}...`);

  const command = new CreateTableCommand({
    TableName: TOKENS_TABLE,
    KeySchema: [
      { AttributeName: 'tokenId', KeyType: 'HASH' }, // Partition key
    ],
    AttributeDefinitions: [
      { AttributeName: 'tokenId', AttributeType: 'S' },
      { AttributeName: 'token', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'token-index',
        KeySchema: [
          { AttributeName: 'token', KeyType: 'HASH' },
        ],
        Projection: {
          ProjectionType: 'ALL',
        },
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

  try {
    await client.send(command);
    console.log(`✅ Table "${TOKENS_TABLE}" created successfully!`);
  } catch (error) {
    console.error(`❌ Error creating table "${TOKENS_TABLE}":`, error.message);
    throw error;
  }
}

async function main() {
  console.log('\n🚀 DynamoDB Table Creation Script\n');
  console.log('Configuration:');
  console.log(`  Region: ${config.region}`);
  console.log(`  Endpoint: ${isLocal ? 'http://localhost:8000 (Local)' : 'AWS DynamoDB'}`);
  console.log(`  Users Table: ${USERS_TABLE}`);
  console.log(`  Tokens Table: ${TOKENS_TABLE}\n`);

  try {
    await createUsersTable();
    await createTokensTable();
    
    console.log('\n✅ All tables created successfully!');
    console.log('\n📋 Table Details:');
    console.log(`  1. ${USERS_TABLE}`);
    console.log('     - Primary Key: userId (String)');
    console.log('     - GSI: email-index (email)');
    console.log(`  2. ${TOKENS_TABLE}`);
    console.log('     - Primary Key: tokenId (String)');
    console.log('     - GSI: token-index (token)');
    console.log('\n🎉 You can now start your application!\n');
  } catch (error) {
    console.error('\n❌ Failed to create tables');
    console.error('Error:', error.message);
    console.log('\n💡 Troubleshooting:');
    console.log('  1. Check your AWS credentials in .env file');
    console.log('  2. Verify AWS_REGION is correct');
    console.log('  3. Ensure IAM user has DynamoDB permissions');
    console.log('  4. For local: Make sure Docker is running with DynamoDB Local');
    process.exit(1);
  }
}

main();
