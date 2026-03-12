# Fruit Basket API - Complete Setup Guide

## 🎉 What's New

Your authentication API now includes a complete **Products API** for managing fruits in the Fruit Basket store!

---

## ✅ What Was Added

### New Files Created

1. **Types**: `src/types/product.types.ts`
   - Product interface and DTOs

2. **Model**: `src/models/product.model.ts`
   - DynamoDB operations for products

3. **Service**: `src/services/product.service.ts`
   - Business logic for product management

4. **Validators**: `src/validators/product.validators.ts`
   - Input validation rules

5. **Controller**: `src/controllers/product.controller.ts`
   - HTTP request handlers

6. **Routes**: `src/routes/product.routes.ts`
   - API endpoint definitions

7. **Seed Script**: `scripts/seed-fruits.js`
   - Sample data for testing

8. **Documentation**: `PRODUCTS-API.md`
   - Complete API reference

### Modified Files

1. **src/routes/index.ts**
   - Added product routes

2. **src/config/env.config.ts**
   - Added products table configuration

3. **src/config/dynamodb-init.ts**
   - Added automatic products table creation

4. **.env**
   - Added `DYNAMODB_PRODUCTS_TABLE=dev-Products`

5. **package.json**
   - Added `seed-fruits` script

---

## 🚀 Quick Start

### Step 1: Start the Server

```bash
npm run dev
```

The server will automatically:
- Create `dev-Users` table (if not exists)
- Create `dev-PasswordResetTokens` table (if not exists)
- Create `dev-Products` table (if not exists) ✨ NEW!
- Start on port 3000

### Step 2: Seed Sample Fruits (Optional)

```bash
npm run seed-fruits
```

This adds 5 sample fruits:
- 🥭 Mango ($3.99)
- 🍊 Orange ($2.49)
- 🍍 Pineapple ($4.99)
- 🍎 Apple ($1.99)
- 🍌 Banana ($1.49)

---

## 📋 API Endpoints

### Products API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Add a new fruit |
| GET | `/api/products` | Get all fruits |
| GET | `/api/products/:productId` | Get specific fruit |

### Authentication API (Existing)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

---

## 🧪 Testing with Postman

### 1. Add a Fruit

```http
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "productName": "Mango",
  "price": 3.99,
  "availableQuantity": 50,
  "description": "Sweet and juicy Alphonso mangoes, perfect for summer. Rich in vitamins A and C.",
  "imageUrl": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400"
}
```

**Expected Response** (201 Created):
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
  }
}
```

### 2. Get All Fruits

```http
GET http://localhost:3000/api/products
```

**Expected Response** (200 OK):
```json
{
  "status": "success",
  "message": "Retrieved 5 product(s)",
  "data": {
    "products": [
      {
        "productId": "...",
        "productName": "Mango",
        "price": 3.99,
        ...
      }
    ],
    "count": 5
  }
}
```

### 3. Get Specific Fruit

```http
GET http://localhost:3000/api/products/{productId}
```

Replace `{productId}` with actual UUID from previous response.

---

## 📊 Database Tables

Your DynamoDB now has 3 tables:

| Table Name | Primary Key | Purpose |
|-----------|-------------|---------|
| `dev-Users` | userId | User accounts |
| `dev-PasswordResetTokens` | tokenId | Password reset tokens |
| `dev-Products` | productId | Fruit products ✨ NEW! |

---

## 🔍 Verify Setup

### Check Tables in AWS Console

1. Go to: https://console.aws.amazon.com/dynamodb/
2. Click **Tables** in left sidebar
3. You should see:
   - ✅ dev-Users
   - ✅ dev-PasswordResetTokens
   - ✅ dev-Products

### Check Server Logs

When you run `npm run dev`, you should see:

```
🔧 Initializing DynamoDB tables...
   Region: us-east-1
   Endpoint: AWS DynamoDB
   Users Table: dev-Users
   Tokens Table: dev-PasswordResetTokens
   Products Table: dev-Products

✅ Table dev-Users already exists
✅ Table dev-PasswordResetTokens already exists
✅ Table dev-Products already exists
✅ DynamoDB initialization complete

🚀 Server running on port 3000
```

---

## 📖 Complete Documentation

- **Products API**: See `PRODUCTS-API.md` for detailed API reference
- **Authentication API**: See `QUICKSTART.md` for auth endpoints
- **AWS Setup**: See `AWS-CREDENTIALS-GUIDE.md` for credentials
- **DynamoDB Setup**: See `DYNAMODB-SETUP.md` for database info
- **Troubleshooting**: See `TROUBLESHOOTING-AWS.md` for connection issues

---

## 🎯 What You Can Do Now

1. ✅ Register users
2. ✅ Login users
3. ✅ Reset passwords
4. ✅ Add fruits to store ✨ NEW!
5. ✅ View all fruits ✨ NEW!
6. ✅ Get fruit details ✨ NEW!

---

## 🔧 Troubleshooting

### Products Table Not Created

If the products table isn't created automatically:

```bash
# Restart the server
npm run dev
```

The server will detect the missing table and create it.

### Seed Script Fails

If `npm run seed-fruits` fails:

1. Make sure server is running: `npm run dev`
2. Check AWS credentials in `.env`
3. Verify products table exists in AWS Console

### Can't Add Products

Check validation errors:
- Product name: 2-100 characters
- Price: Must be positive (> 0)
- Quantity: Must be non-negative (>= 0)
- Description: 10-500 characters
- Image URL: Must be valid URL

---

## 🎉 Success!

Your Fruit Basket API is ready! You now have:
- ✅ Complete authentication system
- ✅ Products management for fruits
- ✅ Automatic DynamoDB table creation
- ✅ Sample data seeding
- ✅ Full API documentation

Start testing with Postman and enjoy your Fruit Basket store! 🍎🍊🍌🥭🍍
