# CI/CD Pipeline Setup Guide

## Overview

This guide explains how to set up the GitHub Actions CI/CD pipeline for automated deployment to AWS EKS.

## Pipeline Architecture

```
+------------------------------------------------------------------+
|                      GitHub Actions Pipeline                     |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------------------------------------------------+  |
|  |  STAGE 1: SECURITY SCANNING                                |  |
|  |  - Trivy filesystem scan                                   |  |
|  |  - npm audit                                               |  |
|  |  - Secret detection (TruffleHog)                           |  |
|  |  - OWASP Dependency Check                                  |  |
|  +------------------------------------------------------------+  |
|                              |                                   |
|                              v                                   |
|  +------------------------------------------------------------+  |
|  |  STAGE 2: TESTING                                          |  |
|  |  - Linting                                                 |  |
|  |  - Unit tests                                              |  |
|  |  - Code coverage                                           |  |
|  |  - Upload to Codecov                                       |  |
|  +------------------------------------------------------------+  |
|                              |                                   |
|                              v                                   |
|  +------------------------------------------------------------+  |
|  |  STAGE 3: BUILD & PUSH                                     |  |
|  |  - Build Docker image                                      |  |
|  |  - Scan image with Trivy                                   |  |
|  |  - Push to Amazon ECR                                      |  |
|  |  - Tag with commit SHA                                     |  |
|  +------------------------------------------------------------+  |
|                              |                                   |
|                              v                                   |
|  +------------------------------------------------------------+  |
|  |  STAGE 4: DEPLOY TO EKS                                    |  |
|  |  - Update kubeconfig                                       |  |
|  |  - Create/update secrets                                   |  |
|  |  - Deploy with Helm                                        |  |
|  |  - Run smoke tests                                         |  |
|  +------------------------------------------------------------+  |
|                              |                                   |
|                              v                                   |
|  +------------------------------------------------------------+  |
|  |  STAGE 5: POST-DEPLOYMENT VALIDATION                       |  |
|  |  - Check pod health                                        |  |
|  |  - Verify HPA status                                       |  |
|  |  - Run integration tests                                   |  |
|  |  - Generate deployment report                              |  |
|  +------------------------------------------------------------+  |
|                              |                                   |
|                              v                                   |
|  +------------------------------------------------------------+  |
|  |  STAGE 6: ROLLBACK ON FAILURE (if needed)                 |  |
|  |  - Automatic rollback                                      |  |
|  |  - Verify rollback                                         |  |
|  |  - Notify team                                             |  |
|  +------------------------------------------------------------+  |
|                                                                  |
+------------------------------------------------------------------+
```

---

## Prerequisites

### 1. AWS Resources

Ensure you have:
- ✅ AWS Account with appropriate permissions
- ✅ EKS Cluster created (see `K8S-DEPLOYMENT-GUIDE.md`)
- ✅ ECR Repository created
- ✅ DynamoDB tables created
- ✅ IAM user with programmatic access

### 2. GitHub Repository

- ✅ Repository with `development` branch
- ✅ Admin access to configure secrets

---

## Step 1: Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

### Required Secrets

Click "New repository secret" and add the following:

#### AWS Credentials
```
Name: AWS_ACCESS_KEY_ID
Value: AKIA****************
```

```
Name: AWS_SECRET_ACCESS_KEY
Value: ********************************
```

#### Application Secrets
```
Name: JWT_SECRET
Value: your-super-secret-jwt-key-change-this-in-production
```

#### DynamoDB Tables
```
Name: DYNAMODB_USERS_TABLE
Value: prod-Users
```

```
Name: DYNAMODB_PRODUCTS_TABLE
Value: prod-Products
```

### Optional Secrets

```
Name: CODECOV_TOKEN
Value: <your-codecov-token>
```

---

## Step 2: Verify Pipeline Configuration

The pipeline file is located at: `.github/workflows/deploy-to-eks.yml`

### Pipeline Triggers

The pipeline runs on:
- **Push to `development` branch**: Full deployment
- **Pull request to `development` branch**: Build and test only (no deployment)

### Environment Variables

Update these in the workflow file if needed:

```yaml
env:
  AWS_REGION: us-east-1                    # Your AWS region
  ECR_REPOSITORY: auth-api                 # Your ECR repository name
  EKS_CLUSTER_NAME: auth-api-cluster       # Your EKS cluster name
  HELM_RELEASE_NAME: auth-api              # Your Helm release name
  NODE_VERSION: '22.x'                     # Node.js version
```

---

## Step 3: Configure GitHub Environments (Optional but Recommended)

### Create Development Environment

1. Go to Settings → Environments
2. Click "New environment"
3. Name: `development`
4. Add protection rules:
   - ✅ Required reviewers (optional)
   - ✅ Wait timer (optional)
   - ✅ Deployment branches: `development`

### Benefits
- Deployment approval workflow
- Environment-specific secrets
- Deployment history tracking
- Environment URL tracking

---

## Step 4: Test the Pipeline

### Option 1: Push to Development Branch

```bash
# Make a change
echo "# Test change" >> README.md

# Commit and push
git add .
git commit -m "test: trigger CI/CD pipeline"
git push origin development
```

### Option 2: Create Pull Request

```bash
# Create feature branch
git checkout -b feature/test-cicd

# Make changes
echo "# Test PR" >> README.md

# Commit and push
git add .
git commit -m "test: PR pipeline"
git push origin feature/test-cicd

# Create PR to development branch on GitHub
```

---

## Step 5: Monitor Pipeline Execution

### View Pipeline Status

1. Go to your GitHub repository
2. Click "Actions" tab
3. Click on the running workflow
4. View each stage's progress and logs

### Pipeline Stages

Each stage will show:
- ✅ Green checkmark: Success
- ❌ Red X: Failure
- 🟡 Yellow circle: In progress
- ⚪ Gray circle: Pending

### View Logs

Click on any stage to see detailed logs:
- Security scan results
- Test output
- Build logs
- Deployment status
- Validation results

---

## Step 6: Verify Deployment

### Check Deployment Status

```bash
# Configure kubectl
aws eks update-kubeconfig --name auth-api-cluster --region us-east-1

# Check pods
kubectl get pods -l app=auth-api

# Check service
kubectl get service auth-api-service

# View logs
kubectl logs -l app=auth-api --tail=100
```

### Get Service URL

```bash
# Get Load Balancer URL
kubectl get service auth-api-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
```

### Test Deployed API

```bash
# Set service URL
export SERVICE_URL=$(kubectl get service auth-api-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Test health endpoint
curl http://${SERVICE_URL}/api/health

# Test registration
curl -X POST http://${SERVICE_URL}/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "dateOfBirth": "1990-01-01",
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

---

## Pipeline Features

### 1. Security Scanning

**Trivy Filesystem Scan**
- Scans code for vulnerabilities
- Checks dependencies
- Reports CRITICAL and HIGH severity issues

**npm Audit**
- Checks npm packages for known vulnerabilities
- Generates audit report

**Secret Detection (TruffleHog)**
- Scans for accidentally committed secrets
- Prevents credential leaks

**OWASP Dependency Check**
- Comprehensive dependency vulnerability scanning
- Fails on CVSS score ≥ 7

### 2. Testing

**Linting**
- Code quality checks
- Style enforcement

**Unit Tests**
- Runs all unit tests
- Generates coverage report

**Code Coverage**
- Uploads to Codecov
- Tracks coverage trends

### 3. Build & Push

**Docker Build**
- Multi-stage build
- Layer caching for speed
- Production optimized

**Image Scanning**
- Trivy scans Docker image
- Detects vulnerabilities in final image

**ECR Push**
- Tags with commit SHA
- Tags with branch name
- Tags with `latest` (for main branch)

### 4. Deployment

**Helm Deployment**
- Atomic deployment (rollback on failure)
- 5-minute timeout
- Waits for rollout completion

**Smoke Tests**
- Health endpoint check
- Basic API validation

### 5. Validation

**Pod Health Check**
- Verifies all pods are running
- Checks pod status

**Integration Tests**
- Tests registration endpoint
- Validates API functionality

**Deployment Report**
- Generates detailed report
- Includes pod and service status

### 6. Automatic Rollback

**Triggers on Failure**
- Deployment failure
- Validation failure

**Rollback Process**
- Helm rollback to previous version
- Verifies rollback success
- Notifies team

---

## Customization

### Add More Tests

Edit `.github/workflows/deploy-to-eks.yml`:

```yaml
- name: Run integration tests
  run: npm run test:integration

- name: Run E2E tests
  run: npm run test:e2e
```

### Add Slack Notifications

Add to the end of each job:

```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  if: always()
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### Add Performance Tests

```yaml
- name: Run performance tests
  run: |
    npm install -g artillery
    artillery run performance-tests.yml
```

### Deploy to Multiple Environments

Create separate workflow files:
- `.github/workflows/deploy-staging.yml`
- `.github/workflows/deploy-production.yml`

---

## Troubleshooting

### Pipeline Fails at Security Stage

**Issue**: Vulnerabilities found

**Solution**:
```bash
# Update dependencies
npm audit fix

# Check for high severity issues
npm audit --audit-level=high
```

### Pipeline Fails at Test Stage

**Issue**: Tests failing

**Solution**:
```bash
# Run tests locally
npm test

# Check specific test
npm test -- <test-file>
```

### Pipeline Fails at Build Stage

**Issue**: Docker build fails

**Solution**:
```bash
# Test build locally
docker build -t auth-api:test .

# Check Dockerfile syntax
docker build --no-cache -t auth-api:test .
```

### Pipeline Fails at Deploy Stage

**Issue**: Helm deployment fails

**Solution**:
```bash
# Check cluster access
kubectl get nodes

# Check Helm release
helm list

# View deployment logs
kubectl describe deployment auth-api
```

### Rollback Triggered

**Issue**: Automatic rollback occurred

**Solution**:
1. Check deployment logs in GitHub Actions
2. Review pod logs: `kubectl logs -l app=auth-api`
3. Check events: `kubectl get events --sort-by='.lastTimestamp'`
4. Fix issues and redeploy

---

## Best Practices

### 1. Branch Protection

Enable branch protection for `development`:
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date

### 2. Secrets Management

- Rotate secrets regularly
- Use AWS Secrets Manager for production
- Never commit secrets to code

### 3. Testing

- Maintain high test coverage (>80%)
- Write integration tests
- Test locally before pushing

### 4. Monitoring

- Set up CloudWatch alarms
- Monitor deployment metrics
- Track error rates

### 5. Rollback Strategy

- Always test rollback procedure
- Keep previous versions available
- Document rollback steps

---

## Pipeline Metrics

### Typical Execution Times

- Security Scanning: 2-3 minutes
- Testing: 1-2 minutes
- Build & Push: 3-5 minutes
- Deployment: 2-3 minutes
- Validation: 1-2 minutes

**Total**: ~10-15 minutes

### Success Criteria

- ✅ All security scans pass
- ✅ All tests pass (70/70)
- ✅ Docker image builds successfully
- ✅ Deployment completes without errors
- ✅ All pods are healthy
- ✅ Smoke tests pass

---

## Cost Optimization

### GitHub Actions Minutes

- Free tier: 2,000 minutes/month
- Each deployment: ~15 minutes
- ~130 deployments/month on free tier

### Reduce Pipeline Time

1. **Cache dependencies**:
   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.npm
       key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
   ```

2. **Parallel jobs**: Already implemented

3. **Skip stages for PRs**: Already configured

---

## Next Steps

1. ✅ Configure GitHub secrets
2. ✅ Test pipeline with a commit
3. ✅ Set up monitoring
4. ✅ Configure alerts
5. ✅ Document deployment process
6. ✅ Train team on pipeline usage

---

## Support

For issues:
1. Check GitHub Actions logs
2. Review this guide
3. Check AWS CloudWatch logs
4. Review Kubernetes events

---

**Pipeline is ready!** Push to `development` branch to trigger your first deployment.
