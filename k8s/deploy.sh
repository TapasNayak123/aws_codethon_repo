#!/bin/bash

# AWS EKS Deployment Script for Auth API
# This script automates the deployment process

set -e

echo "=========================================="
echo "Auth API - AWS EKS Deployment Script"
echo "=========================================="
echo ""

# Configuration
AWS_REGION="us-east-1"
ECR_REPO_NAME="auth-api"
CLUSTER_NAME="auth-api-cluster"
HELM_RELEASE_NAME="auth-api"

# Get AWS Account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO_NAME}"

echo "Configuration:"
echo "  AWS Region: ${AWS_REGION}"
echo "  AWS Account: ${AWS_ACCOUNT_ID}"
echo "  ECR Repository: ${ECR_REPO_URI}"
echo "  Cluster Name: ${CLUSTER_NAME}"
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."
if ! command_exists aws; then
    echo "Error: AWS CLI is not installed"
    exit 1
fi

if ! command_exists docker; then
    echo "Error: Docker is not installed"
    exit 1
fi

if ! command_exists kubectl; then
    echo "Error: kubectl is not installed"
    exit 1
fi

if ! command_exists helm; then
    echo "Error: Helm is not installed"
    exit 1
fi

if ! command_exists eksctl; then
    echo "Error: eksctl is not installed"
    exit 1
fi

echo "All prerequisites are installed!"
echo ""

# Step 1: Create ECR Repository
echo "Step 1: Creating ECR repository..."
if aws ecr describe-repositories --repository-names ${ECR_REPO_NAME} --region ${AWS_REGION} 2>/dev/null; then
    echo "ECR repository already exists"
else
    aws ecr create-repository --repository-name ${ECR_REPO_NAME} --region ${AWS_REGION}
    echo "ECR repository created"
fi
echo ""

# Step 2: Build and Push Docker Image
echo "Step 2: Building and pushing Docker image..."
echo "Authenticating Docker to ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

echo "Building Docker image..."
docker build -t ${ECR_REPO_NAME}:latest .

echo "Tagging image..."
docker tag ${ECR_REPO_NAME}:latest ${ECR_REPO_URI}:latest

echo "Pushing image to ECR..."
docker push ${ECR_REPO_URI}:latest
echo "Docker image pushed successfully!"
echo ""

# Step 3: Create EKS Cluster (if not exists)
echo "Step 3: Checking EKS cluster..."
if eksctl get cluster --name ${CLUSTER_NAME} --region ${AWS_REGION} 2>/dev/null; then
    echo "EKS cluster already exists"
else
    echo "Creating EKS cluster (this will take 15-20 minutes)..."
    eksctl create cluster -f k8s/eks-cluster-config.yaml
    echo "EKS cluster created"
fi

echo "Updating kubeconfig..."
aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${AWS_REGION}
echo ""

# Step 4: Create Kubernetes Secrets
echo "Step 4: Creating Kubernetes secrets..."
echo "Please enter the following values:"
read -sp "JWT_SECRET: " JWT_SECRET
echo ""
read -sp "AWS_ACCESS_KEY_ID: " AWS_ACCESS_KEY_ID
echo ""
read -sp "AWS_SECRET_ACCESS_KEY: " AWS_SECRET_ACCESS_KEY
echo ""

kubectl create secret generic auth-api-secrets \
  --from-literal=JWT_SECRET="${JWT_SECRET}" \
  --from-literal=AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID}" \
  --from-literal=AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY}" \
  --from-literal=AWS_REGION="${AWS_REGION}" \
  --from-literal=DYNAMODB_USERS_TABLE="prod-Users" \
  --from-literal=DYNAMODB_PRODUCTS_TABLE="prod-Products" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secrets created successfully!"
echo ""

# Step 5: Deploy with Helm
echo "Step 5: Deploying application with Helm..."
helm upgrade --install ${HELM_RELEASE_NAME} k8s/helm/auth-api \
  --set image.repository=${ECR_REPO_URI} \
  --set image.tag=latest \
  --wait

echo "Application deployed successfully!"
echo ""

# Step 6: Get Service URL
echo "Step 6: Getting service URL..."
echo "Waiting for Load Balancer to be ready..."
sleep 30

SERVICE_URL=$(kubectl get service ${HELM_RELEASE_NAME}-service -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')

if [ -z "$SERVICE_URL" ]; then
    echo "Load Balancer URL not ready yet. Run this command to get it later:"
    echo "kubectl get service ${HELM_RELEASE_NAME}-service"
else
    echo ""
    echo "=========================================="
    echo "Deployment Complete!"
    echo "=========================================="
    echo ""
    echo "Service URL: http://${SERVICE_URL}"
    echo ""
    echo "Test the API:"
    echo "  Health Check: curl http://${SERVICE_URL}/api/health"
    echo ""
    echo "Useful commands:"
    echo "  View pods: kubectl get pods"
    echo "  View logs: kubectl logs -l app=auth-api --tail=100"
    echo "  View service: kubectl get service ${HELM_RELEASE_NAME}-service"
    echo ""
fi
