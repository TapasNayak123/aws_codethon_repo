# Fruit Basket - Products API Documentation

## Overview

The Products API allows you to manage fruits in the Fruit Basket store. You can add new fruits, retrieve all fruits, and get details of a specific fruit.

---

## Base URL

```
http://localhost:3000/api/products
```

---

## Endpoints

### 1. Create Product (Add Fruit)

Add a new fruit to the store.

**Endpoint**: `POST /api/products`

**Request Body**:
```json
{
  "productName": "Mango",
  "price": 3.99,
  "availableQuantity": 50,
  "description": "Sweet and juicy Alphonso mangoes, perfect for summer",
  "imageUrl": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400"
}
```

**Validation Rules**:
- `productName`: Required, 2-100 characters
- `price`: Required, must be positive number (> 0)
- `availableQuantity`: Required, must be non-negative integer (>= 0)
- `description`: Required, 10-500 characters
- `imageUrl`: Required, must be valid URL

**Success Response** (201 Created):
```json
{
  "status": "success",
  "message": "Product created successfully",
  "data": {
    "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "productName": "Mango",
    "price": 3.99,
    "availableQuantity": 50,
    "description": "Sweet and juicy Alphonso mangoes, perfect for summer",
    "imageUrl": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400",
    "createdAt": "2026-03-10T10:30:00.000Z",
    "updatedAt": "2026-03-10T10:30:00.000Z"
  },
  "requestId": "req-123456"
}
```

**Error Response** (400 Bad Request):
```json
{
  "status": "error",
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "requestId": "req-123456",
  "data": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

---

### 2. Get All Products (List All Fruits)

Retrieve all fruits in the store.

**Endpoint**: `GET /api/products`

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Retrieved 5 product(s)",
  "data": {
    "products": [
      {
        "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "productName": "Mango",
        "price": 3.99,
        "availableQuantity": 50,
        "description": "Sweet and juicy Alphonso mangoes, perfect for summer",
        "imageUrl": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400",
        "createdAt": "2026-03-10T10:30:00.000Z",
        "updatedAt": "2026-03-10T10:30:00.000Z"
      },
      {
        "productId": "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
        "productName": "Orange",
        "price": 2.49,
        "availableQuantity": 100,
        "description": "Fresh Valencia oranges, bursting with citrus flavor",
        "imageUrl": "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400",
        "createdAt": "2026-03-10T10:31:00.000Z",
        "updatedAt": "2026-03-10T10:31:00.000Z"
      }
    ],
    "count": 2
  },
  "requestId": "req-123457"
}
```

**Empty Response** (200 OK):
```json
{
  "status": "success",
  "message": "Retrieved 0 product(s)",
  "data": {
    "products": [],
    "count": 0
  },
  "requestId": "req-123458"
}
```

---

### 3. Get Product by ID (Get Single Fruit)

Retrieve details of a specific fruit.

**Endpoint**: `GET /api/products/:productId`

**URL Parameters**:
- `productId`: UUID of the product

**Example**: `GET /api/products/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**Success Response** (200 OK):
```json
{
  "status": "success",
  "message": "Product retrieved successfully",
  "data": {
    "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "productName": "Mango",
    "price": 3.99,
    "availableQuantity": 50,
    "description": "Sweet and juicy Alphonso mangoes, perfect for summer",
    "imageUrl": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400",
    "createdAt": "2026-03-10T10:30:00.000Z",
    "updatedAt": "2026-03-10T10:30:00.000Z"
  },
  "requestId": "req-123459"
}
```

**Error Response** (404 Not Found):
```json
{
  "status": "error",
  "message": "Product not found",
  "errorCode": "NOT_FOUND_ERROR",
  "requestId": "req-123460",
  "data": null
}
```

**Error Response** (400 Bad Request - Invalid UUID):
```json
{
  "status": "error",
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "requestId": "req-123461",
  "data": [
    {
      "field": "productId",
      "message": "Product ID must be a valid UUID"
    }
  ]
}
```

---

## Sample Fruits Data

The following sample fruits are included when you run `npm run seed-fruits`:

| Product Name | Price | Quantity | Description |
|-------------|-------|----------|-------------|
| Mango | $3.99 | 50 | Sweet and juicy Alphonso mangoes |
| Orange | $2.49 | 100 | Fresh Valencia oranges |
| Pineapple | $4.99 | 30 | Tropical golden pineapples |
| Apple | $1.99 | 150 | Crisp Red Delicious apples |
| Banana | $1.49 | 200 | Fresh Cavendish bananas |

---

## Testing with Postman

### 1. Add a New Fruit

```
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "productName": "Strawberry",
  "price": 5.99,
  "availableQuantity": 75,
  "description": "Fresh organic strawberries, sweet and juicy. Perfect for desserts and smoothies.",
  "imageUrl": "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400"
}
```

### 2. Get All Fruits

```
GET http://localhost:3000/api/products
```

### 3. Get Specific Fruit

```
GET http://localhost:3000/api/products/{productId}
```

Replace `{productId}` with an actual UUID from the response of GET all products.

---

## Setup Instructions

### 1. Start the Server

```bash
npm run dev
```

The server will automatically create the `dev-Products` table in DynamoDB if it doesn't exist.

### 2. Seed Sample Fruits (Optional)

```bash
npm run seed-fruits
```

This will add 5 sample fruits (Mango, Orange, Pineapple, Apple, Banana) to your database.

### 3. Test the API

Use Postman or any HTTP client to test the endpoints.

---

## Error Codes

| Error Code | HTTP Status | Description |
|-----------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `NOT_FOUND_ERROR` | 404 | Product not found |
| `INTERNAL_ERROR` | 500 | Internal server error |

---

## Notes

- All prices are in USD
- Product IDs are automatically generated UUIDs
- Timestamps are in ISO 8601 format (UTC)
- Image URLs use Unsplash for sample images
- Available quantity can be 0 (out of stock) but not negative

---

## Next Steps

- Add update product endpoint (PUT /api/products/:productId)
- Add delete product endpoint (DELETE /api/products/:productId)
- Add search/filter functionality
- Add pagination for large product lists
- Add product categories
- Add product reviews and ratings
