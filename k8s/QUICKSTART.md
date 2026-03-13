# EKS Deployment - Quick Start

## Prerequisites Checklist

Before starting, ensure you have:

- [ ] AWS Account with appropriate permissions
- [ ] AWS CLI installed and configured (`aws configure`)
- [ ] Docker installed and running
- [ ] kubectl installed
- [ ] Helm 3.x installed
- [ ] eksctl installed
- [ ] Your AWS credentials ready

## Quick Deployment (Automated)

### Option 1: Using the Deploy Script (Recommended)

```bash
# Make script executable
chmod +x k8s/deploy.sh

# Run deployment script
./k8s/deploy.sh
```

The script will:
1. Create ECR repository
2. Build and push Docker image
3. Create EKS cluster (if needed)
4. Create Kubernetes secrets
5. Deploy application with Helm
6. Display service URL

---

## Manual Deployment (Step by Step)

### Step 1: Set Variables

```bash
# Set your AWS region and account ID
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_REPO=auth-api
```

### Step 2: Create ECR Repository

```bash
aws ecr create-repository --repository-name ${ECR_REPO} --region ${AWS_REGION}
```

### Step 3: Build and Push Docker Image

```bash
# Authenticate Docker to ECR
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Build image
docker build -t ${ECR_REPO}:latest .

# Tag image
docker tag ${ECR_REPO}:latest ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest

# Push image
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:latest
```

### Step 4: Create EKS Cluster

```bash
# Create cluster (takes 15-20 minutes)
eksctl create cluster -f k8s/eks-cluster-config.yaml

# Configure kubectl
aws eks update-kubeconfig --name auth-api-cluster --region ${AWS_REGION}

# Verify cluster
kubectl get nodes
```

### Step 5: Create Secrets

```bash
kubectl create secret generic auth-api-secrets \
  --from-literal=JWT_SECRET=your-super-secret-jwt-key \
  --from-literal=AWS_ACCESS_KEY_ID=AKIA**************** \
  --from-literal=AWS_SECRET_ACCESS_KEY=******************************** \
  --from-literal=AWS_REGION=us-east-1 \
  --from-literal=DYNAMODB_USERS_TABLE=prod-Users \
  --from-literal=DYNAMODB_PRODUCTS_TABLE=prod-Products
```

### Step 6: Deploy with Helm

```bash
helm install auth-api k8s/helm/auth-api \
  --set image.repository=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO} \
  --set image.tag=latest
```

### Step 7: Get Service URL

```bash
# Wait for Load Balancer (2-3 minutes)
kubectl get service auth-api-service -w

# Get URL
export SERVICE_URL=$(kubectl get service auth-api-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Service URL: http://${SERVICE_URL}"
```

### Step 8: Test the API

```bash
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

# Login
curl -X POST http://${SERVICE_URL}/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

---

## Useful Commands

### View Resources

```bash
# View all resources
kubectl get all

# View pods
kubectl get pods

# View services
kubectl get services

# View deployments
kubectl get deployments

# View HPA
kubectl get hpa
```

### View Logs

```bash
# View logs from all pods
kubectl logs -l app=auth-api --tail=100

# Follow logs
kubectl logs -l app=auth-api -f

# View logs from specific pod
kubectl logs <pod-name>
```

### Scale Application

```bash
# Manual scaling
kubectl scale deployment auth-api --replicas=5

# Check scaling
kubectl get pods -l app=auth-api
```

### Update Deployment

```bash
# Build new version
docker build -t ${ECR_REPO}:v2 .
docker tag ${ECR_REPO}:v2 ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:v2
docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:v2

# Upgrade with Helm
helm upgrade auth-api k8s/helm/auth-api --set image.tag=v2
```

### Rollback

```bash
# View history
helm history auth-api

# Rollback to previous version
helm rollback auth-api
```

---

## Cleanup

### Delete Application

```bash
helm uninstall auth-api
kubectl delete secret auth-api-secrets
```

### Delete Cluster

```bash
eksctl delete cluster --name auth-api-cluster --region us-east-1
```

### Delete ECR Repository

```bash
aws ecr delete-repository --repository-name auth-api --region us-east-1 --force
```

---

## Troubleshooting

### Pods Not Starting

```bash
kubectl describe pod <pod-name>
kubectl logs <pod-name>
```

### Service Not Accessible

```bash
kubectl get service auth-api-service
kubectl describe service auth-api-service
```

### Image Pull Errors

```bash
# Re-authenticate Docker
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
```

---

## Cost Estimate

Approximate monthly costs (us-east-1):

- **EKS Cluster**: $73/month
- **EC2 Instances** (2x t3.medium): ~$60/month
- **Load Balancer**: ~$20/month
- **Data Transfer**: Variable
- **DynamoDB**: Pay per request

**Total**: ~$150-200/month

---

## Next Steps

1. Set up CI/CD pipeline
2. Configure monitoring (Prometheus/Grafana)
3. Set up logging (CloudWatch/ELK)
4. Configure custom domain
5. Enable HTTPS with ACM
6. Set up staging environment

---

**Need help?** See the full guide in `K8S-DEPLOYMENT-GUIDE.md`
