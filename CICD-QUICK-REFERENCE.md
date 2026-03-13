# CI/CD Pipeline - Quick Reference Card

## Pipeline Overview

**Trigger**: Push or PR to `development` branch  
**Duration**: ~10-15 minutes  
**Stages**: 6 (Security → Test → Build → Deploy → Validate → Rollback)

---

## Required GitHub Secrets

```
AWS_ACCESS_KEY_ID              # AWS credentials
AWS_SECRET_ACCESS_KEY          # AWS credentials
JWT_SECRET                     # Application secret
DYNAMODB_USERS_TABLE           # prod-Users
DYNAMODB_PRODUCTS_TABLE        # prod-Products
```

**Setup**: Repository → Settings → Secrets and variables → Actions

---

## Pipeline Stages

### 1. Security (2-3 min)
- ✅ Trivy filesystem scan
- ✅ npm audit
- ✅ Secret detection
- ✅ OWASP dependency check

### 2. Testing (1-2 min)
- ✅ Linting
- ✅ Unit tests (70 tests)
- ✅ Code coverage
- ✅ Upload to Codecov

### 3. Build & Push (3-5 min)
- ✅ Build Docker image
- ✅ Scan image with Trivy
- ✅ Push to ECR
- ✅ Tag with commit SHA

### 4. Deploy (2-3 min)
- ✅ Update kubeconfig
- ✅ Create/update secrets
- ✅ Deploy with Helm
- ✅ Run smoke tests

### 5. Validate (1-2 min)
- ✅ Check pod health
- ✅ Verify HPA
- ✅ Run integration tests
- ✅ Generate report

### 6. Rollback (if failure)
- ✅ Automatic rollback
- ✅ Verify rollback
- ✅ Notify team

---

## Quick Commands

### Trigger Pipeline
```bash
git add .
git commit -m "feat: your changes"
git push origin development
```

### View Pipeline Status
```
GitHub → Actions tab → Latest workflow
```

### Check Deployment
```bash
# Configure kubectl
aws eks update-kubeconfig --name auth-api-cluster --region us-east-1

# Check pods
kubectl get pods -l app=auth-api

# View logs
kubectl logs -l app=auth-api --tail=100 -f

# Get service URL
kubectl get service auth-api-service
```

### Manual Rollback
```bash
helm rollback auth-api
```

---

## Troubleshooting

### Pipeline Fails at Security
```bash
npm audit fix
npm audit --audit-level=high
```

### Pipeline Fails at Test
```bash
npm test
npm run test:coverage
```

### Pipeline Fails at Build
```bash
docker build -t auth-api:test .
```

### Pipeline Fails at Deploy
```bash
kubectl get pods -l app=auth-api
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Check Deployment Status
```bash
helm list
helm status auth-api
kubectl get all
```

---

## Image Tags

- `development-<sha>` - Development branch commits
- `<sha>` - Commit SHA
- `latest` - Latest main branch (if configured)

---

## Monitoring

### GitHub Actions
- View logs: Actions → Workflow → Stage
- Download artifacts: Actions → Workflow → Artifacts

### Kubernetes
```bash
# Pod status
kubectl get pods -l app=auth-api

# Service status
kubectl get service auth-api-service

# HPA status
kubectl get hpa

# Events
kubectl get events --sort-by='.lastTimestamp'
```

### Application Logs
```bash
# All pods
kubectl logs -l app=auth-api --tail=100

# Specific pod
kubectl logs <pod-name> -f

# Previous pod (if crashed)
kubectl logs <pod-name> --previous
```

---

## Common Issues

### Issue: Secrets not found
**Fix**: Verify GitHub secrets are configured correctly

### Issue: Image pull error
**Fix**: Check ECR authentication and repository name

### Issue: Pods not starting
**Fix**: Check pod logs and events
```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Issue: Service not accessible
**Fix**: Wait for Load Balancer (2-3 minutes)
```bash
kubectl get service auth-api-service -w
```

### Issue: Tests failing
**Fix**: Run tests locally first
```bash
npm test
```

---

## Success Criteria

- ✅ All security scans pass
- ✅ All 70 tests pass
- ✅ Docker image builds
- ✅ Deployment completes
- ✅ All pods healthy
- ✅ Smoke tests pass
- ✅ Integration tests pass

---

## Pipeline Files

```
.github/workflows/deploy-to-eks.yml    # Main pipeline
CICD-SETUP-GUIDE.md                    # Detailed setup guide
CICD-QUICK-REFERENCE.md                # This file
```

---

## Support Contacts

- **Pipeline Issues**: Check GitHub Actions logs
- **Deployment Issues**: Check kubectl logs
- **Application Issues**: Check CloudWatch logs

---

## Next Steps After First Deployment

1. ✅ Set up monitoring (Prometheus/Grafana)
2. ✅ Configure alerts (CloudWatch Alarms)
3. ✅ Set up logging (CloudWatch/ELK)
4. ✅ Create staging environment
5. ✅ Configure custom domain
6. ✅ Enable HTTPS

---

**Quick Start**: Configure secrets → Push to development → Monitor in Actions tab
