# Simple Guide - Everything You Need

**Follow these 3 steps. That's it.**

---

## Step 1: Test Locally (15 minutes)

### Install and Configure
```bash
npm install
cp .env.example .env
```

### Edit .env file
Open `.env` and add your AWS credentials:
```env
NODE_ENV=development
PORT=3000
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key_here
AWS_SECRET_ACCESS_KEY=your_secret_here
DYNAMODB_USERS_TABLE=dev-Users
DYNAMODB_PRODUCTS_TABLE=dev-Products
JWT_SECRET=your-test-secret-key
JWT_EXPIRATION=1h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### Create Tables and Test
```bash
npm run create-tables
npm test
npm run dev
```

### Test with curl
```bash
# Health check
curl http://localhost:3000/api/health

# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Test","dateOfBirth":"1990-01-01","email":"test@example.com","password":"Test1234"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

✅ **Success**: All tests pass, server runs, endpoints work

---

## Step 2: Set Up AWS (30-60 minutes)

### Install Tools (Windows)
```powershell
choco install awscli kubernetes-cli eksctl kubernetes-helm
```

### Configure AWS
```bash
aws configure
# Enter your AWS Access Key, Secret Key, Region (us-east-1)
```

### Create EKS Cluster (takes 15-20 minutes)
```bash
eksctl create cluster \
  --name auth-api-cluster \
  --region us-east-1 \
  --nodegroup-name auth-api-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --managed
```

### Create ECR Repository
```bash
aws ecr create-repository --repository-name auth-api --region us-east-1
```

### Create DynamoDB Tables
```bash
# Users table
aws dynamodb create-table \
  --table-name prod-Users \
  --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=email,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1

# Products table
aws dynamodb create-table \
  --table-name prod-Products \
  --attribute-definitions AttributeName=productId,AttributeType=S \
  --key-schema AttributeName=productId,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

✅ **Success**: All AWS resources created

---

## Step 3: Deploy to AWS (10 minutes)

### Fix .gitignore and Commit
```bash
git add .gitignore package-lock.json
git commit -m "fix: correct .gitignore for production"
git push origin development
```

### Configure GitHub Secrets
Go to: `GitHub Repository → Settings → Secrets and variables → Actions`

Click "New repository secret" and add these 5 secrets:

1. **AWS_ACCESS_KEY_ID**: Your AWS access key
2. **AWS_SECRET_ACCESS_KEY**: Your AWS secret key
3. **JWT_SECRET**: Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
4. **DYNAMODB_USERS_TABLE**: `prod-Users`
5. **DYNAMODB_PRODUCTS_TABLE**: `prod-Products`

### Trigger Deployment
```bash
git push origin development
```

### Watch Pipeline
Go to: `GitHub → Actions tab`

Wait for all 6 stages to complete (~10-15 minutes)

### Verify Deployment
```bash
kubectl get pods -l app=auth-api
kubectl get service auth-api-service
```

✅ **Success**: Application running in AWS!

---

## That's It!

**3 simple steps**:
1. Test locally (15 min)
2. Set up AWS (30-60 min)
3. Deploy (10 min)

**Total time**: ~1-2 hours

**Monthly cost**: ~$150-200

---

## Quick Troubleshooting

**Local tests fail?**
- Check `.env` has correct AWS credentials
- Run `npm run create-tables` first

**AWS setup fails?**
- Check AWS credentials: `aws sts get-caller-identity`
- Check region is `us-east-1`

**Deployment fails?**
- Check GitHub secrets are configured
- Check GitHub Actions logs for errors

**Need more details?**
- Open `START-HERE.md` for complete documentation map
- All other .md files are reference documentation

---

**Start with Step 1 and follow sequentially!**
