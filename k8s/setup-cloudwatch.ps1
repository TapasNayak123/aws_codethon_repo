# Setup CloudWatch Logging for EKS
# This script configures IAM roles and service accounts for CloudWatch logging

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CloudWatch Logging Setup for EKS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$CLUSTER_NAME = "auth-api-cluster"
$REGION = "us-east-1"
$SERVICE_ACCOUNT_NAME = "auth-api-sa"
$NAMESPACE = "default"
$POLICY_NAME = "AuthAPICloudWatchLogsPolicy"
$ROLE_NAME = "AuthAPICloudWatchLogsRole"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Cluster: $CLUSTER_NAME"
Write-Host "  Region: $REGION"
Write-Host "  Service Account: $SERVICE_ACCOUNT_NAME"
Write-Host "  Namespace: $NAMESPACE"
Write-Host ""

# Step 1: Get AWS Account ID
Write-Host "[1/6] Getting AWS Account ID..." -ForegroundColor Green
$ACCOUNT_ID = aws sts get-caller-identity --query Account --output text
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to get AWS Account ID" -ForegroundColor Red
    exit 1
}
Write-Host "  Account ID: $ACCOUNT_ID" -ForegroundColor Gray
Write-Host ""

# Step 2: Create IAM Policy for CloudWatch Logs
Write-Host "[2/6] Creating IAM Policy for CloudWatch Logs..." -ForegroundColor Green
$POLICY_ARN = "arn:aws:iam::${ACCOUNT_ID}:policy/${POLICY_NAME}"

# Check if policy already exists
$existingPolicy = aws iam get-policy --policy-arn $POLICY_ARN 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Policy already exists: $POLICY_ARN" -ForegroundColor Yellow
} else {
    aws iam create-policy `
        --policy-name $POLICY_NAME `
        --policy-document file://k8s/cloudwatch-policy.json `
        --description "Policy for auth-api to write logs to CloudWatch"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to create IAM policy" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Created policy: $POLICY_ARN" -ForegroundColor Gray
}
Write-Host ""

# Step 3: Get OIDC Provider for EKS Cluster
Write-Host "[3/6] Getting OIDC Provider for EKS cluster..." -ForegroundColor Green
$OIDC_PROVIDER = aws eks describe-cluster --name $CLUSTER_NAME --region $REGION --query "cluster.identity.oidc.issuer" --output text
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to get OIDC provider" -ForegroundColor Red
    exit 1
}
$OIDC_PROVIDER = $OIDC_PROVIDER -replace "https://", ""
Write-Host "  OIDC Provider: $OIDC_PROVIDER" -ForegroundColor Gray
Write-Host ""

# Step 4: Create IAM Role Trust Policy
Write-Host "[4/6] Creating IAM Role Trust Policy..." -ForegroundColor Green
$trustPolicy = @"
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::${ACCOUNT_ID}:oidc-provider/${OIDC_PROVIDER}"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "${OIDC_PROVIDER}:sub": "system:serviceaccount:${NAMESPACE}:${SERVICE_ACCOUNT_NAME}",
          "${OIDC_PROVIDER}:aud": "sts.amazonaws.com"
        }
      }
    }
  ]
}
"@

$trustPolicy | Out-File -FilePath "k8s/trust-policy.json" -Encoding utf8
Write-Host "  Trust policy created" -ForegroundColor Gray
Write-Host ""

# Step 5: Create IAM Role
Write-Host "[5/6] Creating IAM Role..." -ForegroundColor Green
$existingRole = aws iam get-role --role-name $ROLE_NAME 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Role already exists: $ROLE_NAME" -ForegroundColor Yellow
    Write-Host "  Updating trust policy..." -ForegroundColor Yellow
    aws iam update-assume-role-policy `
        --role-name $ROLE_NAME `
        --policy-document file://k8s/trust-policy.json
} else {
    aws iam create-role `
        --role-name $ROLE_NAME `
        --assume-role-policy-document file://k8s/trust-policy.json `
        --description "IAM role for auth-api CloudWatch logging"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error: Failed to create IAM role" -ForegroundColor Red
        exit 1
    }
    Write-Host "  Created role: $ROLE_NAME" -ForegroundColor Gray
}
Write-Host ""

# Step 6: Attach Policy to Role
Write-Host "[6/6] Attaching policy to role..." -ForegroundColor Green
aws iam attach-role-policy `
    --role-name $ROLE_NAME `
    --policy-arn $POLICY_ARN

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Failed to attach policy to role" -ForegroundColor Red
    exit 1
}
Write-Host "  Policy attached successfully" -ForegroundColor Gray
Write-Host ""

# Get Role ARN
$ROLE_ARN = "arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CloudWatch Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Update your Helm values or deployment to use this service account"
Write-Host "2. Add this annotation to your service account:"
Write-Host "   eks.amazonaws.com/role-arn: $ROLE_ARN" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Deploy your application:"
Write-Host "   helm upgrade --install auth-api k8s/helm/auth-api \" -ForegroundColor Cyan
Write-Host "     --set serviceAccount.annotations.'eks\.amazonaws\.com/role-arn'=$ROLE_ARN \" -ForegroundColor Cyan
Write-Host "     --set image.repository=<YOUR_ECR_REPO> \" -ForegroundColor Cyan
Write-Host "     --set image.tag=<YOUR_IMAGE_TAG>" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. View logs in CloudWatch:"
Write-Host "   Log Group: /aws/eks/auth-api" -ForegroundColor Cyan
Write-Host "   Log Stream: application-YYYY-MM-DD" -ForegroundColor Cyan
Write-Host ""

# Cleanup temporary files
Remove-Item -Path "k8s/trust-policy.json" -ErrorAction SilentlyContinue

Write-Host "Setup script completed successfully!" -ForegroundColor Green
