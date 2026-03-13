# FOLLOW THIS - Complete Guide

**Everything you need in one file. Ignore all other .md files.**

---

## 🎯 What You Have

- ✅ Node.js API with authentication (JWT)
- ✅ 70 passing tests
- ✅ Automated CI/CD pipeline
- ✅ Production ready (95/100 score)

**2 critical fixes applied**: `.gitignore` corrected for .md files and package-lock.json

---

## 📍 STEP 1: Test Locally (15 minutes)

### 1.1 Install
```bash
npm install
```

### 1.2 Configure
```bash
cp .env.example .env
```

Edit `.env` - add your AWS credentials:
```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
DYNAMODB_USERS_TABLE=dev-Users
DYNAMODB_PRODUCTS_TABLE=dev-Products
JWT_SECRET=any-test-secret-key
```

### 1.3 Create Tables
```bash
npm run create-tables
```

### 1.4 Test
```bash
npm test
# Expected: All 70 tests pass ✅
```

### 1.5 Run Server
```bash
npm run dev
# Server starts on port 3000
```

### 1.6 Test Endpoints
```bash
# Health
curl http://localhost:3000/api/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","dateOfBirth":"1990-01-01","email":"test@example.com","password":"Test1234"}'

# Login (save the token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

✅ **Done**: Local testing complete

---

## 📍 STEP 2: AWS Setup (30-60 minutes)

### 2.1 Install Tools (Windows)

**IMPORTANT**: You need to install these tools BEFORE creating the EKS cluster.

**Step-by-Step Installation**:

**1. AWS CLI** (✅ You already have this)
```powershell
aws --version
# Should show: aws-cli/2.x.x
```

**2. kubectl** (Kubernetes command-line tool)
```powershell
# Download
curl.exe -LO "https://dl.k8s.io/release/v1.28.0/bin/windows/amd64/kubectl.exe"

# Move to System32 (requires Admin PowerShell)
Move-Item -Path .\kubectl.exe -Destination C:\Windows\System32\kubectl.exe -Force

# Verify
kubectl version --client
```

**3. eksctl** (EKS cluster management tool)
```powershell
# Download
curl.exe -LO "https://github.com/eksctl-io/eksctl/releases/latest/download/eksctl_windows_amd64.zip"

# Extract (creates eksctl.exe)
Expand-Archive -Path .\eksctl_windows_amd64.zip -DestinationPath . -Force

# Move to System32 (requires Admin PowerShell)
Move-Item -Path .\eksctl.exe -Destination C:\Windows\System32\eksctl.exe -Force

# Verify
eksctl version
```

**4. Helm** (Kubernetes package manager)
```powershell
# Download
curl.exe -LO "https://get.helm.sh/helm-v3.13.0-windows-amd64.zip"

# Extract
Expand-Archive -Path .\helm-v3.13.0-windows-amd64.zip -DestinationPath . -Force

# Move to System32 (requires Admin PowerShell)
Move-Item -Path .\windows-amd64\helm.exe -Destination C:\Windows\System32\helm.exe -Force

# Verify
helm version
```

**Verification Checklist**:
```powershell
aws --version      # ✅ Should work
kubectl version --client  # ✅ Should work
eksctl version     # ✅ Should work
helm version       # ✅ Should work
```

**If you get "Move-Item: Access denied"**:
- Close PowerShell
- Right-click PowerShell → "Run as Administrator"
- Run the Move-Item commands again

### 2.2 Configure AWS
```bash
aws configure
# Enter: Access Key, Secret Key, Region (us-east-1), Format (json)
```

### 2.3 Create EKS Cluster (15-20 min wait)
```bash
eksctl create cluster \
  --name auth-api-cluster \
  --region us-east-1 \
  --nodegroup-name auth-api-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --managed
```

### 2.4 Create ECR
```bash
aws ecr create-repository --repository-name auth-api --region us-east-1
```

### 2.5 Create DynamoDB Tables
```bash
# Users
aws dynamodb create-table \
  --table-name prod-Users \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=email,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1

# Products
aws dynamodb create-table \
  --table-name prod-Products \
  --attribute-definitions AttributeName=productId,AttributeType=S \
  --key-schema AttributeName=productId,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

### 2.6 Verify
```bash
kubectl get nodes
# Should show 2 nodes
```

✅ **Done**: AWS setup complete

---

## 📍 STEP 3: Deploy (10 minutes)

### 3.1 Commit Fixes
```bash
git add .gitignore package-lock.json
git commit -m "fix: correct .gitignore"
git push origin development
```

### 3.2 Configure GitHub Secrets

Go to: **GitHub → Settings → Secrets and variables → Actions**

Add these 5 secrets:

| Name | Value |
|------|-------|
| AWS_ACCESS_KEY_ID | Your AWS access key |
| AWS_SECRET_ACCESS_KEY | Your AWS secret key |
| JWT_SECRET | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| DYNAMODB_USERS_TABLE | `prod-Users` |
| DYNAMODB_PRODUCTS_TABLE | `prod-Products` |

### 3.3 Deploy
```bash
git push origin development
```

### 3.4 Watch Pipeline
Go to: **GitHub → Actions tab**

Wait for 6 stages to complete (~10-15 min):
1. Security ✅
2. Testing ✅
3. Build ✅
4. Deploy ✅
5. Validate ✅
6. (Rollback only if failure)

### 3.5 Verify
```bash
kubectl get pods -l app=auth-api
# Should show 3 running pods

kubectl get service auth-api-service
# Should show EXTERNAL-IP (Load Balancer URL)
```

### 3.6 Test Deployed API
```bash
# Get URL
export URL=$(kubectl get service auth-api-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

# Test
curl http://$URL/api/health
```

✅ **Done**: Deployed to AWS!

---

## 💰 Cost

**Monthly**: ~$150-200
- EKS: $73
- EC2 nodes: $60
- Load Balancer: $20
- DynamoDB: $5

**To save money**: Delete cluster when not using
```bash
eksctl delete cluster --name auth-api-cluster --region us-east-1
```

---

## 🚨 Troubleshooting

### Local Issues

**"Missing environment variables"**
→ Check `.env` has all required variables

**"Cannot connect to DynamoDB"**
→ Check AWS credentials: `aws sts get-caller-identity`

**"Port 3000 in use"**
→ Kill process: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`

### AWS Issues

**"eksctl command not found"**
→ Install: `choco install eksctl`

**"Cluster creation fails"**
→ Check AWS credentials and permissions

**"Pipeline fails"**
→ Check GitHub Actions logs for specific error

### Deployment Issues

**"Pods not starting"**
→ Check logs: `kubectl logs <pod-name>`

**"Service has no EXTERNAL-IP"**
→ Wait 2-3 minutes for Load Balancer provisioning

---

## 📚 Other Documentation

All other .md files are detailed reference docs. You don't need them unless you want more details:

- `README.md` - Project overview
- `PRODUCTION-READY-SUMMARY.md` - Audit results
- `K8S-DEPLOYMENT-GUIDE.md` - Detailed Kubernetes guide
- `CICD-SETUP-GUIDE.md` - Detailed CI/CD guide

**Ignore the rest** - they're redundant.

---

## ✅ Success Checklist

- [ ] Local tests pass (70/70)
- [ ] Local server runs
- [ ] AWS CLI configured
- [ ] EKS cluster created (2 nodes)
- [ ] ECR repository created
- [ ] DynamoDB tables created
- [ ] GitHub secrets configured
- [ ] .gitignore fixes committed
- [ ] Pipeline completes successfully
- [ ] 3 pods running in EKS
- [ ] Service has external IP
- [ ] API responds to health check

---

**That's everything. Follow steps 1-2-3 sequentially!**
