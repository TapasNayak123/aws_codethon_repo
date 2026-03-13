# Interactive Logs Widget Guide

## Overview

Your CloudWatch dashboard now includes an **Interactive Logs Widget** that allows you to filter and search logs directly from the dashboard with a custom time range selector.

---

## Quick Start

### Step 1: Update Your Dashboard

Run the update script:

```powershell
cd k8s
.\update-dashboard.ps1
```

**Expected output**:
```
✅ Dashboard updated successfully!
```

---

### Step 2: Open the Dashboard

**Dashboard URL**:
```
https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=AuthAPI-Production-Dashboard
```

---

### Step 3: Find the Interactive Logs Widget

Scroll down to find the widget titled:
```
🔍 Interactive Logs - Type your filters here (Edit query to customize)
```

This widget is located right after the "Recent Activity" widget.

---

## How to Use Interactive Filtering

### Method 1: Edit Query Directly in Dashboard (Quick)

1. **Click the widget title** or the three dots (⋮) in the top-right corner of the widget
2. **Select "Edit"** from the dropdown menu
3. **Modify the query** in the text box that appears
4. **Click "Update widget"** to apply your filter
5. The widget will refresh with filtered results

**Example**: Add this line to filter by correlation ID:
```
| filter correlationId = "tapas123456"
```

---

### Method 2: View in Logs Insights (Advanced)

1. **Click the widget title** or the three dots (⋮)
2. **Select "View in Logs Insights"**
3. You'll be taken to CloudWatch Logs Insights with the query pre-loaded
4. **Edit the query** with more complex filters
5. **Click "Run query"** to see results
6. **Optionally**: Click "Add to dashboard" to save your custom query as a new widget

---

## Time Range Selection

### Dashboard-Level Time Range

**Location**: Top-right corner of the dashboard

**Options**:
- Last 1 hour
- Last 3 hours
- Last 12 hours
- Last 1 day
- Last 3 days
- Last 1 week
- Custom (select specific start and end times)

**Effect**: Changes time range for ALL widgets on the dashboard

---

### Widget-Level Time Range (Logs Insights)

When you click "View in Logs Insights":

**Location**: Top-right corner of Logs Insights page

**Options**:
- Last 5 minutes
- Last 15 minutes
- Last 30 minutes
- Last 1 hour
- Last 3 hours
- Last 12 hours
- Last 1 day
- Last 3 days
- Last 1 week
- Custom

**Effect**: Only affects the current query view

---

## Common Filter Examples

### 1. Filter by Correlation ID

**Use case**: Track a specific user request

**Query**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, level, correlationId, method, path, statusCode, duration, message, errorCode, ip
| filter correlationId = "tapas123456"
| sort @timestamp asc
| limit 100
```

**Result**: All logs for that specific request in chronological order

---

### 2. Filter by Endpoint

**Use case**: See all requests to `/api/products`

**Query**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, correlationId, method, path, statusCode, duration
| filter path = "/api/products"
| sort @timestamp desc
| limit 100
```

**Result**: Last 100 requests to products endpoint

---

### 3. Filter by Status Code

**Use case**: Find all 401 (unauthorized) errors

**Query**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, correlationId, path, statusCode, message, errorCode
| filter statusCode = 401
| sort @timestamp desc
| limit 100
```

**Result**: Last 100 unauthorized requests

---

### 4. Filter by Time Range

**Use case**: Find all requests in last 30 minutes

**Query**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, correlationId, method, path, statusCode, duration
| filter @timestamp >= ago(30m)
| sort @timestamp desc
| limit 100
```

**Result**: All requests in last 30 minutes

---

### 5. Filter by Multiple Conditions

**Use case**: Find slow POST requests to products API

**Query**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, correlationId, method, path, duration, statusCode
| filter method = "POST"
| filter path = "/api/products"
| filter duration > 200
| sort @timestamp desc
| limit 100
```

**Result**: Slow POST requests to products endpoint

---

### 6. Filter by Error Type

**Use case**: Find all authentication errors

**Query**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, correlationId, path, errorCode, message, stack
| filter errorCode = "AUTHENTICATION_ERROR"
| sort @timestamp desc
| limit 50
```

**Result**: Last 50 authentication errors with stack traces

---

### 7. Filter by IP Address

**Use case**: Track requests from specific IP

**Query**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, correlationId, ip, path, statusCode
| filter ip = "192.168.1.100"
| sort @timestamp desc
| limit 100
```

**Result**: Last 100 requests from that IP

---

### 8. Filter Slow Requests

**Use case**: Find requests taking longer than 500ms

**Query**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, correlationId, path, duration, statusCode
| filter message = "Request completed"
| filter duration > 500
| sort duration desc
| limit 50
```

**Result**: 50 slowest requests

---

### 9. Filter by Log Level

**Use case**: Show only error logs

**Query**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, level, correlationId, path, message, errorCode, stack
| filter level = "error"
| sort @timestamp desc
| limit 100
```

**Result**: Last 100 error logs

---

### 10. Filter by HTTP Method

**Use case**: See all POST requests

**Query**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, correlationId, method, path, statusCode, duration
| filter method = "POST"
| sort @timestamp desc
| limit 100
```

**Result**: Last 100 POST requests

---

## Advanced Filtering

### Pattern Matching with `like`

**Find all authentication-related endpoints**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, path, statusCode
| filter path like /auth/
| sort @timestamp desc
| limit 100
```

**Find all error messages containing "token"**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, message, errorCode
| filter message like /token/
| filter level = "error"
| sort @timestamp desc
| limit 100
```

---

### Combining Multiple Filters (AND)

**Find slow POST requests with errors**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, correlationId, method, path, duration, statusCode
| filter method = "POST"
| filter duration > 500
| filter statusCode >= 400
| sort @timestamp desc
| limit 50
```

---

### Combining Multiple Filters (OR)

**Find all 4xx and 5xx errors**:
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, correlationId, path, statusCode, message
| filter statusCode >= 400
| sort @timestamp desc
| limit 100
```

---

## Query Syntax Reference

### Basic Structure

```
SOURCE 'log-group-name'
| fields field1, field2, field3
| filter condition
| sort field desc
| limit number
```

---

### Available Fields

- `@timestamp` - Log timestamp
- `level` - Log level (info, warn, error, debug)
- `correlationId` - Request correlation ID
- `method` - HTTP method (GET, POST, PUT, DELETE)
- `path` - API endpoint path
- `statusCode` - HTTP status code
- `duration` - Request duration in milliseconds
- `message` - Log message
- `errorCode` - Error code (if error)
- `ip` - Client IP address
- `stack` - Error stack trace (if error)

---

### Filter Operators

- `=` : Equals
- `!=` : Not equals
- `>` : Greater than
- `<` : Less than
- `>=` : Greater than or equal
- `<=` : Less than or equal
- `like` : Pattern matching
- `in` : In list

---

### Logical Operators

- `and` : Both conditions true
- `or` : Either condition true
- `not` : Negate condition

---

### Time Functions

- `ago(5m)` : 5 minutes ago
- `ago(1h)` : 1 hour ago
- `ago(24h)` : 24 hours ago
- `ago(7d)` : 7 days ago

---

## Saving Custom Queries

### Save as Dashboard Widget

1. **Edit your query** in Logs Insights
2. **Click "Add to dashboard"** (top right)
3. **Select your dashboard**: `AuthAPI-Production-Dashboard`
4. **Choose widget type**: Table or Time series
5. **Click "Add to dashboard"**

Your custom query is now a permanent widget on the dashboard!

---

### Save as Saved Query

1. **Edit your query** in Logs Insights
2. **Click "Save"** (top right)
3. **Enter a name**: e.g., "Track Correlation ID"
4. **Click "Save"**

To load later:
1. **Click "Queries"** tab (top)
2. **Select your saved query**
3. **Click "Apply"**

---

## Real-Time Monitoring

### Auto-Refresh

1. **Open Logs Insights** from the widget
2. **Click the refresh icon** (top right)
3. **Select auto-refresh interval**:
   - 10 seconds
   - 30 seconds
   - 1 minute
   - 5 minutes

The query will automatically re-run at the selected interval.

---

## Exporting Results

### Export to CSV

1. **Run your query**
2. **Click "Export results"** (top right)
3. **Select "Download table (CSV)"**
4. **Open in Excel or Google Sheets**

---

### Copy to Clipboard

1. **Run your query**
2. **Click "Export results"**
3. **Select "Copy table"**
4. **Paste into document**

---

## Performance Tips

### 1. Use Specific Filters Early

**Good** (fast):
```
SOURCE '/aws/eks/auth-api'
| filter correlationId = "tapas123456"
| fields @timestamp, message
| limit 100
```

**Bad** (slow):
```
SOURCE '/aws/eks/auth-api'
| fields @timestamp, message
| filter correlationId = "tapas123456"
| limit 100
```

---

### 2. Always Use `limit`

Limit results to avoid scanning too much data:
```
| limit 100
```

---

### 3. Use Shorter Time Ranges

- **Fast**: Last 1 hour
- **Medium**: Last 12 hours
- **Slow**: Last 7 days

---

### 4. Filter by Indexed Fields First

These fields are indexed and filter faster:
- `@timestamp`
- `level`
- `correlationId`

---

## Troubleshooting

### No Results Showing

**Possible causes**:
1. Time range too narrow
2. Filter too restrictive
3. No matching logs

**Solution**:
1. Expand time range to "Last 1 hour"
2. Remove some filters
3. Check log group name is correct

---

### Query Timeout

**Possible causes**:
1. Time range too large
2. No filters (scanning all data)
3. Complex aggregation

**Solution**:
1. Reduce time range
2. Add specific filters
3. Add `limit` clause

---

### Syntax Error

**Common mistakes**:
- Missing quotes around strings
- Wrong field names
- Missing pipe `|` between commands

**Solution**:
- Check query syntax
- Use autocomplete (Ctrl + Space)
- Copy from examples above

---

## Cost Optimization

### CloudWatch Logs Insights Pricing

- **First 5 GB scanned**: FREE per month
- **Additional data**: $0.005 per GB scanned

### Your Current Usage

With ~$0.40/month total CloudWatch costs, you're well within the free tier.

### Tips to Stay in Free Tier

1. **Use shorter time ranges** (Last 1 hour vs Last 7 days)
2. **Add specific filters** (reduces data scanned)
3. **Use `limit`** clause (stops scanning early)
4. **Save common queries** (reuse instead of recreating)

---

## Quick Reference Card

**Most Used Filters**:
```
| filter correlationId = "value"          # Track specific request
| filter path = "/api/endpoint"           # Specific endpoint
| filter statusCode >= 400                # All errors
| filter duration > 500                   # Slow requests
| filter level = "error"                  # Error logs only
| filter @timestamp >= ago(1h)            # Last hour
```

**Most Used Commands**:
```
| fields field1, field2                   # Select fields
| sort @timestamp desc                    # Sort by time
| limit 100                               # Limit results
| stats count() by field                  # Count by field
```

---

## Next Steps

1. ✅ Run `.\update-dashboard.ps1` to update your dashboard
2. ✅ Open the dashboard URL
3. ✅ Scroll to "🔍 Interactive Logs" widget
4. ✅ Click the widget to edit query
5. ✅ Try the example filters above
6. ✅ Save your favorite queries
7. ✅ Set up auto-refresh for monitoring

---

**Your dashboard now has powerful interactive filtering! Start exploring!** 🔍

