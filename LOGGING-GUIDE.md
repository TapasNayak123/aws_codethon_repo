# Enhanced Logging with Correlation ID

## Overview

The application now includes comprehensive structured logging with correlation ID tracking. This allows you to trace all logs for a specific request from start to end using a unique correlation ID.

## Key Features

- **Correlation ID Tracking**: Every request gets a unique ID that appears in all related logs
- **Structured Logging**: Logs are formatted as JSON with consistent fields
- **Log Levels**: error, warn, info, debug
- **Timestamp**: ISO 8601 format timestamps on all logs
- **Request Lifecycle Tracking**: Logs request start, processing, and completion
- **Sensitive Data Redaction**: Passwords and tokens are automatically redacted from logs

## Log Structure

Each log entry includes:

```json
{
  "timestamp": "2026-03-13T12:00:00.000Z",
  "level": "info",
  "message": "Request started",
  "correlationId": "a25b0635-79da-4f2c-b0fb-faff0c9203e9",
  "method": "POST",
  "path": "/api/auth/login",
  "ip": "192.168.1.100"
}
```

## Searching Logs by Correlation ID

### In CloudWatch Logs

1. Go to AWS CloudWatch → Log Groups
2. Select your log group (e.g., `/aws/eks/auth-api`)
3. Click "Search log group"
4. Use filter pattern: `{ $.correlationId = "YOUR-CORRELATION-ID" }`

Example:
```
{ $.correlationId = "a25b0635-79da-4f2c-b0fb-faff0c9203e9" }
```

This will show ALL logs for that specific request from start to end.

### In Local Development

When running locally, logs are printed to console. To filter by correlation ID:

**Linux/Mac:**
```bash
npm start | grep "a25b0635-79da-4f2c-b0fb-faff0c9203e9"
```

**Windows PowerShell:**
```powershell
npm start | Select-String "a25b0635-79da-4f2c-b0fb-faff0c9203e9"
```

## Log Levels

### ERROR
Critical errors that need immediate attention:
- Database connection failures
- Authentication failures
- Unhandled exceptions

### WARN
Warning conditions that should be reviewed:
- Validation failures
- Deprecated API usage
- Rate limit approaching

### INFO
Normal operational messages:
- Request started/completed
- User registration/login
- Product creation

### DEBUG
Detailed information for debugging:
- Function entry/exit
- Variable values
- Detailed processing steps

## Example: Tracing a Login Request

Here's what logs look like for a complete login request:

```json
// 1. Request starts
{
  "timestamp": "2026-03-13T12:00:00.000Z",
  "level": "info",
  "message": "Request started",
  "correlationId": "abc-123",
  "method": "POST",
  "path": "/api/auth/login",
  "body": {
    "email": "user@example.com",
    "password": "***REDACTED***"
  }
}

// 2. Controller processing
{
  "timestamp": "2026-03-13T12:00:00.100Z",
  "level": "info",
  "message": "Processing user login",
  "correlationId": "abc-123",
  "endpoint": "POST /api/auth/login"
}

// 3. Authentication
{
  "timestamp": "2026-03-13T12:00:00.200Z",
  "level": "debug",
  "message": "Authenticating user",
  "correlationId": "abc-123",
  "email": "user@example.com"
}

// 4. Success
{
  "timestamp": "2026-03-13T12:00:00.300Z",
  "level": "info",
  "message": "User logged in successfully",
  "correlationId": "abc-123",
  "userId": "user-456",
  "email": "user@example.com"
}

// 5. Request completes
{
  "timestamp": "2026-03-13T12:00:00.400Z",
  "level": "info",
  "message": "Request completed",
  "correlationId": "abc-123",
  "statusCode": 200,
  "duration": "400ms"
}
```

## Using Correlation ID in Your Code

### In Controllers

```typescript
import { logger } from '../utils/logger';

export async function myController(req: Request, res: Response) {
  const requestId = (req as any).requestId;
  const requestLogger = logger.child(requestId, {
    endpoint: 'POST /api/my-endpoint',
  });

  requestLogger.info('Processing request');
  requestLogger.debug('Some debug info', { data: 'value' });
  requestLogger.error('Something went wrong', { error: 'details' });
}
```

### In Services

```typescript
import { logger } from '../utils/logger';

export async function myService(correlationId: string) {
  const serviceLogger = logger.child(correlationId, {
    service: 'MyService',
  });

  serviceLogger.info('Service operation started');
  // ... do work ...
  serviceLogger.info('Service operation completed');
}
```

## Log Aggregation by Level

### View Only Errors

**CloudWatch:**
```
{ $.level = "error" }
```

**Local:**
```bash
npm start | grep '"level":"error"'
```

### View Errors and Warnings

**CloudWatch:**
```
{ $.level = "error" || $.level = "warn" }
```

**Local:**
```bash
npm start | grep -E '"level":"(error|warn)"'
```

## Python Agent Integration

For your Python agent to read error logs from CloudWatch:

```python
import boto3
from datetime import datetime, timedelta

def get_error_logs(log_group_name, hours=24):
    """
    Fetch error logs from CloudWatch
    """
    client = boto3.client('logs', region_name='us-east-1')
    
    # Calculate time range
    end_time = datetime.now()
    start_time = end_time - timedelta(hours=hours)
    
    # Query for error logs
    response = client.filter_log_events(
        logGroupName=log_group_name,
        startTime=int(start_time.timestamp() * 1000),
        endTime=int(end_time.timestamp() * 1000),
        filterPattern='{ $.level = "error" }'
    )
    
    return response['events']

def get_logs_by_correlation_id(log_group_name, correlation_id):
    """
    Fetch all logs for a specific request
    """
    client = boto3.client('logs', region_name='us-east-1')
    
    response = client.filter_log_events(
        logGroupName=log_group_name,
        filterPattern=f'{{ $.correlationId = "{correlation_id}" }}'
    )
    
    return response['events']

# Usage
errors = get_error_logs('/aws/eks/auth-api', hours=24)
for error in errors:
    print(error['message'])
```

## Configuration

### Change Log Level

Edit `.env` file:

```bash
# Development: debug (shows all logs)
LOG_LEVEL=debug

# Production: info (shows info, warn, error)
LOG_LEVEL=info

# Production (minimal): warn (shows only warn and error)
LOG_LEVEL=warn
```

### CloudWatch Log Retention

Logs are retained for 7 days by default. To change:

1. Go to CloudWatch → Log Groups
2. Select your log group
3. Actions → Edit retention setting
4. Choose retention period (1 day to 10 years)

## Best Practices

1. **Always use correlation ID**: Use `logger.child(requestId)` in controllers
2. **Log at appropriate levels**: Don't log everything as error
3. **Include context**: Add relevant metadata to logs
4. **Redact sensitive data**: Never log passwords, tokens, or PII
5. **Use structured logging**: Pass objects, not concatenated strings
6. **Search by correlation ID**: Trace complete request lifecycle

## Troubleshooting

### Logs not appearing in CloudWatch

1. Check pod logs: `kubectl logs -l app=auth-api`
2. Verify CloudWatch agent is running
3. Check IAM permissions for CloudWatch Logs

### Correlation ID missing

1. Ensure `requestCorrelation` middleware is loaded before `requestLogger`
2. Check that `X-Request-ID` header is being set
3. Verify middleware order in `app.ts`

### Too many logs

1. Increase log level to `warn` or `error` in production
2. Reduce debug logging in services
3. Use log sampling for high-traffic endpoints

## Summary

With correlation ID logging, you can now:

- ✅ Track complete request lifecycle from start to end
- ✅ Search all logs for a specific request using correlation ID
- ✅ Aggregate logs by level (error, warn, info, debug)
- ✅ Integrate with Python agents for error analysis
- ✅ Debug production issues efficiently
- ✅ Monitor application health in CloudWatch
