# AWS EKS Deployment with Helm - Complete Guide

## Overview

This guide walks you through deploying the Authentication & Products API to AWS EKS (Elastic Kubernetes Service) using Helm charts.

## Architecture

```
+------------------------------------------------------------------+
|                         AWS Cloud                                |
|  +------------------------------------------------------------+  |
|  |                      EKS Cluster                           |  |
|  |  +------------------------------------------------------+  |  |
|  |  |                   Kubernetes                         |  |  |
|  |  |  +----------------+      +------------------------+  |  |  |
|  |  |  | Load Balancer  | ---> |   Auth API Service     |  |  |  |
|  |  |  | (ALB/NLB)      |      |   (3 replicas)         |  |  |  |
|  |  |  +----------------+      +------------------------+  |  |  |
|  |  |                                    |                 |  |  |
|  |  |                                    v                 |  |  |
|  |  |                          +------------------+        |  |  |
|  |  |                          |   DynamoDB       |        |  |  |
|  |  |                          | (Users, Products)|        |  |  |
|  |  |                          +------------------+        |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Prerequisites

### 1. Install Required Tools

#### AWS CLI
```bash
# Windows (using Chocolatey)
choco install awscli

# Or download from: https://aws.amazon.com/cli/
```

#### kubectl
```bash
# Windows (using Chocolatey)
choco install kubernetes-cli

# Or download from: https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/
```

#### Helm
```bash
# Windows (using Chocolatey)
choco install kubernetes-helm

# Or download from: https://helm.sh/docs/intro/install/
```

#### eksctl (EKS cluster management tool)
```bash
# Windows (using Chocolatey)
choco install eksctl

# Or download from: https://eksctl.io/installation/
```

### 2. Verify Installations

```bash
aws --version
kubectl version --client
helm version
eksctl version
```

### 3. Configure AWS Credentials

```bash
aws configure
```

Enter your AWS credentials:
- AWS Access Key ID: [Your Access Key]
- AWS Secret Access Key: [Your Secret Key]
- Default region: us-east-1 (or your preferred region)
- Default output format: json

---

## Step 1: Build and Push Docker Image to ECR

### 1.1 Create ECR Repository

```bash
# Create ECR repository
aws ecr create-repository --repository-name auth-api --region us-east-1

# Output will show repository URI like:
# 123456789012.dkr.ecr.us-east-1.amazonaws.com/auth-api
```

### 1.2 Authenticate Docker to ECR

```bash
# Get login password and authenticate
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com
```

Replace `123456789012` with your AWS account ID.

### 1.3 Build Docker Image

```bash
# Build the image
docker build -t auth-api:latest .

# Tag for ECR
docker tag auth-api:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/auth-api:latest
```

### 1.4 Push to ECR

```bash
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/auth-api:latest
```

---

## Step 2: Create EKS Cluster

### 2.1 Create Cluster Configuration

Create `eks-cluster-config.yaml`:

```yaml
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig

metadata:
  name: auth-api-cluster
  region: us-east-1
  version: "1.28"

managedNodeGroups:
  - name: auth-api-nodes
    instanceType: t3.medium
    desiredCapacity: 2
    minSize: 1
    maxSize: 3
    volumeSize: 20
    ssh:
      allow: false
    labels:
      role: worker
    tags:
      Environment: production
      Application: auth-api

iam:
  withOIDC: true
```

### 2.2 Create the Cluster

```bash
# This takes 15-20 minutes
eksctl create cluster -f eks-cluster-config.yaml
```

### 2.3 Verify Cluster

```bash
# Check cluster status
eksctl get cluster --name auth-api-cluster --region us-east-1

# Configure kubectl
aws eks update-kubeconfig --name auth-api-cluster --region us-east-1

# Verify nodes
kubectl get nodes
```

---

## Step 3: Create Kubernetes Secrets

### 3.1 Create Secret for Environment Variables

```bash
kubectl create secret generic auth-api-secrets \
  --from-literal=JWT_SECRET=your-super-secret-jwt-key-change-this-in-production \
  --from-literal=AWS_ACCESS_KEY_ID=AKIA**************** \
  --from-literal=AWS_SECRET_ACCESS_KEY=******************************** \
  --from-literal=AWS_REGION=us-east-1 \
  --from-literal=DYNAMODB_USERS_TABLE=prod-Users \
  --from-literal=DYNAMODB_PRODUCTS_TABLE=prod-Products
```

### 3.2 Verify Secret

```bash
kubectl get secrets
kubectl describe secret auth-api-secrets
```

---

## Step 4: Create Helm Chart

### 4.1 Create Helm Chart Structure

```bash
# Create helm chart directory
mkdir -p k8s/helm/auth-api
cd k8s/helm/auth-api

# Create subdirectories
mkdir templates
```

### 4.2 Create Chart.yaml

See `k8s/helm/auth-api/Chart.yaml` (created in next step)

### 4.3 Create values.yaml

See `k8s/helm/auth-api/values.yaml` (created in next step)

### 4.4 Create Kubernetes Templates

Templates will be created in `k8s/helm/auth-api/templates/`:
- deployment.yaml
- service.yaml
- ingress.yaml
- hpa.yaml (Horizontal Pod Autoscaler)
- configmap.yaml

---

## Step 5: Deploy with Helm

### 5.1 Install Helm Chart

```bash
# From project root
helm install auth-api k8s/helm/auth-api \
  --set image.repository=123456789012.dkr.ecr.us-east-1.amazonaws.com/auth-api \
  --set image.tag=latest
```

### 5.2 Verify Deployment

```bash
# Check helm release
helm list

# Check pods
kubectl get pods

# Check services
kubectl get services

# Check deployment
kubectl get deployments

# View logs
kubectl logs -l app=auth-api --tail=100
```

### 5.3 Get Load Balancer URL

```bash
# Get external IP/hostname
kubectl get service auth-api-service

# Wait for EXTERNAL-IP to be assigned (may take 2-3 minutes)
# Output will show something like:
# NAME                TYPE           EXTERNAL-IP                                                              
# auth-api-service    LoadBalancer   a1234567890abcdef.us-east-1.elb.amazonaws.com
```

---

## Step 6: Configure AWS Load Balancer Controller (Optional but Recommended)

### 6.1 Install AWS Load Balancer Controller

```bash
# Add EKS Helm repository
helm repo add eks https://aws.github.io/eks-charts
helm repo update

# Install AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=auth-api-cluster \
  --set serviceAccount.create=true \
  --set serviceAccount.name=aws-load-balancer-controller
```

### 6.2 Verify Installation

```bash
kubectl get deployment -n kube-system aws-load-balancer-controller
```

---

## Step 7: Test the Deployment

### 7.1 Get Service URL

```bash
# Get load balancer URL
export SERVICE_URL=$(kubectl get service auth-api-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
echo "Service URL: http://$SERVICE_URL"
```

### 7.2 Test Health Endpoint

```bash
curl http://$SERVICE_URL/api/health
```

### 7.3 Test Registration

```bash
curl -X POST http://$SERVICE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "dateOfBirth": "1990-01-01",
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

### 7.4 Test Login

```bash
curl -X POST http://$SERVICE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

---

## Step 8: Monitoring and Scaling

### 8.1 View Pod Logs

```bash
# View logs from all pods
kubectl logs -l app=auth-api --tail=100 -f

# View logs from specific pod
kubectl logs <pod-name> -f
```

### 8.2 Scale Deployment

```bash
# Manual scaling
kubectl scale deployment auth-api --replicas=5

# Check scaling
kubectl get pods -l app=auth-api
```

### 8.3 Check Horizontal Pod Autoscaler

```bash
# View HPA status
kubectl get hpa

# Describe HPA
kubectl describe hpa auth-api-hpa
```

### 8.4 Monitor Resource Usage

```bash
# Check pod resource usage
kubectl top pods

# Check node resource usage
kubectl top nodes
```

---

## Step 9: Update Deployment

### 9.1 Build New Image

```bash
# Build new version
docker build -t auth-api:v2 .

# Tag for ECR
docker tag auth-api:v2 123456789012.dkr.ecr.us-east-1.amazonaws.com/auth-api:v2

# Push to ECR
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/auth-api:v2
```

### 9.2 Upgrade Helm Release

```bash
helm upgrade auth-api k8s/helm/auth-api \
  --set image.tag=v2 \
  --set image.repository=123456789012.dkr.ecr.us-east-1.amazonaws.com/auth-api
```

### 9.3 Rollback if Needed

```bash
# View release history
helm history auth-api

# Rollback to previous version
helm rollback auth-api 1
```

---

## Step 10: Cleanup

### 10.1 Delete Helm Release

```bash
helm uninstall auth-api
```

### 10.2 Delete Secrets

```bash
kubectl delete secret auth-api-secrets
```

### 10.3 Delete EKS Cluster

```bash
eksctl delete cluster --name auth-api-cluster --region us-east-1
```

### 10.4 Delete ECR Repository

```bash
aws ecr delete-repository --repository-name auth-api --region us-east-1 --force
```

---

## Troubleshooting

### Pods Not Starting

```bash
# Check pod status
kubectl get pods

# Describe pod to see events
kubectl describe pod <pod-name>

# Check logs
kubectl logs <pod-name>
```

### Image Pull Errors

```bash
# Verify ECR authentication
aws ecr get-login-password --region us-east-1

# Check if image exists
aws ecr describe-images --repository-name auth-api --region us-east-1
```

### Service Not Accessible

```bash
# Check service
kubectl get service auth-api-service

# Check endpoints
kubectl get endpoints auth-api-service

# Check security groups (AWS Console)
# Ensure port 3000 is open in security group
```

### DynamoDB Connection Issues

```bash
# Check if pods have correct IAM permissions
kubectl describe pod <pod-name>

# Verify environment variables
kubectl exec <pod-name> -- env | grep DYNAMODB
```

---

## Cost Optimization Tips

1. **Use Spot Instances**: Add spot instances to node group for cost savings
2. **Right-size Instances**: Start with t3.small and scale up if needed
3. **Enable Cluster Autoscaler**: Automatically scale nodes based on demand
4. **Use Reserved Instances**: For production workloads
5. **Monitor Costs**: Use AWS Cost Explorer to track spending

---

## Security Best Practices

1. **Use Secrets Manager**: Store sensitive data in AWS Secrets Manager
2. **Enable Pod Security Policies**: Restrict pod capabilities
3. **Use Network Policies**: Control pod-to-pod communication
4. **Enable Audit Logging**: Track all API calls
5. **Rotate Credentials**: Regularly rotate AWS credentials and JWT secrets
6. **Use Private Subnets**: Deploy worker nodes in private subnets
7. **Enable Encryption**: Encrypt data at rest and in transit

---

## Next Steps

1. Set up CI/CD pipeline (GitHub Actions, Jenkins, etc.)
2. Configure monitoring (Prometheus, Grafana)
3. Set up logging (CloudWatch, ELK stack)
4. Configure alerts (CloudWatch Alarms)
5. Implement backup strategy for DynamoDB
6. Set up staging environment
7. Configure custom domain with Route 53
8. Enable HTTPS with ACM certificates

---

## Useful Commands Reference

```bash
# Helm
helm list                                    # List releases
helm status auth-api                         # Check release status
helm get values auth-api                     # View values
helm upgrade auth-api k8s/helm/auth-api      # Upgrade release
helm rollback auth-api                       # Rollback release
helm uninstall auth-api                      # Delete release

# kubectl
kubectl get all                              # Get all resources
kubectl get pods -w                          # Watch pods
kubectl describe pod <pod-name>              # Pod details
kubectl logs <pod-name> -f                   # Follow logs
kubectl exec -it <pod-name> -- /bin/sh       # Shell into pod
kubectl port-forward <pod-name> 3000:3000    # Port forward
kubectl delete pod <pod-name>                # Delete pod

# EKS
eksctl get cluster                           # List clusters
eksctl get nodegroup --cluster=<name>        # List node groups
eksctl scale nodegroup --cluster=<name> --name=<ng-name> --nodes=3
eksctl delete cluster --name=<name>          # Delete cluster

# AWS
aws eks list-clusters                        # List EKS clusters
aws ecr describe-repositories                # List ECR repos
aws ecr list-images --repository-name=<name> # List images
```

---

**Ready to deploy!** Follow the steps in order, and your application will be running on AWS EKS with Helm.
