# Complete Authentication Flow Guide

## Overview

All product endpoints now require authentication. Users must register, login to get a JWT token, and then use that token to access product APIs.

---

## Step-by-Step Flow

### Step 1: Register a New User

**Endpoint**: `POST http://localhost:3000/api/auth/register`

**Request**:
```json
{
  "fullName": "John Doe",
  "dateOfBirth": "1990-01-15",
  "email": "john.doe@gmail.com",
  "password": "SecurePass123!"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "message": "User registered successfully",
  "data": {
    "userId": "f05ba9d7-6373-40e4-9bd4-60e796c2bb70",
    "email": "john.doe@gmail.com",
    "fullName": "John Doe"
  },
  "requestId": "req-123456"
}
```

---

### Step 2: Login to Get Token

**Endpoint**: `POST http://localhost:3000/api/auth/login`

**Request**:
```json
{
  "email": "john.doe@gmail.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "userId": "f05ba9d7-6373-40e4-9bd4-60e796c2bb70",
      "email": "john.doe@gmail.com",
      "fullName": "John Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmMDViYTlkNy02MzczLTQwZTQtOWJkNC02MGU3OTZjMmJiNzAiLCJlbWFpbCI6ImpvaG4uZG9lQGdtYWlsLmNvbSIsImlhdCI6MTcwOTk5OTk5OSwiZXhwIjoxNzEwMDAzNTk5fQ.abc123xyz"
  },
  "requestId": "req-123457"
}
```

**IMPORTANT**: Copy the `token` value from the response!

---

### Step 3: Add Products (Requires Token)

**Endpoint**: `POST http://localhost:3000/api/products`

**Headers**:
```
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmMDViYTlkNy02MzczLTQwZTQtOWJkNC02MGU3OTZjMmJiNzAiLCJlbWFpbCI6ImpvaG4uZG9lQGdtYWlsLmNvbSIsImlhdCI6MTcwOTk5OTk5OSwiZXhwIjoxNzEwMDAzNTk5fQ.abc123xyz
```

**Request Body** (Single Product):
```json
{
  "productName": "Mango",
  "price": 3.99,
  "availableQuantity": 50,
  "description": "Sweet and juicy Alphonso mangoes, perfect for summer. Rich in vitamins A and C.",
  "imageUrl": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400"
}
```

**Request Body** (Multiple Products):
```json
[
  {
    "productName": "Mango",
    "price": 3.99,
    "availableQuantity": 50,
    "description": "Sweet and juicy Alphonso mangoes, perfect for summer. Rich in vitamins A and C.",
    "imageUrl": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400"
  },
  {
    "productName": "Orange",
    "price": 2.49,
    "availableQuantity": 100,
    "description": "Fresh Valencia oranges, bursting with citrus flavor. Great source of vitamin C.",
    "imageUrl": "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400"
  }
]
```

**Success Response** (201 Created):
```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "productId": "uuid-here",
    "productName": "Mango",
    "price": 3.99,
    "availableQuantity": 50,
    "description": "Sweet and juicy Alphonso mangoes...",
    "imageUrl": "https://...",
    "createdAt": "2026-03-10T...",
    "updatedAt": "2026-03-10T..."
  },
  "requestId": "req-123458"
}
```

---

### Step 4: Get All Products (Requires Token)

**Endpoint**: `GET http://localhost:3000/api/products`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmMDViYTlkNy02MzczLTQwZTQtOWJkNC02MGU3OTZjMmJiNzAiLCJlbWFpbCI6ImpvaG4uZG9lQGdtYWlsLmNvbSIsImlhdCI6MTcwOTk5OTk5OSwiZXhwIjoxNzEwMDAzNTk5fQ.abc123xyz
```

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Retrieved 5 product(s)",
  "data": {
    "products": [
      {
        "productId": "uuid-1",
        "productName": "Mango",
        "price": 3.99,
        ...
      }
    ],
    "count": 5
  },
  "requestId": "req-123459"
}
```

---

### Step 5: Get Single Product (Requires Token)

**Endpoint**: `GET http://localhost:3000/api/products/{productId}`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJmMDViYTlkNy02MzczLTQwZTQtOWJkNC02MGU3OTZjMmJiNzAiLCJlbWFpbCI6ImpvaG4uZG9lQGdtYWlsLmNvbSIsImlhdCI6MTcwOTk5OTk5OSwiZXhwIjoxNzEwMDAzNTk5fQ.abc123xyz
```

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Product retrieved successfully",
  "data": {
    "productId": "uuid-here",
    "productName": "Mango",
    "price": 3.99,
    ...
  },
  "requestId": "req-123460"
}
```

---

## Error Responses

### No Token Provided

**Response** (401 Unauthorized):
```json
{
  "status": "error",
  "message": "No token provided",
  "errorCode": "AUTHENTICATION_ERROR",
  "requestId": "req-123461",
  "data": null
}
```

### Invalid Token Format

**Response** (401 Unauthorized):
```json
{
  "status": "error",
  "message": "Invalid token format. Use: Bearer <token>",
  "errorCode": "AUTHENTICATION_ERROR",
  "requestId": "req-123462",
  "data": null
}
```

### Expired Token

**Response** (401 Unauthorized):
```json
{
  "status": "error",
  "message": "Token has expired",
  "errorCode": "AUTHENTICATION_ERROR",
  "requestId": "req-123463",
  "data": null
}
```

### Invalid Token

**Response** (401 Unauthorized):
```json
{
  "status": "error",
  "message": "Invalid token",
  "errorCode": "AUTHENTICATION_ERROR",
  "requestId": "req-123464",
  "data": null
}
```

---

## Postman Setup

### 1. Create Environment Variable

1. Click on "Environments" in Postman
2. Create new environment: "Fruit Basket Dev"
3. Add variable:
   - Name: `auth_token`
   - Initial Value: (leave empty)
   - Current Value: (leave empty)

### 2. Login Request with Auto-Save Token

**POST** `http://localhost:3000/api/auth/login`

**Body**:
```json
{
  "email": "john.doe@gmail.com",
  "password": "SecurePass123!"
}
```

**Tests Tab** (Auto-save token):
```javascript
// Save token to environment variable
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("auth_token", jsonData.data.token);
    console.log("Token saved:", jsonData.data.token);
}
```

### 3. Use Token in Product Requests

For all product endpoints, add this header:

**Authorization Tab**:
- Type: `Bearer Token`
- Token: `{{auth_token}}`

Or manually in **Headers Tab**:
```
Authorization: Bearer {{auth_token}}
```

---

## Token Information

- **Expiration**: 1 hour (3600 seconds)
- **Format**: JWT (JSON Web Token)
- **Algorithm**: HS256
- **Contains**: userId, email, issued at, expiration time

---

## Security Features

1. ✅ **Token Required**: All product endpoints require valid JWT token
2. ✅ **Token Validation**: Token signature, expiration, and format are validated
3. ✅ **User Context**: Authenticated user information is available in requests
4. ✅ **Automatic Expiration**: Tokens expire after 1 hour for security
5. ✅ **Bearer Format**: Standard OAuth 2.0 Bearer token format

---

## Testing Workflow

```
1. Register User
   POST /api/auth/register
   ↓
2. Login
   POST /api/auth/login
   → Save token from response
   ↓
3. Add Products (with token)
   POST /api/products
   Header: Authorization: Bearer <token>
   ↓
4. Get Products (with token)
   GET /api/products
   Header: Authorization: Bearer <token>
   ↓
5. Get Single Product (with token)
   GET /api/products/{productId}
   Header: Authorization: Bearer <token>
```

---

## Common Issues

### Issue: "No token provided"
**Solution**: Add `Authorization: Bearer <token>` header to your request

### Issue: "Invalid token format"
**Solution**: Ensure format is exactly `Bearer <token>` (with space after Bearer)

### Issue: "Token has expired"
**Solution**: Login again to get a new token (tokens expire after 1 hour)

### Issue: "Invalid token"
**Solution**: 
- Check if token is complete (not truncated)
- Verify you copied the entire token from login response
- Login again to get a fresh token

---

## Summary

🔐 **Authentication is now mandatory for all product operations!**

- ✅ Register → Login → Get Token → Use Token for Products
- ✅ Token expires in 1 hour
- ✅ All product endpoints (POST, GET) require authentication
- ✅ Token validation ensures only authenticated users can access products

Your Fruit Basket API is now secure! 🍎🍊🍌🥭🍍🔒
