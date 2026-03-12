# Production Deployment Guide

## Pre-Deployment Checklist

### 1. Security Configuration

- [ ] Generate strong JWT secret (256-bit)
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- [ ] Use production AWS credentials (IAM user with minimal permissions)
- [ ] Enable MFA on AWS account
- [ ] Use prod- prefix for DynamoDB tables
- [ ] Set NODE_ENV=production
- [ ] Set LOG_LEVEL=error or warn
- [ ] Remove all development credentials from .env

### 2. AWS IAM Permissions

Create an IAM user with ONLY these permissions:

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
        "dynamodb:Scan",
        "dynamodb:UpdateItem",
        "dynamodb:DeleteItem",
        "dynamodb:DescribeTable",
        "dynamodb:CreateTable"
      ],
      "Resource": [
        "arn:aws:dynamodb:*:*:table/prod-Users",
        "arn:aws:dynamodb:*:*:table/prod-Users/index/*",
        "arn:aws:dynamodb:*:*:table/prod-Products",
        "arn:aws:dynamodb:*:*:table/prod-Products/index/*"
      ]
    }
  ]
}
```

### 3. Environment Configuration

Copy `.env.production.example` to `.env`:

```bash
cp .env.production.example .env
```

Update all values:
- AWS credentials
- JWT secret
- Table names (prod- prefix)
- Rate limiting (stricter)
- Log level (error)

### 4. Code Quality

```bash
# Run TypeScript compilation check
npm run lint

# Run tests
npm test

# Build production bundle
npm run build
```

## Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Build Docker Image

```bash
docker build -t auth-api:1.0.0 .
```

#### Run Container

```bash
docker run -d \
  --name auth-api \
  -p 3000:3000 \
  --env-file .env \
  --restart unless-stopped \
  auth-api:1.0.0
```

#### Health Check

```bash
curl http://localhost:3000/api/health
```

### Option 2: Direct Node.js Deployment

#### Install Dependencies

```bash
npm ci --production
```

#### Build Application

```bash
npm run build
```

#### Start with Production Check

```bash
npm run start:prod
```

### Option 3: PM2 Process Manager

#### Install PM2

```bash
npm install -g pm2
```

#### Create PM2 Ecosystem File

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'auth-api',
    script: './dist/index.js',
    instances: 2,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M'
  }]
};
```

#### Start with PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

## Post-Deployment

### 1. Create DynamoDB Tables

```bash
npm run create-tables
```

### 2. Verify Endpoints

```bash
# Health check
curl http://your-domain.com/api/health

# Register user
curl -X POST http://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "dateOfBirth": "1990-01-01",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Login
curl -X POST http://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

### 3. Monitor Application

```bash
# Docker logs
docker logs -f auth-api

# PM2 logs
pm2 logs auth-api

# Direct logs
tail -f logs/*.log
```

### 4. Set Up Monitoring

- Configure CloudWatch alarms for:
  - High error rates
  - DynamoDB throttling
  - Memory usage
  - CPU usage
  - Response time

## Security Best Practices

### 1. Network Security

- [ ] Use HTTPS only (configure reverse proxy)
- [ ] Enable CORS only for trusted domains
- [ ] Use VPC for DynamoDB access
- [ ] Configure security groups
- [ ] Enable AWS WAF

### 2. Application Security

- [ ] Rate limiting enabled (50 req/15min)
- [ ] JWT expiration set (1 hour)
- [ ] Password hashing with bcrypt (12 rounds)
- [ ] Input validation on all endpoints
- [ ] Security headers enabled (Helmet)

### 3. Data Security

- [ ] DynamoDB encryption at rest
- [ ] Encryption in transit (TLS 1.2+)
- [ ] Regular backups enabled
- [ ] Point-in-time recovery enabled

## Performance Optimization

### 1. DynamoDB

- [ ] Enable auto-scaling
- [ ] Configure appropriate read/write capacity
- [ ] Use GSI efficiently
- [ ] Monitor throttling

### 2. Application

- [ ] Use clustering (PM2 or Docker replicas)
- [ ] Enable compression
- [ ] Implement caching where appropriate
- [ ] Monitor memory usage

## Rollback Plan

### Docker Rollback

```bash
# Stop current container
docker stop auth-api

# Start previous version
docker run -d \
  --name auth-api \
  -p 3000:3000 \
  --env-file .env \
  auth-api:previous-version
```

### PM2 Rollback

```bash
# Deploy previous version
pm2 delete auth-api
pm2 start ecosystem.config.js --env production
```

## Troubleshooting

### Application Won't Start

1. Check environment variables: `npm run start:prod`
2. Verify AWS credentials: `aws sts get-caller-identity`
3. Check DynamoDB tables exist
4. Review logs for errors

### High Error Rate

1. Check CloudWatch logs
2. Verify DynamoDB capacity
3. Check rate limiting settings
4. Review application logs

### Performance Issues

1. Monitor DynamoDB metrics
2. Check application memory usage
3. Review slow queries
4. Enable CloudWatch detailed monitoring

## Maintenance

### Regular Tasks

- [ ] Review logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate AWS credentials quarterly
- [ ] Review security settings quarterly
- [ ] Test backup restoration quarterly

### Updates

```bash
# Pull latest code
git pull origin main

# Install dependencies
npm ci --production

# Build
npm run build

# Restart application
pm2 restart auth-api
# OR
docker restart auth-api
```

## Support

For issues or questions:
1. Check logs first
2. Review CloudWatch metrics
3. Verify environment configuration
4. Check AWS service health dashboard
