# Quick Start Guide

## Prerequisites
- Node.js 20+ installed
- npm installed

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Setup Environment

Your `.env` file is already configured for local development with **in-memory storage** (no DynamoDB required).

### Storage Options

**Option 1: In-Memory Storage (Default - Recommended for Quick Testing)**
- Already configured in `.env` with `DYNAMODB_ENDPOINT=` (empty)
- No database setup needed
- Data is lost when server restarts
- Perfect for testing the 3 APIs in Postman

**Option 2: DynamoDB (For Persistent Storage)**
- See `DYNAMODB-SETUP.md` for complete setup instructions
- Supports both DynamoDB Local (Docker) and AWS DynamoDB
- Easy to switch - just change `.env` and restart server

### Email Configuration (Optional)

For email functionality (forgot-password), you need to update:
- `EMAIL_USER`: Your Gmail address
- `EMAIL_PASSWORD`: Your Gmail app password (not your regular password)

To get a Gmail app password:
1. Go to Google Account settings
2. Enable 2-factor authentication
3. Generate an app password for "Mail"

**For now, you can skip email setup** - registration and login will work without it.

## Step 3: Start the Server

```bash
npm run dev
```

**What happens on startup:**
1. ✅ Checks if DynamoDB tables exist
2. ✅ Creates tables automatically if they don't exist (when using DynamoDB)
3. ✅ Starts the server

You should see:
```
Initializing DynamoDB tables...
✅ Table dev-Users already exists (or created)
✅ Table dev-PasswordResetTokens already exists (or created)
✅ DynamoDB initialization complete
🚀 Server running on port 3000
📝 Environment: development

🔗 API Endpoints:
   POST http://localhost:3000/api/auth/register
   POST http://localhost:3000/api/auth/login
   POST http://localhost:3000/api/auth/forgot-password
   POST http://localhost:3000/api/auth/reset-password
   GET  http://localhost:3000/api/health
```

**Note:** 
- If using **in-memory storage** (`DYNAMODB_ENDPOINT=` empty), tables are not created
- If using **DynamoDB** (`DYNAMODB_ENDPOINT` set or empty for AWS), tables are created automatically

## Step 4: Test with Postman

### 1. Health Check
**GET** `http://localhost:3000/api/health`

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-03-09T12:00:00.000Z",
  "uptime": 10
}
```

### 2. Register a User
**POST** `http://localhost:3000/api/auth/register`

Headers:
```
Content-Type: application/json
```

Body:
```json
{
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-15",
  "email": "john.doe@gmail.com",
  "password": "Password123"
}
```

Expected response (201):
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "userId": "uuid-here",
    "email": "john.doe@gmail.com",
    "fullName": "John Doe"
  },
  "requestId": "request-id-here"
}
```

### 3. Login
**POST** `http://localhost:3000/api/auth/login`

Headers:
```
Content-Type: application/json
```

Body:
```json
{
  "email": "john.doe@gmail.com",
  "password": "Password123"
}
```

Expected response (200):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "token": "jwt-token-here",
    "user": {
      "userId": "uuid-here",
      "email": "john.doe@gmail.com",
      "fullName": "John Doe"
    }
  },
  "requestId": "request-id-here"
}
```

### 4. Forgot Password
**POST** `http://localhost:3000/api/auth/forgot-password`

Headers:
```
Content-Type: application/json
```

Body:
```json
{
  "email": "john.doe@gmail.com"
}
```

Expected response (200):
```json
{
  "status": "success",
  "message": "If your email is registered, you will receive a password reset link",
  "data": null,
  "requestId": "request-id-here"
}
```

**Note:** Email won't actually send unless you configure Gmail credentials in `.env`

## Common Issues

### Port already in use
If port 3000 is busy, change `PORT=3000` to another port in `.env`

### Switching between In-Memory and DynamoDB
- **In-Memory**: Set `DYNAMODB_ENDPOINT=` (empty) in `.env`
- **DynamoDB Local**: Set `DYNAMODB_ENDPOINT=http://localhost:8000` in `.env`
- Restart the server after changing

### Email errors
Email errors are logged but won't break the forgot-password endpoint. It will still return success.

## Validation Rules

### Email
- Must be valid email format
- Must be @gmail.com domain only

### Password
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

### Date of Birth
- Format: YYYY-MM-DD
- Must be 18+ years old

## Next Steps

Once you've tested the basic APIs:
1. Set up actual DynamoDB (local or AWS)
2. Configure Gmail for password reset emails
3. Add more features as needed

## Need Help?

Check the logs in the console - they show detailed information about each request.
