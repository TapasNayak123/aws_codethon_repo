# AWS Credentials Setup Guide

## Overview

To connect your application to AWS DynamoDB, you need 4 pieces of information:

1. **DYNAMODB_ENDPOINT** - Leave empty for AWS DynamoDB (only used for local)
2. **AWS_REGION** - The AWS region where your DynamoDB tables are located
3. **AWS_ACCESS_KEY_ID** - Your AWS access key
4. **AWS_SECRET_ACCESS_KEY** - Your AWS secret key

---

## Step-by-Step Guide

### Step 1: Get AWS Region

**What is it?** The geographic location where your DynamoDB tables will be stored.

**How to get it:**

1. Go to [AWS Console](https://console.aws.amazon.com/)
2. Log in to your AWS account
3. Look at the top-right corner of the page
4. You'll see a region selector (e.g., "N. Virginia", "Ohio", "Oregon")

**Common regions:**
- `us-east-1` - US East (N. Virginia)
- `us-east-2` - US East (Ohio)
- `us-west-1` - US West (N. California)
- `us-west-2` - US West (Oregon)
- `ap-south-1` - Asia Pacific (Mumbai)
- `eu-west-1` - Europe (Ireland)

**Example in `.env`:**
```env
AWS_REGION=us-east-1
```

---

### Step 2: Create IAM User and Get Access Keys

**What are they?** Credentials that allow your application to access AWS services.

#### 2.1: Go to IAM Service

1. Open [AWS Console](https://console.aws.amazon.com/)
2. In the search bar at the top, type "IAM"
3. Click on "IAM" (Identity and Access Management)

#### 2.2: Create a New User

1. In the left sidebar, click "Users"
2. Click "Create user" button (orange button on the right)
3. Enter a username (e.g., "auth-api-user")
4. Click "Next"

#### 2.3: Set Permissions

**Option A: Attach Policies Directly (Recommended for Development)**

1. Select "Attach policies directly"
2. In the search box, type "DynamoDB"
3. Check the box next to "AmazonDynamoDBFullAccess"
4. Click "Next"

**Option B: Create Custom Policy (Recommended for Production)**

1. Select "Attach policies directly"
2. Click "Create policy" (opens in new tab)
3. Click "JSON" tab
4. Paste this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem",
        "dynamodb:GetItem",
        "dynamodb:Query",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:Scan"
      ],
      "Resource": [
        "arn:aws:dynamodb:us-east-1:*:table/prod-Users",
        "arn:aws:dynamodb:us-east-1:*:table/prod-Users/index/*",
        "arn:aws:dynamodb:us-east-1:*:table/prod-PasswordResetTokens",
        "arn:aws:dynamodb:us-east-1:*:table/prod-PasswordResetTokens/index/*"
      ]
    }
  ]
}
```

5. Click "Next"
6. Name it "AuthAPIPolicy"
7. Click "Create policy"
8. Go back to the user creation tab
9. Refresh the policy list
10. Search for "AuthAPIPolicy" and select it
11. Click "Next"

#### 2.4: Review and Create

1. Review the user details
2. Click "Create user"

#### 2.5: Create Access Keys

1. Click on the username you just created
2. Click the "Security credentials" tab
3. Scroll down to "Access keys" section
4. Click "Create access key"
5. Select "Application running outside AWS"
6. Check the confirmation box
7. Click "Next"
8. (Optional) Add a description tag
9. Click "Create access key"

#### 2.6: Save Your Credentials

**IMPORTANT:** This is the ONLY time you'll see the secret key!

You'll see:
- **Access key ID** - Something like: `AKIAIOSFODNN7EXAMPLE`
- **Secret access key** - Something like: `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY`

**Save these immediately:**

1. Click "Download .csv file" (recommended)
2. Or copy both values to a secure location

**Example in `.env`:**
```env
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

---

### Step 3: Set DYNAMODB_ENDPOINT

**For AWS DynamoDB (Production):**
```env
DYNAMODB_ENDPOINT=
```
Leave it empty! The SDK will automatically connect to AWS.

**For DynamoDB Local (Development):**
```env
DYNAMODB_ENDPOINT=http://localhost:8000
```

---

## Complete `.env` Configuration

### For AWS DynamoDB (Production)

```env
# Application Configuration
NODE_ENV=production
PORT=3000

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
DYNAMODB_ENDPOINT=

# DynamoDB Tables
DYNAMODB_USERS_TABLE=prod-Users
DYNAMODB_TOKENS_TABLE=prod-PasswordResetTokens

# JWT Configuration
JWT_SECRET=your_production_secret_key_256_bits_minimum
JWT_EXPIRATION=1h

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=noreply@yourcompany.com

# Frontend URL
RESET_PASSWORD_URL=https://yourapp.com/reset-password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

---

## Visual Guide with Screenshots

### Finding AWS Region

```
AWS Console Top Bar:
+----------------------------------------------------------+
| AWS  [Services ▼]  [Search]     [Region: N. Virginia ▼] |
+----------------------------------------------------------+
                                           ↑
                                    Click here to see region
```

The region code is shown when you hover over the region name:
- N. Virginia = `us-east-1`
- Ohio = `us-east-2`
- Oregon = `us-west-2`

### IAM User Creation Flow

```
AWS Console
    |
    v
Search "IAM"
    |
    v
Click "Users" (left sidebar)
    |
    v
Click "Create user"
    |
    v
Enter username: "auth-api-user"
    |
    v
Click "Next"
    |
    v
Select "Attach policies directly"
    |
    v
Search and select "AmazonDynamoDBFullAccess"
    |
    v
Click "Next"
    |
    v
Click "Create user"
    |
    v
Click on the username
    |
    v
Click "Security credentials" tab
    |
    v
Scroll to "Access keys"
    |
    v
Click "Create access key"
    |
    v
Select "Application running outside AWS"
    |
    v
Check confirmation box
    |
    v
Click "Next"
    |
    v
Click "Create access key"
    |
    v
SAVE YOUR CREDENTIALS!
    |
    v
Download .csv file
```

---

## Security Best Practices

### ⚠️ NEVER Commit Credentials to Git

**Bad:**
```bash
git add .env
git commit -m "Added config"  # ❌ DON'T DO THIS!
```

**Good:**
```bash
# .env is already in .gitignore
git add .env.example  # ✅ Only commit the example
git commit -m "Added config example"
```

### ✅ Use Environment Variables

**For Production Deployment:**

Don't use `.env` file in production. Instead, set environment variables directly:

**Heroku:**
```bash
heroku config:set AWS_ACCESS_KEY_ID=your_key
heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
```

**AWS Elastic Beanstalk:**
Use the console to set environment variables in Configuration → Software

**Docker:**
```bash
docker run -e AWS_ACCESS_KEY_ID=your_key -e AWS_SECRET_ACCESS_KEY=your_secret ...
```

### 🔒 Rotate Keys Regularly

1. Go to IAM → Users → Your User → Security credentials
2. Create a new access key
3. Update your application with the new key
4. Test that it works
5. Delete the old access key

### 📝 Use Least Privilege

Don't give more permissions than needed. Use custom policies (Option B above) instead of `AmazonDynamoDBFullAccess` for production.

---

## Troubleshooting

### Testing Your Connection

After setting up credentials, test the connection:

```bash
node scripts/test-aws-connection.js
```

This will verify:
- AWS credentials are valid
- DynamoDB is accessible
- Tables exist (or can be created)

**If Test Fails:**

**Error: `ECONNRESET` or `ETIMEDOUT`**
- This is a **network/firewall issue**, not credentials
- See `TROUBLESHOOTING-AWS.md` for detailed solutions
- Most common causes:
  - Windows Firewall blocking Node.js
  - Corporate VPN/proxy interference
  - No internet connection
  - Antivirus blocking AWS SDK

**Error: `UnrecognizedClientException`**
- Invalid AWS credentials
- Double-check Access Key ID and Secret Access Key in `.env`
- Verify credentials in AWS Console

**Error: `AccessDeniedException`**
- IAM user lacks DynamoDB permissions
- Add `AmazonDynamoDBFullAccess` policy to your IAM user

### Error: "The security token included in the request is invalid"

**Cause:** Wrong access key or secret key

**Solution:**
1. Double-check your credentials in `.env`
2. Make sure there are no extra spaces
3. Verify the keys in AWS Console → IAM → Users → Your User → Security credentials

### Error: "User is not authorized to perform: dynamodb:PutItem"

**Cause:** IAM user doesn't have DynamoDB permissions

**Solution:**
1. Go to IAM → Users → Your User
2. Click "Add permissions"
3. Attach "AmazonDynamoDBFullAccess" policy

### Error: "Cannot connect to DynamoDB"

**Cause:** Wrong region or endpoint

**Solution:**
1. Verify `AWS_REGION` matches where your tables are
2. For AWS DynamoDB, ensure `DYNAMODB_ENDPOINT=` (empty)
3. Check your internet connection

---

## Quick Reference

| Variable | Where to Get It | Example |
|----------|----------------|---------|
| `DYNAMODB_ENDPOINT` | Leave empty for AWS | `` (empty) |
| `AWS_REGION` | AWS Console top-right | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | IAM → Users → Create access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | IAM → Users → Create access key | `wJalrXUtnFEMI/...` |

---

## Next Steps

After getting your credentials:

1. Update `.env` with your credentials
2. Create DynamoDB tables (see `DYNAMODB-SETUP.md`)
3. Restart your server: `npm run dev`
4. Test your APIs in Postman

---

## Need Help?

- **AWS Documentation:** https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html
- **DynamoDB Setup:** See `DYNAMODB-SETUP.md` in this project
- **Quick Start:** See `QUICKSTART.md` in this project
