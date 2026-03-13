# Quick Start: Testing & Deployment

**Complete guide from local testing to AWS deployment**

---

## 🎯 Overview

**Phase 1**: Test locally (15 minutes)  
**Phase 2**: Set up AWS (30-60 minutes)  
**Phase 3**: Deploy to AWS (10 minutes)  

**Total Time**: ~1-2 hours

---

## 📍 Phase 1: Local Testing (15 minutes)

### Step 1: Install & Configure
```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your AWS credentials
```

### Step 2: Create DynamoDB Tables
```bash
npm run create-tables
```

### Step 3: Run Tests
```bash
npm test
# Expected: All 70 tests pass ✅
```

### Step 4: Start Server
```bash
npm run dev
# Server should start on port 3000
```

### Step 5: Test Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","dateOfBirth":"1990-01-01","email":"test@example.com","password":"Test1234"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

✅ **Success**: All endpoints respond correctly

**Detailed guide**: `LOCAL-TESTING-GUIDE.md`

---

## 📍 Phase 2: AWS Setup (30-60 minutes)

### What You Need from AWS

1. **AWS Account** (with billing enabled)
2. **IAM User** (with EKS, ECR, DynamoDB permissions)
3. **Tools Installed**: AWS CLI, kubectl, eksctl, Helm

### Quick Setup Commands

**Install Tools** (Windows with Chocolatey):
```powershell
choco install awscli kubernetes-cli eksctl kubernetes-helm
```

**Configure AWS CLI**:
```bash
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Format (json)
```

**Create EKS Cluster** (15-20 minutes):
```bash
eksctl create cluster \
  --name auth-api-cluster \
  --region us-east-1 \
  --nodegroup-name auth-api-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --managed
```

**Create ECR Repository**:
```bash
aws ecr create-repository --repository-name auth-api --region us-east-1
```

**Create DynamoDB Tables**:
```bash
aws dynamodb create-table --table-name prod-Users ...
aws dynamodb create-table --table-name prod-Products ...
```

✅ **Success**: All AWS resources created

**Detailed guide**: `AWS-EKS-SETUP-REQUIREMENTS.md`

---

## 📍 Phase 3: Deploy to AWS (10 minutes)

### Step 1: Fix .gitignore & Commit
```bash
git add .gitignore package-lock.json
git commit -m "fix: correct .gitignore for production"
git push origin development
```

### Step 2: Configure GitHub Secrets
Go to: `Repository → Settings → Secrets → Actions`

Add 5 secrets:
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- JWT_SECRET
- DYNAMODB_USERS_TABLE (prod-Users)
- DYNAMODB_PRODUCTS_TABLE (prod-Products)

### Step 3: Trigger Deployment
```bash
git push origin development
```

### Step 4: Monitor Pipeline
```
GitHub → Actions tab → Watch workflow
```

### Step 5: Verify Deployment
```bash
kubectl get pods -l app=auth-api
kubectl get service auth-api-service
```

✅ **Success**: Application running in AWS!

**Detailed guide**: `DEPLOYMENT-CHECKLIST.md`

---

## 📊 Cost Estimate

**Monthly AWS Costs**:
- EKS Cluster: $73/month
- EC2 Nodes (2 × t3.medium): $60/month
- Load Balancer: $20/month
- DynamoDB: $5/month
- **Total**: ~$150-200/month

**Cost Saving**:
- Use t3.small: Save $30/month
- Delete when not in use: Save 100%

---

## 📚 Documentation Reference

**Testing**:
- `LOCAL-TESTING-GUIDE.md` - Complete local testing guide

**AWS Setup**:
- `AWS-EKS-SETUP-REQUIREMENTS.md` - Everything you need from AWS

**Deployment**:
- `IMMEDIATE-ACTION-ITEMS.md` - 4 critical tasks before deployment
- `DEPLOYMENT-CHECKLIST.md` - Complete deployment checklist
- `CICD-SETUP-GUIDE.md` - CI/CD pipeline setup

**Quick Reference**:
- `CICD-QUICK-REFERENCE.md` - Quick commands
- `PRODUCTION-READY-SUMMARY.md` - Production readiness summary

---

## ✅ Success Checklist

- [ ] Local tests pass (70/70)
- [ ] Local server runs without errors
- [ ] AWS account created
- [ ] IAM user created with permissions
- [ ] Tools installed (AWS CLI, kubectl, eksctl, Helm)
- [ ] EKS cluster created
- [ ] ECR repository created
- [ ] DynamoDB tables created
- [ ] GitHub secrets configured
- [ ] Code pushed to development branch
- [ ] Pipeline completes successfully
- [ ] Pods running in EKS
- [ ] API endpoints responding

---

**Start with Phase 1 (Local Testing) and work through sequentially!**
