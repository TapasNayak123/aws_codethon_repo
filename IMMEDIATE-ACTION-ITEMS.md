# 🚨 Immediate Action Items

**Before deploying to production, complete these 4 critical tasks:**

---

## ✅ Task 1: Commit .gitignore Fixes (2 minutes)

**What**: Two critical issues were found and fixed in `.gitignore`

**Issues Fixed**:
1. ❌ `.md` entry excluded ALL documentation files
2. ❌ `package-lock.json` excluded (prevents reproducible builds)

**Action Required**:
```bash
# Commit the fixed .gitignore
git add .gitignore
git commit -m "fix: correct .gitignore - include .md files and package-lock.json"

# Add package-lock.json to Git
git add package-lock.json
git commit -m "fix: include package-lock.json for reproducible builds"

# Push changes
git push origin development
```

**Verification**:
```bash
# Check that .md files are now tracked
git status

# Verify package-lock.json is tracked
git ls-files | grep package-lock.json
```

---

## 🔐 Task 2: Rotate AWS Credentials (10 minutes)

**Why**: Previous AWS credentials may have been exposed in documentation

**Steps**:

1. **Create New IAM User** (AWS Console)
   ```
   AWS Console → IAM → Users → Add user
   Name: auth-api-production
   Access type: Programmatic access
   Permissions: Attach policies directly
   - AmazonDynamoDBFullAccess
   - AmazonEC2ContainerRegistryFullAccess
   - AmazonEKSClusterPolicy
   ```

2. **Generate Access Keys**
   ```
   After creating user → Security credentials → Create access key
   Save: Access Key ID and Secret Access Key
   ```

3. **Update GitHub Secrets** (see Task 3)

4. **Delete Old IAM User**
   ```
   AWS Console → IAM → Users → Select old user → Delete
   ```

**Security Best Practice**:
- Use least privilege permissions
- Enable MFA on AWS account
- Rotate credentials every 90 days

---

## 🔑 Task 3: Configure GitHub Secrets (5 minutes)

**Where**: `Repository → Settings → Secrets and variables → Actions`

**Required Secrets** (5 total):

### 1. AWS_ACCESS_KEY_ID
```
Click "New repository secret"
Name: AWS_ACCESS_KEY_ID
Value: <paste new access key from Task 2>
```

### 2. AWS_SECRET_ACCESS_KEY
```
Name: AWS_SECRET_ACCESS_KEY
Value: <paste new secret key from Task 2>
```

### 3. JWT_SECRET
```
Name: JWT_SECRET
Value: <generate using command below>
```

**Generate JWT Secret**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Copy the output and paste as secret value
```

### 4. DYNAMODB_USERS_TABLE
```
Name: DYNAMODB_USERS_TABLE
Value: prod-Users
```

### 5. DYNAMODB_PRODUCTS_TABLE
```
Name: DYNAMODB_PRODUCTS_TABLE
Value: prod-Products
```

**Verification**:
```
Go to: Settings → Secrets and variables → Actions
You should see 5 secrets listed
```

---

## ☁️ Task 4: Verify AWS Resources (5 minutes)

**Check that all required AWS resources exist:**

### EKS Cluster
```bash
aws eks describe-cluster --name auth-api-cluster --region us-east-1
```
**Expected**: Cluster status should be "ACTIVE"

### ECR Repository
```bash
aws ecr describe-repositories --repository-names auth-api --region us-east-1
```
**Expected**: Repository should exist

### DynamoDB Tables
```bash
aws dynamodb list-tables --region us-east-1
```
**Expected**: Should show `prod-Users` and `prod-Products`

**If any resource is missing**:
- Follow `K8S-DEPLOYMENT-GUIDE.md` to create EKS cluster
- Create ECR repository: `aws ecr create-repository --repository-name auth-api --region us-east-1`
- Create DynamoDB tables: `npm run create-tables` (update .env first)

---

## ✅ Completion Checklist

After completing all tasks, verify:

- [ ] `.gitignore` fixes committed and pushed
- [ ] `package-lock.json` added to Git
- [ ] New AWS IAM user created with minimal permissions
- [ ] Old AWS IAM user deleted
- [ ] All 5 GitHub secrets configured
- [ ] EKS cluster exists and is ACTIVE
- [ ] ECR repository exists
- [ ] DynamoDB tables exist (prod-Users, prod-Products)

---

## 🚀 Ready to Deploy?

Once all checkboxes above are checked, you're ready to deploy!

**Next Steps**:
1. Push code to development branch
2. Watch pipeline in GitHub Actions
3. Verify deployment with kubectl
4. Test API endpoints

**Follow**: `DEPLOYMENT-CHECKLIST.md` for detailed deployment steps

---

## ⏱️ Time Estimate

- Task 1 (Commit fixes): 2 minutes
- Task 2 (Rotate credentials): 10 minutes
- Task 3 (Configure secrets): 5 minutes
- Task 4 (Verify resources): 5 minutes

**Total**: ~22 minutes

---

## 📞 Need Help?

- **Detailed Instructions**: `DEPLOYMENT-CHECKLIST.md`
- **CI/CD Setup**: `CICD-SETUP-GUIDE.md`
- **Quick Commands**: `CICD-QUICK-REFERENCE.md`
- **Complete Audit**: `PRODUCTION-READINESS-AUDIT.md`

---

**Start with Task 1 and work through sequentially!**
