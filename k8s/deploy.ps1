# AWS EKS Deployment Script for Auth API (PowerShell)
# This script automates the deployment process for Windows

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Auth API - AWS EKS Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$AWS_REGION = "us-east-1"
$ECR_REPO_NAME = "auth-api"
$CLUSTER_NAME = "auth-api-cluster"
$HELM_RELEASE_NAME = "auth-api"

# Get AWS Account ID
Write-Host "Getting AWS Account ID..." -ForegroundColor Yellow
$AWS_ACCOUNT_ID = (aws sts get-caller-identity --query Account --output text)
$ECR_REPO_URI = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"

Write-Host "Configuration:" -ForegroundColor Green
Write-Host "  AWS Region: $AWS_REGION"
Write-Host "  AWS Account: $AWS_ACCOUNT_ID"
Write-Host "  ECR Repository: $ECR_REPO_URI"
Write-Host "  Cluster Name: $CLUSTER_NAME"
Write-Host ""

# Function to check if command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
$prerequisites = @("aws", "docker", "kubectl", "helm", "eksctl")
$missing = @()

foreach ($cmd in $prerequisites) {
    if (-not (Test-CommandExists $cmd)) {
        $missing += $cmd
    }
}

if ($missing.Count -gt 0) {
    Write-Host "Error: Missing prerequisites: $($missing -join ', ')" -ForegroundColor Red
    Write-Host "Please install missing tools and try again." -ForegroundColor Red
    exit 1
}

Write-Host "All prerequisites are installed!" -ForegroundColor Green
Write-Host ""

# Step 1: Create ECR Repository
Write-Host "Step 1: Creating ECR repository..." -ForegroundColor Yellow
try {
    aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $AWS_REGION 2>$null
    Write-Host "ECR repository already exists" -ForegroundColor Green
} catch {
    aws ecr create-repository --repository-name $ECR_REPO_NAME --region $AWS_REGION
    Write-Host "ECR repository created" -ForegroundColor Green
}
Write-Host ""

# Step 2: Build and Push Docker Image
Write-Host "Step 2: Building and pushing Docker image..." -ForegroundColor Yellow
Write-Host "Authenticating Docker to ECR..."
$loginPassword = aws ecr get-login-password --region $AWS_REGION
$loginPassword | docker login --username AWS --password-stdin "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

Write-Host "Building Docker image..."
docker build -t "${ECR_REPO_NAME}:latest" .

Write-Host "Tagging image..."
docker tag "${ECR_REPO_NAME}:latest" "${ECR_REPO_URI}:latest"

Write-Host "Pushing image to ECR..."
docker push "${ECR_REPO_URI}:latest"
Write-Host "Docker image pushed successfully!" -ForegroundColor Green
Write-Host ""

# Step 3: Create EKS Cluster (if not exists)
Write-Host "Step 3: Checking EKS cluster..." -ForegroundColor Yellow
try {
    eksctl get cluster --name $CLUSTER_NAME --region $AWS_REGION 2>$null
    Write-Host "EKS cluster already exists" -ForegroundColor Green
} catch {
    Write-Host "Creating EKS cluster (this will take 15-20 minutes)..." -ForegroundColor Yellow
    eksctl create cluster -f k8s/eks-cluster-config.yaml
    Write-Host "EKS cluster created" -ForegroundColor Green
}

Write-Host "Updating kubeconfig..."
aws eks update-kubeconfig --name $CLUSTER_NAME --region $AWS_REGION
Write-Host ""

# Step 4: Create Kubernetes Secrets
Write-Host "Step 4: Creating Kubernetes secrets..." -ForegroundColor Yellow
Write-Host "Please enter the following values:" -ForegroundColor Cyan

$JWT_SECRET = Read-Host "JWT_SECRET" -AsSecureString
$JWT_SECRET_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($JWT_SECRET))

$AWS_ACCESS_KEY = Read-Host "AWS_ACCESS_KEY_ID" -AsSecureString
$AWS_ACCESS_KEY_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($AWS_ACCESS_KEY))

$AWS_SECRET_KEY = Read-Host "AWS_SECRET_ACCESS_KEY" -AsSecureString
$AWS_SECRET_KEY_Plain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($AWS_SECRET_KEY))

kubectl create secret generic auth-api-secrets `
  --from-literal=JWT_SECRET="$JWT_SECRET_Plain" `
  --from-literal=AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_Plain" `
  --from-literal=AWS_SECRET_ACCESS_KEY="$AWS_SECRET_KEY_Plain" `
  --from-literal=AWS_REGION="$AWS_REGION" `
  --from-literal=DYNAMODB_USERS_TABLE="prod-Users" `
  --from-literal=DYNAMODB_PRODUCTS_TABLE="prod-Products" `
  --dry-run=client -o yaml | kubectl apply -f -

Write-Host "Secrets created successfully!" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy with Helm
Write-Host "Step 5: Deploying application with Helm..." -ForegroundColor Yellow
helm upgrade --install $HELM_RELEASE_NAME k8s/helm/auth-api `
  --set image.repository=$ECR_REPO_URI `
  --set image.tag=latest `
  --wait

Write-Host "Application deployed successfully!" -ForegroundColor Green
Write-Host ""

# Step 6: Get Service URL
Write-Host "Step 6: Getting service URL..." -ForegroundColor Yellow
Write-Host "Waiting for Load Balancer to be ready..."
Start-Sleep -Seconds 30

$SERVICE_URL = kubectl get service "$HELM_RELEASE_NAME-service" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

if ([string]::IsNullOrEmpty($SERVICE_URL)) {
    Write-Host "Load Balancer URL not ready yet. Run this command to get it later:" -ForegroundColor Yellow
    Write-Host "kubectl get service $HELM_RELEASE_NAME-service" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Deployment Complete!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service URL: http://$SERVICE_URL" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Test the API:" -ForegroundColor Yellow
    Write-Host "  Health Check: curl http://$SERVICE_URL/api/health" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Useful commands:" -ForegroundColor Yellow
    Write-Host "  View pods: kubectl get pods" -ForegroundColor Cyan
    Write-Host "  View logs: kubectl logs -l app=auth-api --tail=100" -ForegroundColor Cyan
    Write-Host "  View service: kubectl get service $HELM_RELEASE_NAME-service" -ForegroundColor Cyan
    Write-Host ""
}
