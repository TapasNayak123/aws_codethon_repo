# Product API Schema Validation

## Overview

The POST `/api/products` endpoint now has comprehensive schema validation that validates:
- Request body structure (single object or array)
- All required fields
- Data types and formats
- Value ranges and constraints
- Unexpected fields

---

## Validation Rules

### 1. Request Body Structure

| Rule | Description |
|------|-------------|
| **Type** | Must be an object or array of objects |
| **Empty check** | Cannot be empty |
| **Array length** | If array: 1-100 products maximum |
| **Array items** | Each item must be an object |

### 2. Product Name (`productName`)

| Rule | Value |
|------|-------|
| **Required** | ✅ Yes |
| **Type** | String |
| **Min length** | 2 characters |
| **Max length** | 100 characters |
| **Allowed characters** | Letters, numbers, spaces, and `-&',.()` |
| **Trimmed** | Yes (leading/trailing spaces removed) |

**Valid examples:**
- `"Mango"`
- `"Red Apple (Fuji)"`
- `"Banana - Organic"`
- `"Orange & Lemon Mix"`

**Invalid examples:**
- `"A"` (too short)
- `"Mango@123"` (invalid character @)
- `""` (empty)

### 3. Price (`price`)

| Rule | Value |
|------|-------|
| **Required** | ✅ Yes |
| **Type** | Number (float) |
| **Min value** | 0.01 |
| **Max value** | 999,999.99 |
| **Decimal places** | Maximum 2 |

**Valid examples:**
- `3.99`
- `0.99`
- `100`
- `999999.99`

**Invalid examples:**
- `0` (too low)
- `0.001` (too many decimals)
- `-5.99` (negative)
- `1000000` (too high)
- `"3.99"` (string instead of number)

### 4. Available Quantity (`availableQuantity`)

| Rule | Value |
|------|-------|
| **Required** | ✅ Yes |
| **Type** | Integer |
| **Min value** | 0 |
| **Max value** | 1,000,000 |

**Valid examples:**
- `0`
- `50`
- `1000000`

**Invalid examples:**
- `-1` (negative)
- `1.5` (not an integer)
- `1000001` (too high)
- `"50"` (string instead of number)

### 5. Description (`description`)

| Rule | Value |
|------|-------|
| **Required** | ✅ Yes |
| **Type** | String |
| **Min length** | 10 characters |
| **Max length** | 1000 characters |
| **Trimmed** | Yes (leading/trailing spaces removed) |

**Valid examples:**
- `"Sweet and juicy Alphonso mangoes, perfect for summer."`
- `"Fresh organic bananas from local farms. Rich in potassium and fiber."`

**Invalid examples:**
- `"Tasty"` (too short - less than 10 chars)
- `""` (empty)

### 6. Image URL (`imageUrl`)

| Rule | Value |
|------|-------|
| **Required** | ✅ Yes |
| **Type** | String (URL) |
| **Protocol** | Must be HTTP or HTTPS |
| **Max length** | 2048 characters |
| **Trimmed** | Yes (leading/trailing spaces removed) |

**Valid examples:**
- `"https://example.com/mango.jpg"`
- `"http://images.example.com/fruits/apple.png"`
- `"https://cdn.example.com/products/banana.webp"`

**Invalid examples:**
- `"example.com/mango.jpg"` (missing protocol)
- `"ftp://example.com/mango.jpg"` (invalid protocol)
- `"not-a-url"` (invalid format)
- `""` (empty)

### 7. Unexpected Fields

Any fields not in the allowed list will be rejected:

**Allowed fields:**
- `productName`
- `price`
- `availableQuantity`
- `description`
- `imageUrl`

**Example error:**
```json
{
  "status": "error",
  "message": "Unexpected fields: category, brand. Allowed fields are: productName, price, availableQuantity, description, imageUrl"
}
```

---

## Test Cases

### ✅ Valid Single Product

```json
{
  "productName": "Mango",
  "price": 3.99,
  "availableQuantity": 50,
  "description": "Sweet and juicy Alphonso mangoes, perfect for summer. Rich in vitamins A and C.",
  "imageUrl": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400"
}
```

**Expected:** 201 Created

---

### ✅ Valid Multiple Products

```json
[
  {
    "productName": "Mango",
    "price": 3.99,
    "availableQuantity": 50,
    "description": "Sweet and juicy Alphonso mangoes, perfect for summer.",
    "imageUrl": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400"
  },
  {
    "productName": "Orange",
    "price": 2.49,
    "availableQuantity": 100,
    "description": "Fresh Valencia oranges, bursting with citrus flavor.",
    "imageUrl": "https://images.unsplash.com/photo-1580052614034-c55d20bfee3b?w=400"
  }
]
```

**Expected:** 201 Created

---

### ❌ Invalid: Empty Body

```json
{}
```

**Expected:** 400 Bad Request
```json
{
  "status": "error",
  "message": "Product validation failed",
  "errorCode": "VALIDATION_ERROR",
  "data": {
    "errors": [
      {
        "field": "body",
        "message": "Request body cannot be empty"
      }
    ]
  }
}
```

---

### ❌ Invalid: Missing Required Field

```json
{
  "productName": "Mango",
  "price": 3.99,
  "availableQuantity": 50,
  "imageUrl": "https://example.com/mango.jpg"
}
```

**Expected:** 400 Bad Request
```json
{
  "status": "error",
  "message": "Product validation failed",
  "errorCode": "VALIDATION_ERROR",
  "data": {
    "errors": [
      {
        "field": "description",
        "message": "Description is required"
      }
    ]
  }
}
```

---

### ❌ Invalid: Price Too Low

```json
{
  "productName": "Mango",
  "price": 0,
  "availableQuantity": 50,
  "description": "Sweet and juicy mangoes",
  "imageUrl": "https://example.com/mango.jpg"
}
```

**Expected:** 400 Bad Request
```json
{
  "status": "error",
  "message": "Product validation failed",
  "errorCode": "VALIDATION_ERROR",
  "data": {
    "errors": [
      {
        "field": "price",
        "message": "Price must be between $0.01 and $999,999.99",
        "value": 0
      }
    ]
  }
}
```

---

### ❌ Invalid: Price Too Many Decimals

```json
{
  "productName": "Mango",
  "price": 3.999,
  "availableQuantity": 50,
  "description": "Sweet and juicy mangoes",
  "imageUrl": "https://example.com/mango.jpg"
}
```

**Expected:** 400 Bad Request
```json
{
  "status": "error",
  "message": "Product validation failed",
  "errorCode": "VALIDATION_ERROR",
  "data": {
    "errors": [
      {
        "field": "price",
        "message": "Price must have at most 2 decimal places",
        "value": 3.999
      }
    ]
  }
}
```

---

### ❌ Invalid: Negative Quantity

```json
{
  "productName": "Mango",
  "price": 3.99,
  "availableQuantity": -10,
  "description": "Sweet and juicy mangoes",
  "imageUrl": "https://example.com/mango.jpg"
}
```

**Expected:** 400 Bad Request
```json
{
  "status": "error",
  "message": "Product validation failed",
  "errorCode": "VALIDATION_ERROR",
  "data": {
    "errors": [
      {
        "field": "availableQuantity",
        "message": "Available quantity must be between 0 and 1,000,000",
        "value": -10
      }
    ]
  }
}
```

---

### ❌ Invalid: Description Too Short

```json
{
  "productName": "Mango",
  "price": 3.99,
  "availableQuantity": 50,
  "description": "Tasty",
  "imageUrl": "https://example.com/mango.jpg"
}
```

**Expected:** 400 Bad Request
```json
{
  "status": "error",
  "message": "Product validation failed",
  "errorCode": "VALIDATION_ERROR",
  "data": {
    "errors": [
      {
        "field": "description",
        "message": "Description must be between 10 and 1000 characters",
        "value": "Tasty"
      }
    ]
  }
}
```

---

### ❌ Invalid: Invalid URL

```json
{
  "productName": "Mango",
  "price": 3.99,
  "availableQuantity": 50,
  "description": "Sweet and juicy mangoes",
  "imageUrl": "not-a-valid-url"
}
```

**Expected:** 400 Bad Request
```json
{
  "status": "error",
  "message": "Product validation failed",
  "errorCode": "VALIDATION_ERROR",
  "data": {
    "errors": [
      {
        "field": "imageUrl",
        "message": "Image URL must be a valid HTTP/HTTPS URL",
        "value": "not-a-valid-url"
      }
    ]
  }
}
```

---

### ❌ Invalid: Unexpected Fields

```json
{
  "productName": "Mango",
  "price": 3.99,
  "availableQuantity": 50,
  "description": "Sweet and juicy mangoes",
  "imageUrl": "https://example.com/mango.jpg",
  "category": "Fruits",
  "brand": "FreshFarms"
}
```

**Expected:** 400 Bad Request
```json
{
  "status": "error",
  "message": "Product validation failed",
  "errorCode": "VALIDATION_ERROR",
  "data": {
    "errors": [
      {
        "field": "body",
        "message": "Unexpected fields: category, brand. Allowed fields are: productName, price, availableQuantity, description, imageUrl"
      }
    ]
  }
}
```

---

### ❌ Invalid: Empty Array

```json
[]
```

**Expected:** 400 Bad Request
```json
{
  "status": "error",
  "message": "Product validation failed",
  "errorCode": "VALIDATION_ERROR",
  "data": {
    "errors": [
      {
        "field": "body",
        "message": "Product array cannot be empty. Provide at least one product."
      }
    ]
  }
}
```

---

### ❌ Invalid: Too Many Products

```json
[
  // 101 products...
]
```

**Expected:** 400 Bad Request
```json
{
  "status": "error",
  "message": "Product validation failed",
  "errorCode": "VALIDATION_ERROR",
  "data": {
    "errors": [
      {
        "field": "body",
        "message": "Cannot create more than 100 products at once"
      }
    ]
  }
}
```

---

### ❌ Invalid: Product Name with Invalid Characters

```json
{
  "productName": "Mango@123#",
  "price": 3.99,
  "availableQuantity": 50,
  "description": "Sweet and juicy mangoes",
  "imageUrl": "https://example.com/mango.jpg"
}
```

**Expected:** 400 Bad Request
```json
{
  "status": "error",
  "message": "Product validation failed",
  "errorCode": "VALIDATION_ERROR",
  "data": {
    "errors": [
      {
        "field": "productName",
        "message": "Product name contains invalid characters",
        "value": "Mango@123#"
      }
    ]
  }
}
```

---

## Summary

✅ **Comprehensive validation** for all fields
✅ **Supports both single and array** requests
✅ **Clear error messages** with field names and values
✅ **Range validation** for numbers
✅ **Format validation** for URLs and text
✅ **Prevents unexpected fields**
✅ **Limits array size** (max 100 products)

Your Product API is now production-ready with robust schema validation! 🎯
