# AWS EKS Setup Requirements

**Everything you need from AWS to set up Kubernetes (EKS)**

---

## 📋 Overview

To deploy your application to AWS EKS, you need:
1. AWS Account with billing enabled
2. IAM User with specific permissions
3. AWS CLI installed and configured
4. kubectl installed
5. eksctl installed (optional but recommended)
6. Helm installed

**Estimated Setup Time**: 30-60 minutes  
**Estimated Monthly Cost**: $75-150 (EKS cluster + EC2 nodes)

---

## 1️⃣ AWS Account Requirements

### What You Need

✅ **AWS Account**
- Sign up at: https://aws.amazon.com
- Credit card required (for billing)
- Free tier available for some services

✅ **Billing Enabled**
- EKS cluster: ~$73/month ($0.10/hour)
- EC2 nodes: ~$30-100/month (depending on instance type)
- Data transfer: Variable
- DynamoDB: Pay per request (minimal for testing)

### Cost Breakdown

**EKS Cluster**: $73/month
- Control plane: $0.10/hour × 730 hours = $73

**Worker Nodes** (2 × t3.medium): ~$60/month
- t3.medium: $0.0416/hour × 2 nodes × 730 hours = $60.74

**Load Balancer**: ~$20/month
- Classic LB: $0.025/hour × 730 hours = $18.25

**DynamoDB**: ~$5/month (for testing)
- On-demand pricing: $1.25 per million writes

**Total Estimated**: $150-200/month

**💡 Cost Saving Tips**:
- Use t3.small instead of t3.medium ($30/month savings)
- Use Spot instances for non-production (50-70% savings)
- Delete cluster when not in use
- Use AWS Free Tier where applicable

---

## 2️⃣ IAM User Setup

### Create IAM User for Deployment

**Step 1: Go to IAM Console**
```
AWS Console → IAM → Users → Add user
```

**Step 2: User Details**
- Username: `auth-api-deployer`
- Access type: ✅ Programmatic access
- Console access: ❌ Not needed

**Step 3: Attach Policies**

Select these managed policies:
- ✅ `AmazonEKSClusterPolicy`
- ✅ `AmazonEKSWorkerNodePolicy`
- ✅ `AmazonEC2ContainerRegistryFullAccess`
- ✅ `AmazonDynamoDBFullAccess`
- ✅ `AmazonVPCFullAccess` (for networking)
- ✅ `IAMFullAccess` (for creating service roles)

**Or create custom policy** (least privilege):
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "eks:*",
        "ec2:*",
        "ecr:*",
        "dynamodb:*",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:PassRole",
        "cloudformation:*",
        "autoscaling:*",
        "elasticloadbalancing:*"
      ],
      "Resource": "*"
    }
  ]
}
```

**Step 4: Save Credentials**
```
Access Key ID: AKIA...
Secret Access Key: ...
```

⚠️ **CRITICAL**: Save these credentials securely! You can't retrieve the secret key later.

---

## 3️⃣ Required AWS Services

### Services You'll Use

**Amazon EKS** (Elastic Kubernetes Service)
- Managed Kubernetes control plane
- Handles master nodes, API server, etcd
- You only manage worker nodes

**Amazon EC2** (Elastic Compute Cloud)
- Worker nodes for your pods
- Recommended: 2 × t3.medium (2 vCPU, 4GB RAM each)

**Amazon ECR** (Elastic Container Registry)
- Docker image storage
- Private registry for your images

**Amazon DynamoDB**
- NoSQL database
- Tables: `prod-Users`, `prod-Products`

**Amazon VPC** (Virtual Private Cloud)
- Networking for EKS cluster
- Subnets, security groups, route tables

**Elastic Load Balancer**
- Distributes traffic to pods
- Created automatically by Kubernetes service

---

## 4️⃣ Install Required Tools

### AWS CLI

**Windows**:
```powershell
# Download installer
https://awscli.amazonaws.com/AWSCLIV2.msi

# Or use Chocolatey
choco install awscli
```

**Mac**:
```bash
brew install awscli
```

**Linux**:
```bash
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
```

**Verify**:
```bash
aws --version
# Expected: aws-cli/2.x.x
```

**Configure**:
```bash
aws configure
# AWS Access Key ID: AKIA...
# AWS Secret Access Key: ...
# Default region: us-east-1
# Default output format: json
```

### kubectl

**Windows**:
```powershell
# Download
curl -LO "https://dl.k8s.io/release/v1.28.0/bin/windows/amd64/kubectl.exe"

# Or use Chocolatey
choco install kubernetes-cli
```

**Mac**:
```bash
brew install kubectl
```

**Linux**:
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl
```

**Verify**:
```bash
kubectl version --client
```

### eksctl (Recommended)

**Windows**:
```powershell
choco install eksctl
```

**Mac**:
```bash
brew install eksctl
```

**Linux**:
```bash
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
```

**Verify**:
```bash
eksctl version
```

### Helm

**Windows**:
```powershell
choco install kubernetes-helm
```

**Mac**:
```bash
brew install helm
```

**Linux**:
```bash
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
```

**Verify**:
```bash
helm version
```

---

## 5️⃣ Create AWS Resources

### Option A: Automated Setup with eksctl (Recommended)

**Create EKS Cluster** (15-20 minutes):
```bash
eksctl create cluster \
  --name auth-api-cluster \
  --region us-east-1 \
  --nodegroup-name auth-api-nodes \
  --node-type t3.medium \
  --nodes 2 \
  --nodes-min 2 \
  --nodes-max 4 \
  --managed
```

**What this creates**:
- ✅ EKS cluster (control plane)
- ✅ VPC with subnets
- ✅ Security groups
- ✅ IAM roles
- ✅ Node group (2 EC2 instances)
- ✅ Auto-scaling group

**Monitor progress**:
```bash
# Watch cluster creation
eksctl get cluster --name auth-api-cluster --region us-east-1

# Check nodes
kubectl get nodes
```

### Option B: Manual Setup (Advanced)

Follow the detailed guide in `K8S-DEPLOYMENT-GUIDE.md`

---

## 6️⃣ Create ECR Repository

```bash
aws ecr create-repository \
  --repository-name auth-api \
  --region us-east-1
```

**Expected output**:
```json
{
  "repository": {
    "repositoryUri": "123456789012.dkr.ecr.us-east-1.amazonaws.com/auth-api"
  }
}
```

**Save the repositoryUri** - you'll need it!

---

## 7️⃣ Create DynamoDB Tables

```bash
# Create Users table
aws dynamodb create-table \
  --table-name prod-Users \
  --attribute-definitions \
    AttributeName=userId,AttributeType=S \
    AttributeName=email,AttributeType=S \
  --key-schema \
    AttributeName=userId,KeyType=HASH \
  --global-secondary-indexes \
    IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5} \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1

# Create Products table
aws dynamodb create-table \
  --table-name prod-Products \
  --attribute-definitions \
    AttributeName=productId,AttributeType=S \
  --key-schema \
    AttributeName=productId,KeyType=HASH \
  --provisioned-throughput \
    ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --region us-east-1
```

**Verify**:
```bash
aws dynamodb list-tables --region us-east-1
```

---

## 8️⃣ Verification Checklist

Before proceeding to deployment, verify:

- [ ] AWS account created and billing enabled
- [ ] IAM user created with correct permissions
- [ ] AWS CLI installed and configured
- [ ] kubectl installed
- [ ] eksctl installed (optional)
- [ ] Helm installed
- [ ] EKS cluster created and ACTIVE
- [ ] Worker nodes running (2 nodes)
- [ ] ECR repository created
- [ ] DynamoDB tables created (prod-Users, prod-Products)
- [ ] Can run: `kubectl get nodes` successfully

---

## 9️⃣ Quick Verification Commands

```bash
# Check AWS CLI
aws --version
aws sts get-caller-identity

# Check kubectl
kubectl version --client

# Check EKS cluster
aws eks describe-cluster --name auth-api-cluster --region us-east-1

# Check nodes
kubectl get nodes

# Check ECR
aws ecr describe-repositories --region us-east-1

# Check DynamoDB
aws dynamodb list-tables --region us-east-1
```

**All commands should succeed!**

---

## 🎯 What You Should Have Now

✅ AWS account with billing  
✅ IAM user with deployment permissions  
✅ AWS CLI configured  
✅ kubectl installed  
✅ Helm installed  
✅ EKS cluster running (2 nodes)  
✅ ECR repository created  
✅ DynamoDB tables created  

**Next Steps**:
1. Configure GitHub secrets (see `IMMEDIATE-ACTION-ITEMS.md`)
2. Push code to trigger CI/CD pipeline
3. Watch deployment in GitHub Actions

---

## 💰 Cost Management

### Monitor Costs
```
AWS Console → Billing → Cost Explorer
```

### Set Budget Alerts
```
AWS Console → Billing → Budgets → Create budget
Set alert at $100/month
```

### Delete Resources When Done
```bash
# Delete cluster (saves $150/month)
eksctl delete cluster --name auth-api-cluster --region us-east-1

# Delete ECR images
aws ecr batch-delete-image \
  --repository-name auth-api \
  --image-ids imageTag=latest

# Delete DynamoDB tables
aws dynamodb delete-table --table-name prod-Users
aws dynamodb delete-table --table-name prod-Products
```

---

## 📞 Need Help?

- **AWS Documentation**: https://docs.aws.amazon.com/eks/
- **eksctl Documentation**: https://eksctl.io/
- **kubectl Documentation**: https://kubernetes.io/docs/reference/kubectl/
- **Detailed Guide**: `K8S-DEPLOYMENT-GUIDE.md`

---

**Estimated Total Setup Time**: 30-60 minutes  
**Estimated Monthly Cost**: $150-200 (can be reduced with optimizations)
