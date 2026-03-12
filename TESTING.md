# Testing Documentation

## Overview

Comprehensive unit and integration tests for the Authentication & Products API.

## Test Framework

- **Framework**: Vitest
- **HTTP Testing**: Supertest
- **Coverage**: V8

## Test Structure

```
tests/
├── setup.ts                          # Test configuration
├── unit/                             # Unit tests
│   ├── services/
│   │   ├── password.service.test.ts  # Password hashing tests
│   │   └── token.service.test.ts     # JWT token tests
│   └── utils/
│       ├── email-validator.test.ts   # Email validation tests
│       ├── password-validator.test.ts # Password strength tests
│       ├── date-validator.test.ts    # Date validation tests
│       └── response-formatter.test.ts # Response format tests
└── integration/                      # Integration tests
    ├── auth/
    │   └── auth.test.ts              # Auth API tests
    └── products/
        └── products.test.ts          # Products API tests
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Generate Coverage Report
```bash
npm run test:coverage
```

## Test Coverage

### Unit Tests

#### Password Service
- ✅ Hash password successfully
- ✅ Generate different hashes for same password
- ✅ Handle empty password
- ✅ Compare matching passwords
- ✅ Compare non-matching passwords

#### Token Service
- ✅ Generate valid JWT tokens
- ✅ Generate different tokens for same payload
- ✅ Verify valid tokens
- ✅ Reject invalid tokens
- ✅ Reject malformed tokens
- ✅ Include standard JWT claims

#### Email Validator
- ✅ Validate correct email formats
- ✅ Reject invalid email formats
- ✅ Identify Gmail addresses
- ✅ Case insensitive Gmail check

#### Password Validator
- ✅ Accept strong passwords
- ✅ Reject short passwords (< 8 chars)
- ✅ Require uppercase letters
- ✅ Require lowercase letters
- ✅ Require numbers
- ✅ Return multiple errors for weak passwords

#### Date Validator
- ✅ Validate date format (YYYY-MM-DD)
- ✅ Reject invalid dates
- ✅ Validate age (18+ years)
- ✅ Reject underage users
- ✅ Reject future dates

#### Response Formatter
- ✅ Format success responses
- ✅ Format error responses
- ✅ Handle data arrays
- ✅ Handle error arrays

### Integration Tests

#### Auth API
- ✅ Reject registration with missing fields
- ✅ Reject registration with invalid email
- ✅ Reject registration with weak password
- ✅ Reject registration with underage user
- ✅ Validate full name length
- ✅ Reject login with missing fields
- ✅ Reject login with invalid email
- ✅ Validate required fields

#### Products API
- ✅ Reject requests without authentication
- ✅ Reject requests with invalid token
- ✅ Reject products with missing fields
- ✅ Validate price range ($0.01 - $999,999.99)
- ✅ Validate quantity range (0 - 1,000,000)
- ✅ Validate description length (10-1000 chars)
- ✅ Validate image URL format
- ✅ Validate product name length (2-100 chars)
- ✅ Reject arrays with > 100 products

## Test Results

Run `npm test` to see current test results:

```bash
$ npm test

 ✓ tests/unit/services/password.service.test.ts (6 tests)
 ✓ tests/unit/services/token.service.test.ts (8 tests)
 ✓ tests/unit/utils/email-validator.test.ts (6 tests)
 ✓ tests/unit/utils/password-validator.test.ts (8 tests)
 ✓ tests/unit/utils/date-validator.test.ts (7 tests)
 ✓ tests/unit/utils/response-formatter.test.ts (8 tests)
 ✓ tests/integration/auth/auth.test.ts (10 tests)
 ✓ tests/integration/products/products.test.ts (13 tests)

Test Files  8 passed (8)
     Tests  66 passed (66)
```

## Coverage Report

Generate coverage report with:

```bash
npm run test:coverage
```

Coverage report will be generated in `coverage/` directory.

## Writing New Tests

### Unit Test Template

```typescript
import { describe, it, expect } from 'vitest';
import { functionToTest } from '../../../src/path/to/module';

describe('Module Name', () => {
  describe('functionToTest', () => {
    it('should do something', () => {
      const result = functionToTest(input);
      expect(result).toBe(expected);
    });
  });
});
```

### Integration Test Template

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import routes from '../../../src/routes/module.routes';

describe('API Integration Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/module', routes);
  });

  it('should test endpoint', async () => {
    const response = await request(app)
      .post('/api/module/endpoint')
      .send({ data: 'test' });

    expect(response.status).toBe(200);
  });
});
```

## Continuous Integration

Tests should be run in CI/CD pipeline before deployment:

```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Names**: Use descriptive test names
3. **Arrange-Act-Assert**: Follow AAA pattern
4. **Mock External Dependencies**: Mock AWS, databases, etc.
5. **Test Edge Cases**: Test boundary conditions
6. **Keep Tests Fast**: Unit tests should run quickly
7. **Maintain Tests**: Update tests when code changes

## Troubleshooting

### Tests Failing

1. Check environment variables in `tests/setup.ts`
2. Verify mocks are configured correctly
3. Check for async/await issues
4. Review test isolation

### Coverage Issues

1. Ensure all code paths are tested
2. Add tests for error cases
3. Test edge cases and boundary conditions

## Future Improvements

- [ ] Add E2E tests with real DynamoDB
- [ ] Add performance tests
- [ ] Add security tests
- [ ] Increase coverage to 90%+
- [ ] Add mutation testing
- [ ] Add contract tests for API

---

**All tests passing!** ✅
