# DynamoDB Setup Guide

## Overview

This application supports 3 storage modes:
1. **In-Memory** (default) - No setup needed, data lost on restart
2. **DynamoDB Local** - Docker-based local database
3. **AWS DynamoDB** - Production cloud database

Switch between modes by changing `DYNAMODB_ENDPOINT` in `.env` file.

---

## Option 1: In-Memory Storage (Current Setup)

**Configuration in `.env`:**
```env
DYNAMODB_ENDPOINT=
```

**Pros:**
- No setup required
- Instant testing
- No external dependencies

**Cons:**
- Data lost when server restarts
- Not suitable for production

**When to use:** Quick testing, development, demos

---

## Option 2: DynamoDB Local (Recommended for Development)

### Prerequisites
- Docker installed on your machine

### Step 1: Start DynamoDB Local

```bash
docker run -p 8000:8000 amazon/dynamodb-local
```

Keep this terminal running.

### Step 2: Update `.env`

```env
DYNAMODB_ENDPOINT=http://localhost:8000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
DYNAMODB_USERS_TABLE=dev-Users
DYNAMODB_TOKENS_TABLE=dev-PasswordResetTokens
```

### Step 3: Create Tables

**The application now automatically creates tables on startup!** 

When you start the server with `npm run dev`, it will:
1. Check if tables exist
2. Create them if they don't exist
3. Wait for tables to become active
4. Start the server

However, if you want to create tables manually before starting the server, you have these options:

#### Option A: Automatic (Recommended - Just Start the Server)

```bash
npm run dev
```

The server will create tables automatically if they don't exist.

#### Option B: Using Our Manual Script (Optional)

```bash
npm run create-tables
```

This script will:
- Read your `.env` configuration
- Check if tables already exist
- Create both tables with correct schema
- Show you the results

**Expected output:**
```
🚀 DynamoDB Table Creation Script

Configuration:
  Region: us-east-1
  Endpoint: AWS DynamoDB
  Users Table: dev-Users
  Tokens Table: dev-PasswordResetTokens

📝 Creating table: dev-Users...
✅ Table "dev-Users" created successfully!
📝 Creating table: dev-PasswordResetTokens...
✅ Table "dev-PasswordResetTokens" created successfully!

✅ All tables created successfully!
```

#### Option C: Using AWS CLI

```bash
# Install AWS CLI first if not installed
# Windows: https://aws.amazon.com/cli/

# Create Users table
aws dynamodb create-table \
  --table-name dev-Users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes \
    "[{\"IndexName\":\"email-index\",\"KeySchema\":[{\"AttributeName\":\"email\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000

# Create Tokens table
aws dynamodb create-table \
  --table-name dev-PasswordResetTokens \
  --attribute-definitions \
    AttributeName=tokenId,AttributeType=S \
    AttributeName=token,AttributeType=S \
  --key-schema \
    AttributeName=tokenId,KeyType=HASH \
  --global-secondary-indexes \
    "[{\"IndexName\":\"token-index\",\"KeySchema\":[{\"AttributeName\":\"token\",\"KeyType\":\"HASH\"}],\"Projection\":{\"ProjectionType\":\"ALL\"},\"ProvisionedThroughput\":{\"ReadCapacityUnits\":5,\"WriteCapacityUnits\":5}}]" \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000
```

#### Option D: Using Node.js Script Manually

If you prefer to see the code, check `scripts/create-dynamodb-tables.js`

Run it directly:
```bash
node scripts/create-dynamodb-tables.js
```

```javascript
const { DynamoDBClient, CreateTableCommand } = require('@aws-sdk/client-dynamodb');

const client = new DynamoDBClient({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'local',
    secretAccessKey: 'local',
  },
});

async function createUsersTable() {
  const command = new CreateTableCommand({
    TableName: 'dev-Users',
    KeySchema: [
      { AttributeName: 'userId', KeyType: 'HASH' },
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

  await client.send(command);
  console.log('✅ Users table created');
}

async function createTokensTable() {
  const command = new CreateTableCommand({
    TableName: 'dev-PasswordResetTokens',
    KeySchema: [
      { AttributeName: 'tokenId', KeyType: 'HASH' },
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

  await client.send(command);
  console.log('✅ Tokens table created');
}

async function main() {
  try {
    await createUsersTable();
    await createTokensTable();
    console.log('✅ All tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
  }
}

main();
```

Run it:
```bash
node scripts/create-tables.js
```

### Step 4: Restart Your Server

```bash
npm run dev
```

Now your app uses DynamoDB Local with persistent storage (until you stop Docker).

**Pros:**
- Persistent data (survives server restarts)
- Matches production DynamoDB behavior
- No AWS account needed

**Cons:**
- Requires Docker
- Data lost when Docker container stops

---

## Option 3: AWS DynamoDB (Production)

### Prerequisites
- AWS Account
- AWS credentials with DynamoDB permissions

### Step 1: Create Tables in AWS Console

1. Go to AWS Console → DynamoDB
2. Create table: `prod-Users`
   - Partition key: `userId` (String)
   - Add GSI: `email-index` with partition key `email` (String)
3. Create table: `prod-PasswordResetTokens`
   - Partition key: `tokenId` (String)
   - Add GSI: `token-index` with partition key `token` (String)

### Step 2: Get AWS Credentials

1. Go to AWS Console → IAM → Users
2. Create user with DynamoDB permissions
3. Generate access keys

### Step 3: Update `.env`

```env
# Leave DYNAMODB_ENDPOINT empty for AWS DynamoDB
DYNAMODB_ENDPOINT=

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_actual_access_key
AWS_SECRET_ACCESS_KEY=your_actual_secret_key

# Production table names
DYNAMODB_USERS_TABLE=prod-Users
DYNAMODB_TOKENS_TABLE=prod-PasswordResetTokens
```

### Step 4: Restart Your Server

```bash
npm run dev
```

**Pros:**
- Production-ready
- Fully managed
- Scalable
- Persistent

**Cons:**
- Requires AWS account
- Costs money (free tier available)
- Requires internet connection

---

## Table Schema Reference

### Users Table

**Primary Key:**
- `userId` (String) - Partition key

**Attributes:**
- `userId` (String) - Unique user ID
- `fullName` (String) - User's full name
- `dateOfBirth` (String) - Format: YYYY-MM-DD
- `email` (String) - User's email (lowercase)
- `password` (String) - Bcrypt hashed password
- `createdAt` (String) - ISO timestamp
- `updatedAt` (String) - ISO timestamp

**Global Secondary Index:**
- `email-index` - Partition key: `email` (String)

### Password Reset Tokens Table

**Primary Key:**
- `tokenId` (String) - Partition key

**Attributes:**
- `tokenId` (String) - Unique token ID
- `userId` (String) - Reference to user
- `token` (String) - Reset token value
- `expiresAt` (Number) - Unix timestamp
- `used` (Boolean) - Whether token was used
- `createdAt` (String) - ISO timestamp

**Global Secondary Index:**
- `token-index` - Partition key: `token` (String)

---

## Switching Between Storage Modes

### From In-Memory to DynamoDB Local

1. Start Docker: `docker run -p 8000:8000 amazon/dynamodb-local`
2. Create tables (see Option 2, Step 3)
3. Update `.env`: `DYNAMODB_ENDPOINT=http://localhost:8000`
4. Restart server: `npm run dev`

### From DynamoDB Local to AWS DynamoDB

1. Create tables in AWS Console (see Option 3, Step 1)
2. Update `.env`:
   ```env
   DYNAMODB_ENDPOINT=
   AWS_ACCESS_KEY_ID=your_actual_key
   AWS_SECRET_ACCESS_KEY=your_actual_secret
   DYNAMODB_USERS_TABLE=prod-Users
   DYNAMODB_TOKENS_TABLE=prod-PasswordResetTokens
   ```
3. Restart server: `npm run dev`

### From DynamoDB back to In-Memory

1. Update `.env`: `DYNAMODB_ENDPOINT=`
2. Restart server: `npm run dev`

---

## Troubleshooting

### Error: Cannot connect to DynamoDB

**Check:**
1. Is Docker running? (for DynamoDB Local)
2. Is `DYNAMODB_ENDPOINT` correct in `.env`?
3. Are AWS credentials valid? (for AWS DynamoDB)

**Solution:** Set `DYNAMODB_ENDPOINT=` to use in-memory storage temporarily

### Error: Table does not exist

**Check:**
1. Did you create the tables?
2. Are table names correct in `.env`?

**Solution:** Create tables using scripts above or use in-memory storage

### Error: Access denied

**Check:**
1. Are AWS credentials correct?
2. Does IAM user have DynamoDB permissions?

**Solution:** Verify credentials or use DynamoDB Local

---

## Summary

| Feature | In-Memory | DynamoDB Local | AWS DynamoDB |
|---------|-----------|----------------|--------------|
| Setup | None | Docker | AWS Account |
| Persistence | No | Yes (Docker) | Yes (Cloud) |
| Cost | Free | Free | Paid |
| Production | No | No | Yes |
| Best for | Testing | Development | Production |

**Current setup:** In-Memory (no changes needed to switch later)
