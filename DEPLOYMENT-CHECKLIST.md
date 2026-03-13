# EKS Deployment Troubleshooting Checklist

## Common Issues and Solutions

### 1. Deployment Timeout (Context Deadline Exceeded)

**Symptoms:**
```
Error: release auth-api failed, and has been uninstalled due to atomic being set: context deadline exceeded
```

**Possible Causes:**
- Pods failing to start due to missing secrets
- Image pull errors
- Health check failures
- Insufficient cluster resources

**Debugging Steps:**

```bash
# 1. Check pod status
kubectl get pods -l app=auth-api

# 2. Describe pods to see events
kubectl describe pods -l app=auth-api

# 3. Check pod logs
kubectl logs -l app=auth-api --tail=100

# 4. Check if secrets exist
kubectl get secret auth-api-secrets
kubectl describe secret auth-api-secrets

# 5. Check cluster resources
kubectl top nodes
kubectl describe nodes
```

### 2. Image Pull Errors

**Symptoms:**
- Pods stuck in `ImagePullBackOff` or `ErrImagePull`

**Solution:**
```bash
# Verify ECR login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 551494044780.dkr.ecr.us-east-1.amazonaws.com

# Check if image exists
aws ecr describe-images --repository-name auth-api --region us-east-1

# Verify image tag
aws ecr list-images --repository-name auth-api --region us-east-1
```

### 3. Health Check Failures

**Symptoms:**
- Pods in `CrashLoopBackOff`
- Readiness/Liveness probe failures

**Solution:**
```bash
# Check application logs
kubectl logs -l app=auth-api --tail=200

# Test health endpoint manually
kubectl port-forward deployment/auth-api 3000:3000
curl http://localhost:3000/api/health
```

### 4. Missing Environment Variables

**Symptoms:**
- Application crashes on startup
- Logs show "undefined" or missing config errors

**Solution:**
```bash
# Verify secrets are created
kubectl get secret auth-api-secrets -o yaml

# Check if all required secrets are present
kubectl get secret auth-api-secrets -o jsonpath='{.data}' | jq 'keys'

# Expected keys:
# - JWT_SECRET
# - AWS_ACCESS_KEY_ID
# - AWS_SECRET_ACCESS_KEY
# - AWS_REGION
# - DYNAMODB_USERS_TABLE
# - DYNAMODB_PRODUCTS_TABLE
```

### 5. DynamoDB Connection Issues

**Symptoms:**
- Pods running but health checks failing
- Logs show DynamoDB connection errors

**Solution:**
```bash
# Verify DynamoDB tables exist
aws dynamodb list-tables --region us-east-1

# Check IAM permissions
aws sts get-caller-identity

# Test DynamoDB access from pod
kubectl exec -it deployment/auth-api -- sh
# Inside pod:
# aws dynamodb list-tables --region us-east-1
```

## Manual Deployment Steps (If Pipeline Fails)

If the GitHub Actions pipeline keeps failing, deploy manually:

```bash
# 1. Configure kubectl
aws eks update-kubeconfig --name auth-api-cluster --region us-east-1

# 2. Create secrets manually
kubectl create secret generic auth-api-secrets \
  --from-literal=JWT_SECRET="your-jwt-secret" \
  --from-literal=AWS_ACCESS_KEY_ID="your-access-key" \
  --from-literal=AWS_SECRET_ACCESS_KEY="your-secret-key" \
  --from-literal=AWS_REGION="us-east-1" \
  --from-literal=DYNAMODB_USERS_TABLE="prod-Users" \
  --from-literal=DYNAMODB_PRODUCTS_TABLE="prod-Products"

# 3. Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 551494044780.dkr.ecr.us-east-1.amazonaws.com

# 4. Deploy with Helm (single replica for testing)
helm upgrade --install auth-api ./k8s/helm/auth-api \
  --set image.repository=551494044780.dkr.ecr.us-east-1.amazonaws.com/auth-api \
  --set image.tag=latest \
  --set replicaCount=1 \
  --wait \
  --timeout 10m \
  --debug

# 5. Watch deployment progress
kubectl get pods -l app=auth-api -w

# 6. Check logs in real-time
kubectl logs -f deployment/auth-api
```

## Quick Health Check

```bash
# Get service URL
SERVICE_URL=$(kubectl get service auth-api-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Wait for LoadBalancer to be ready (can take 2-3 minutes)
echo "Waiting for LoadBalancer..."
sleep 120

# Test health endpoint
curl http://${SERVICE_URL}/api/health

# Expected response:
# {"status":"healthy","timestamp":"...","uptime":...}
```

## Rollback if Needed

```bash
# List Helm releases
helm list

# Rollback to previous version
helm rollback auth-api 0

# Or uninstall completely
helm uninstall auth-api
```

## Pipeline Changes Made

1. **Increased timeout**: Changed from 5m to 10m
2. **Reduced initial replicas**: Changed from 3 to 1 for faster deployment
3. **Added debugging**: Added pod status, descriptions, and logs
4. **Added --debug flag**: Helm will show more detailed output

## Next Steps After Successful Deployment

Once deployment succeeds:

1. **Scale up replicas**:
   ```bash
   kubectl scale deployment auth-api --replicas=3
   ```

2. **Enable HPA** (already configured in Helm chart):
   ```bash
   kubectl get hpa
   ```

3. **Monitor pods**:
   ```bash
   kubectl get pods -l app=auth-api -w
   ```

4. **Test the API**:
   ```bash
   SERVICE_URL=$(kubectl get service auth-api-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
   
   # Health check
   curl http://${SERVICE_URL}/api/health
   
   # Register user
   curl -X POST http://${SERVICE_URL}/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "fullName": "Test User",
       "dateOfBirth": "1990-01-01",
       "email": "test@example.com",
       "password": "Test1234"
     }'
   ```
