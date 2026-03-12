# Authentication & Products API

A production-ready Node.js/TypeScript REST API with JWT authentication, user management, and products CRUD operations using AWS DynamoDB.

## Features

- **User Authentication**: Registration and login with JWT tokens
- **Products Management**: CRUD operations for products (authenticated)
- **Security**: Bcrypt password hashing, JWT authentication, rate limiting, security headers
- **Validation**: Comprehensive input validation on all endpoints
- **Database**: AWS DynamoDB for data persistence
- **Production Ready**: Docker support, health checks, comprehensive error handling

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: AWS DynamoDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Winston

## API Endpoints

### Authentication (No JWT Required)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token

### Products (JWT Required)
- `POST /api/products` - Create product(s)
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID

### Health Check
- `GET /api/health` - Service health status

## Quick Start

### Prerequisites
- Node.js 20+ and npm
- AWS account with DynamoDB access
- AWS credentials configured

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your AWS credentials and configuration
```

### Development

```bash
# Start development server
npm run dev

# Server runs on http://localhost:3000
```

### Production

```bash
# Build TypeScript
npm run build

# Run production server
npm run start:prod
```

### Docker

```bash
# Build Docker image
docker build -t auth-api:latest .

# Run container
docker run -p 3000:3000 --env-file .env.production auth-api:latest
```

## Environment Variables

See `.env.example` for all required environment variables:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `AWS_REGION` - AWS region
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `DYNAMODB_USERS_TABLE` - Users table name
- `DYNAMODB_PRODUCTS_TABLE` - Products table name
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRATION` - JWT token expiration
- `RATE_LIMIT_WINDOW_MS` - Rate limit window
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window
- `LOG_LEVEL` - Logging level

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── models/          # Data models
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript types
├── utils/           # Utility functions
└── validators/      # Input validation
```

## Documentation

### Getting Started
- [Quick Start Guide](QUICKSTART.md) - Setup and run the application
- [Port Error Fix](QUICK-FIX-PORT-ERROR.md) - Fix "port already in use" error

### API Documentation
- [Authentication Flow](AUTHENTICATION-FLOW.md) - Auth examples with Postman
- [Products API](PRODUCTS-API.md) - Products endpoints documentation
- [Product Validation](PRODUCT-VALIDATION.md) - Validation rules and examples

### Deployment
- [GitHub Setup](GITHUB-SETUP.md) - Upload code to GitHub
- [Production Guide](PRODUCTION-GUIDE.md) - Complete production deployment guide
- [Production Deployment](PRODUCTION-DEPLOYMENT.md) - Detailed deployment steps

### Troubleshooting & Reference
- [AWS Troubleshooting](TROUBLESHOOTING-AWS.md) - Fix AWS connection issues
- [Production Optimization](PRODUCTION-OPTIMIZATION.md) - Optimization history
- [Documentation Summary](DOCUMENTATION-SUMMARY.md) - All docs overview

## Security

- JWT authentication on protected endpoints
- Password hashing with bcrypt (12 rounds)
- Input validation on all endpoints
- Rate limiting (100 req/15min dev, 50 req/15min prod)
- Security headers (Helmet)
- CORS configuration
- Request correlation for tracing

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Scripts

```bash
npm run dev              # Start development server
npm run build            # Build TypeScript
npm run start            # Start production server
npm run start:prod       # Production check + start
npm run lint             # TypeScript compilation check
npm run clean            # Remove dist folder
npm run create-tables    # Create DynamoDB tables
npm run seed-fruits      # Seed sample products
npm run docker:build     # Build Docker image
npm run docker:up        # Start Docker containers
npm run docker:down      # Stop Docker containers
```

## License

ISC

## Author

Your Name

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
