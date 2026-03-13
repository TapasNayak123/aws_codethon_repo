# Local Testing Guide

**Before deploying to AWS, test everything locally first!**

---

## 🧪 Option 1: Test Locally Without Docker (Fastest)

### Prerequisites
- Node.js 20+ installed
- AWS credentials configured
- DynamoDB tables created

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment
```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
# Use your actual AWS credentials and dev tables
```

**Your .env should look like**:
```env
NODE_ENV=development
PORT=3000

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

DYNAMODB_USERS_TABLE=dev-Users
DYNAMODB_PRODUCTS_TABLE=dev-Products

JWT_SECRET=your-test-secret-key-change-in-production
JWT_EXPIRATION=1h

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

LOG_LEVEL=info
```

### Step 3: Create DynamoDB Tables
```bash
npm run create-tables
```

**Expected output**:
```
✅ Table dev-Users created successfully
✅ Table dev-Products created successfully
```

### Step 4: Run Tests
```bash
npm test
```

**Expected**: All 70 tests should pass

### Step 5: Start Server
```bash
npm run dev
```

**Expected output**:
```
🚀 Server running on port 3000
📝 Environment: development

🔗 API Endpoints:
   Authentication:
   POST http://localhost:3000/api/auth/register
   POST http://localhost:3000/api/auth/login
   ...
```

### Step 6: Test with Postman/curl

#### Test 1: Health Check
```bash
curl http://localhost:3000/api/health
```

**Expected**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 5.2
}
```

#### Test 2: Register User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "dateOfBirth": "1990-01-01",
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

**Expected**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "...",
    "email": "test@example.com",
    "fullName": "Test User"
  }
}
```

#### Test 3: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

**Expected**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": "...",
      "email": "test@example.com",
      "fullName": "Test User"
    }
  }
}
```

**Save the token** for next tests!

#### Test 4: Get Products (with JWT)
```bash
# Replace <TOKEN> with actual token from login
curl http://localhost:3000/api/products \
  -H "Authorization: Bearer <TOKEN>"
```

#### Test 5: Create Product (with JWT)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "productName": "Test Product",
    "price": 9.99,
    "availableQuantity": 100,
    "description": "Test product description",
    "imageUrl": "https://example.com/image.jpg"
  }'
```

---

## 🐳 Option 2: Test with Docker (Production-like)

### Prerequisites
- Docker installed
- AWS credentials configured

### Step 1: Build Docker Image
```bash
docker build -t auth-api:test .
```

**Expected**: Build completes successfully

### Step 2: Run Container
```bash
docker run -p 3000:3000 \
  -e NODE_ENV=development \
  -e PORT=3000 \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=AKIA... \
  -e AWS_SECRET_ACCESS_KEY=... \
  -e DYNAMODB_USERS_TABLE=dev-Users \
  -e DYNAMODB_PRODUCTS_TABLE=dev-Products \
  -e JWT_SECRET=your-test-secret \
  -e JWT_EXPIRATION=1h \
  -e RATE_LIMIT_WINDOW_MS=900000 \
  -e RATE_LIMIT_MAX_REQUESTS=100 \
  -e LOG_LEVEL=info \
  auth-api:test
```

### Step 3: Test Endpoints
Use same curl commands as Option 1

### Step 4: Stop Container
```bash
docker ps  # Find container ID
docker stop <container-id>
```

---

## 📊 Postman Collection (Recommended)

### Import Collection

Create a new Postman collection with these requests:

**1. Health Check**
- Method: GET
- URL: `http://localhost:3000/api/health`

**2. Register**
- Method: POST
- URL: `http://localhost:3000/api/auth/register`
- Body (JSON):
```json
{
  "fullName": "{{$randomFullName}}",
  "dateOfBirth": "1990-01-01",
  "email": "{{$randomEmail}}",
  "password": "Test1234"
}
```

**3. Login**
- Method: POST
- URL: `http://localhost:3000/api/auth/login`
- Body (JSON):
```json
{
  "email": "test@example.com",
  "password": "Test1234"
}
```
- Tests (auto-save token):
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("jwt_token", response.data.token);
}
```

**4. Get Products**
- Method: GET
- URL: `http://localhost:3000/api/products`
- Headers: `Authorization: Bearer {{jwt_token}}`

**5. Create Product**
- Method: POST
- URL: `http://localhost:3000/api/products`
- Headers: `Authorization: Bearer {{jwt_token}}`
- Body (JSON):
```json
{
  "productName": "Test Product",
  "price": 9.99,
  "availableQuantity": 100,
  "description": "Test product description",
  "imageUrl": "https://example.com/image.jpg"
}
```

---

## ✅ Local Testing Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Environment configured (`.env` file)
- [ ] DynamoDB tables created
- [ ] All tests pass (`npm test`)
- [ ] Server starts without errors
- [ ] Health check responds
- [ ] User registration works
- [ ] User login works and returns JWT
- [ ] Products API requires JWT
- [ ] Products can be created
- [ ] Products can be retrieved

---

## 🚨 Common Issues

### Issue: "Missing required environment variables"
**Fix**: Check your `.env` file has all required variables

### Issue: "Cannot connect to DynamoDB"
**Fix**: 
1. Check AWS credentials are correct
2. Check AWS region is correct
3. Check network/firewall allows AWS connection

### Issue: "Table does not exist"
**Fix**: Run `npm run create-tables`

### Issue: "Port 3000 already in use"
**Fix**: 
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: "Tests failing"
**Fix**: Check `tests/setup.ts` has correct test environment variables

---

## 🎯 Success Criteria

Your local testing is successful when:

✅ All 70 tests pass  
✅ Server starts without errors  
✅ Health check returns 200 OK  
✅ User can register  
✅ User can login and receive JWT  
✅ Products API requires authentication  
✅ Products can be created and retrieved  

**Next**: Once local testing passes, proceed to AWS setup!
