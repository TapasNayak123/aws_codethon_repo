# AWS DynamoDB Connection Troubleshooting Guide

## Problem: ECONNRESET Error

You're experiencing a `read ECONNRESET` error when trying to connect to AWS DynamoDB. This is a **network/connection issue**, not a credentials problem.

---

## Quick Diagnosis

Run this command to test your AWS connection:
```bash
node scripts/test-aws-connection.js
```

---

## Solution Options (Try in Order)

### Option 1: Check Network Connection (Most Common)

**Symptoms**: `ECONNRESET`, `ETIMEDOUT`, `ENOTFOUND` errors

**Possible Causes**:
1. **No internet connection** - AWS DynamoDB requires internet access
2. **Firewall blocking AWS** - Corporate/Windows firewall blocking outbound connections
3. **VPN interference** - VPN routing issues
4. **Proxy settings** - Corporate proxy not configured
5. **Antivirus blocking** - Security software blocking AWS SDK

**Solutions**:

#### 1.1 Test Internet Connection
```bash
# Test if you can reach AWS
ping dynamodb.us-east-1.amazonaws.com
```

If ping fails, you have no internet or AWS is blocked.

#### 1.2 Check Windows Firewall
1. Open **Windows Defender Firewall**
2. Click **Allow an app through firewall**
3. Find **Node.js** and ensure both Private and Public are checked
4. If not listed, click **Allow another app** and add Node.js

#### 1.3 Disable VPN Temporarily
If you're using a VPN:
```bash
# Disconnect VPN
# Try running the test again
node scripts/test-aws-connection.js
```

#### 1.4 Check Proxy Settings
If you're behind a corporate proxy, configure it:

**Option A: Set environment variables**
```bash
# In PowerShell
$env:HTTP_PROXY="http://proxy.company.com:8080"
$env:HTTPS_PROXY="http://proxy.company.com:8080"
```

**Option B: Configure in code** (add to `src/config/database.config.ts`):
```typescript
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { HttpsProxyAgent } from 'https-proxy-agent';

const proxyAgent = new HttpsProxyAgent('http://proxy.company.com:8080');

export const dynamoDBClient = new DynamoDBClient({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
  requestHandler: new NodeHttpHandler({
    httpAgent: proxyAgent,
    httpsAgent: proxyAgent,
  }),
});
```

#### 1.5 Temporarily Disable Antivirus
Some antivirus software blocks AWS SDK connections. Try temporarily disabling it.

---

### Option 2: Verify AWS Credentials

**Symptoms**: `UnrecognizedClientException`, `InvalidSignatureException`

**Check your credentials**:
1. Go to AWS Console: https://console.aws.amazon.com/
2. Click your username (top right) → **Security credentials**
3. Scroll to **Access keys**
4. Verify your Access Key ID matches: `AKIAYAZ43JRWGTZTVW27`
5. If not, create a new access key and update `.env`

**Check IAM Permissions**:
1. Go to AWS Console → **IAM** → **Users**
2. Click your username
3. Click **Add permissions** → **Attach policies directly**
4. Search for and attach: `AmazonDynamoDBFullAccess`
5. Click **Add permissions**

---

### Option 3: Use Local DynamoDB (Development Only)

If you can't fix the AWS connection, use local DynamoDB for development:

#### 3.1 Install DynamoDB Local
```bash
# Download DynamoDB Local
# https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html

# Or use Docker
docker run -p 8000:8000 amazon/dynamodb-local
```

#### 3.2 Update .env
```env
DYNAMODB_ENDPOINT=http://localhost:8000
```

#### 3.3 Restart Server
```bash
npm run dev
```

---

### Option 4: Create Tables Manually in AWS Console

If automatic table creation fails, create them manually:

#### 4.1 Go to AWS Console
1. Open: https://console.aws.amazon.com/dynamodb/
2. Click **Create table**

#### 4.2 Create Users Table
- **Table name**: `dev-Users`
- **Partition key**: `userId` (String)
- Click **Create table**
- After creation, click the table → **Indexes** tab → **Create index**
  - **Partition key**: `email` (String)
  - **Index name**: `email-index`
  - **Projected attributes**: All
  - Click **Create index**

#### 4.3 Create Tokens Table
- **Table name**: `dev-PasswordResetTokens`
- **Partition key**: `tokenId` (String)
- Click **Create table**
- After creation, click the table → **Indexes** tab → **Create index**
  - **Partition key**: `token` (String)
  - **Index name**: `token-index`
  - **Projected attributes**: All
  - Click **Create index**

#### 4.4 Restart Server
```bash
npm run dev
```

---

## Testing After Fix

### Test 1: Connection Test
```bash
node scripts/test-aws-connection.js
```

Expected output:
```
✅ Connection successful!
Found 2 table(s):
  - dev-Users
  - dev-PasswordResetTokens
```

### Test 2: Start Server
```bash
npm run dev
```

Expected output:
```
✅ Table dev-Users already exists
✅ Table dev-PasswordResetTokens already exists
✅ DynamoDB initialization complete
🚀 Server running on port 3000
```

### Test 3: Register User (Postman)
```
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "fullName": "Test User",
  "dateOfBirth": "1990-01-15",
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

Expected response:
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "userId": "...",
    "email": "test@example.com",
    "fullName": "Test User"
  }
}
```

---

## Common Error Messages

### Error: `ECONNRESET`
**Cause**: Network connection reset  
**Fix**: Check firewall, VPN, internet connection (Option 1)

### Error: `ETIMEDOUT`
**Cause**: Connection timeout  
**Fix**: Check internet connection, try different network

### Error: `UnrecognizedClientException`
**Cause**: Invalid AWS credentials  
**Fix**: Verify credentials in AWS Console (Option 2)

### Error: `AccessDeniedException`
**Cause**: IAM user lacks DynamoDB permissions  
**Fix**: Add `AmazonDynamoDBFullAccess` policy (Option 2)

### Error: `ResourceNotFoundException`
**Cause**: Tables don't exist  
**Fix**: Let server auto-create or create manually (Option 4)

---

## Still Having Issues?

### Get More Details
Add this to see full error details:
```bash
# In PowerShell
$env:AWS_SDK_LOG_LEVEL="debug"
npm run dev
```

### Check AWS Service Status
Visit: https://status.aws.amazon.com/
Check if DynamoDB in us-east-1 is operational.

### Try Different Region
Update `.env`:
```env
AWS_REGION=us-west-2
```

Restart server and test again.

---

## Next Steps

1. **Try Option 1 first** (network troubleshooting) - most common cause
2. **If that fails, try Option 3** (local DynamoDB) - works offline
3. **If you need AWS, try Option 4** (manual table creation)
4. **Contact your IT department** if behind corporate firewall

---

## Summary

The `ECONNRESET` error means your Node.js application cannot establish a connection to AWS DynamoDB. This is almost always a network/firewall issue, not a code problem. The application code is correct - you just need to fix the network connectivity.
