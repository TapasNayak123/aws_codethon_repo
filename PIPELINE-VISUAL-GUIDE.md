# CI/CD Pipeline - Visual Guide

## 🎯 Complete Flow Diagram

```
Developer                GitHub Actions              AWS EKS
    |                           |                        |
    |  1. Push code             |                        |
    |-------------------------->|                        |
    |                           |                        |
    |                    2. Security Scan               |
    |                           |                        |
    |                    3. Run Tests                   |
    |                           |                        |
    |                    4. Build Docker                |
    |                           |                        |
    |                    5. Push to ECR                 |
    |                           |----------------------->|
    |                           |                        |
    |                    6. Deploy with Helm            |
    |                           |----------------------->|
    |                           |                        |
    |                    7. Validate                    |
    |                           |<-----------------------|
    |                           |                        |
    |  8. Deployment Success    |                        |
    |<--------------------------|                        |
    |                           |                        |
```

## 📊 Stage Details

### Stage 1: Security (2-3 min)
```
Input:  Source code
Tools:  Trivy, npm audit, TruffleHog, OWASP
Output: Security report
```

### Stage 2: Testing (1-2 min)
```
Input:  Source code
Tools:  Vitest, ESLint
Output: Test results, coverage report
```

### Stage 3: Build (3-5 min)
```
Input:  Source code, Dockerfile
Tools:  Docker, Trivy
Output: Docker image in ECR
```

### Stage 4: Deploy (2-3 min)
```
Input:  Docker image, Helm chart
Tools:  kubectl, Helm
Output: Running pods in EKS
```

### Stage 5: Validate (1-2 min)
```
Input:  Deployed application
Tools:  kubectl, curl
Output: Health check results
```

### Stage 6: Rollback (if failure)
```
Input:  Previous Helm release
Tools:  Helm rollback
Output: Restored previous version
```

## 🔄 Continuous Deployment Flow

```
Code Change → Push → Pipeline → Deploy → Monitor
     ↑                                      |
     |                                      |
     +---------- Fix Issues ←---------------+
```

## 📁 Key Files

```
.github/workflows/
  └── deploy-to-eks.yml          # Pipeline definition

k8s/helm/auth-api/
  ├── Chart.yaml                 # Helm chart metadata
  ├── values.yaml                # Configuration values
  └── templates/                 # Kubernetes manifests
      ├── deployment.yaml
      ├── service.yaml
      ├── hpa.yaml
      └── ...

Documentation/
  ├── CICD-PIPELINE-SUMMARY.md   # Complete overview
  ├── CICD-SETUP-GUIDE.md        # Setup instructions
  ├── CICD-QUICK-REFERENCE.md    # Quick commands
  └── DEPLOYMENT-CHECKLIST.md    # Pre-deployment checklist
```

## 🎬 Quick Start

1. Configure GitHub secrets
2. Push to development branch
3. Watch pipeline in Actions tab
4. Verify deployment with kubectl
5. Test API endpoints

See `DEPLOYMENT-CHECKLIST.md` for detailed steps.
