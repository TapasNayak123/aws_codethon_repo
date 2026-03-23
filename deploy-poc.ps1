# =============================================================================
# POC Deploy Script - Build, Push to ECR, Deploy to ECS Fargate
# =============================================================================
# Run this after refreshing your SSO credentials from the AWS access portal.
#
# Prerequisites:
#   1. Docker Desktop running
#   2. AWS CLI configured with SSO credentials (set env vars first)
#   3. Node.js installed (for tests)
#
# Usage:
#   1. Go to AWS SSO portal, click "Get credentials" for POC account
#   2. Copy the PowerShell env vars and paste in terminal
#   3. Run: .\deploy-poc.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

$REGION = "ap-south-1"
$ACCOUNT_ID = "127214194014"
$ECR_REPO = "auth-api"
$ECR_URI = "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com/$ECR_REPO"
$CLUSTER = "auth-api-poc-cluster"
$SERVICE = "auth-api-poc-service"
$TASK_FAMILY = "auth-api-poc-task"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  POC Deploy - Build & Deploy to ECS Fargate" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------
# STEP 1: Verify AWS credentials
# ---------------------------------------------------------
Write-Host "STEP 1: Verifying AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --output json 2>&1 | ConvertFrom-Json
    Write-Host "  Account: $($identity.Account)" -ForegroundColor Cyan
    Write-Host "  Role: $($identity.Arn)" -ForegroundColor Cyan
} catch {
    Write-Host "  ERROR: AWS credentials expired or not set!" -ForegroundColor Red
    Write-Host "  Go to AWS SSO portal -> Get credentials -> Copy PowerShell env vars" -ForegroundColor Yellow
    Write-Host "  Paste them in this terminal, then run this script again." -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# ---------------------------------------------------------
# STEP 2: Run tests
# ---------------------------------------------------------
Write-Host "STEP 2: Running tests..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Tests failed! Fix them before deploying." -ForegroundColor Red
    exit 1
}
Write-Host "  Tests passed." -ForegroundColor Green
Write-Host ""

# ---------------------------------------------------------
# STEP 3: Login to ECR
# ---------------------------------------------------------
Write-Host "STEP 3: Logging in to ECR..." -ForegroundColor Yellow
$ecrPassword = aws ecr get-login-password --region $REGION
$ecrPassword | docker login --username AWS --password-stdin "$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ECR login failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  ECR login successful." -ForegroundColor Green
Write-Host ""

# ---------------------------------------------------------
# STEP 4: Build Docker image
# ---------------------------------------------------------
$GIT_SHA = git rev-parse --short HEAD
$IMAGE_TAG = "poc-$GIT_SHA"

Write-Host "STEP 4: Building Docker image..." -ForegroundColor Yellow
Write-Host "  Tag: $IMAGE_TAG" -ForegroundColor Cyan
docker build --build-arg NODE_ENV=production -t "${ECR_URI}:${IMAGE_TAG}" -t "${ECR_URI}:poc-latest" .
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Docker build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  Build successful." -ForegroundColor Green
Write-Host ""

# ---------------------------------------------------------
# STEP 5: Push to ECR
# ---------------------------------------------------------
Write-Host "STEP 5: Pushing image to ECR..." -ForegroundColor Yellow
docker push "${ECR_URI}:${IMAGE_TAG}"
docker push "${ECR_URI}:poc-latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  Push successful." -ForegroundColor Green
Write-Host ""

# ---------------------------------------------------------
# STEP 6: Update ECS task definition with new image
# ---------------------------------------------------------
Write-Host "STEP 6: Registering new task definition..." -ForegroundColor Yellow

# Get current task def and update the image
$currentTaskDef = aws ecs describe-task-definition --task-definition $TASK_FAMILY --region $REGION --query "taskDefinition" --output json | ConvertFrom-Json

# Build new container definition with updated image
$containerDefs = $currentTaskDef.containerDefinitions | ForEach-Object {
    $_.image = "${ECR_URI}:${IMAGE_TAG}"
    $_
}

$containerDefsJson = $containerDefs | ConvertTo-Json -Depth 10 -Compress

# Register new task definition
Set-Content -Path "_task-def-temp.json" -Value $containerDefsJson -Encoding ASCII

$newTaskDefArn = aws ecs register-task-definition `
    --family $TASK_FAMILY `
    --network-mode awsvpc `
    --requires-compatibilities FARGATE `
    --cpu $currentTaskDef.cpu `
    --memory $currentTaskDef.memory `
    --execution-role-arn $currentTaskDef.executionRoleArn `
    --task-role-arn $currentTaskDef.taskRoleArn `
    --container-definitions file://_task-def-temp.json `
    --region $REGION `
    --query "taskDefinition.taskDefinitionArn" --output text

Remove-Item _task-def-temp.json -ErrorAction SilentlyContinue

Write-Host "  New task definition: $newTaskDefArn" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------
# STEP 7: Update ECS service
# ---------------------------------------------------------
Write-Host "STEP 7: Updating ECS service..." -ForegroundColor Yellow
aws ecs update-service `
    --cluster $CLUSTER `
    --service $SERVICE `
    --task-definition $newTaskDefArn `
    --force-new-deployment `
    --region $REGION | Out-Null

Write-Host "  Service update triggered." -ForegroundColor Green
Write-Host ""

# ---------------------------------------------------------
# STEP 8: Wait for deployment
# ---------------------------------------------------------
Write-Host "STEP 8: Waiting for deployment to stabilize..." -ForegroundColor Yellow
Write-Host "  This may take 2-5 minutes..." -ForegroundColor Cyan

aws ecs wait services-stable --cluster $CLUSTER --services $SERVICE --region $REGION 2>$null

$serviceInfo = aws ecs describe-services --cluster $CLUSTER --services $SERVICE --region $REGION --query "services[0].{Running:runningCount,Desired:desiredCount}" --output json | ConvertFrom-Json

Write-Host "  Running: $($serviceInfo.Running) / Desired: $($serviceInfo.Desired)" -ForegroundColor Cyan

if ($serviceInfo.Running -ge $serviceInfo.Desired) {
    Write-Host "  Deployment successful!" -ForegroundColor Green
} else {
    Write-Host "  Warning: Not all tasks running yet. Check ECS console." -ForegroundColor Yellow
}
Write-Host ""

# ---------------------------------------------------------
# STEP 9: Smoke test
# ---------------------------------------------------------
$ALB_DNS = aws elbv2 describe-load-balancers --names auth-api-poc-alb --region $REGION --query "LoadBalancers[0].DNSName" --output text
$POC_URL = "http://$ALB_DNS"

Write-Host "STEP 9: Running smoke test..." -ForegroundColor Yellow
Write-Host "  URL: $POC_URL" -ForegroundColor Cyan

Start-Sleep -Seconds 10

$retries = 0
$maxRetries = 6
$success = $false

while ($retries -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri "$POC_URL/api/health" -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $success = $true
            break
        }
    } catch {
        $retries++
        Write-Host "  Attempt $retries/$maxRetries - waiting 15s..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
    }
}

Write-Host ""
if ($success) {
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host "  DEPLOYMENT COMPLETE!" -ForegroundColor Green
    Write-Host "=============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "  POC URL: $POC_URL" -ForegroundColor Cyan
    Write-Host "  Health:  $POC_URL/api/health" -ForegroundColor Cyan
    Write-Host "  Image:   ${ECR_URI}:${IMAGE_TAG}" -ForegroundColor Cyan
} else {
    Write-Host "=============================================" -ForegroundColor Yellow
    Write-Host "  DEPLOYED (health check pending)" -ForegroundColor Yellow
    Write-Host "=============================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  POC URL: $POC_URL" -ForegroundColor Cyan
    Write-Host "  The service is starting up. Try the health" -ForegroundColor Yellow
    Write-Host "  endpoint in a minute: $POC_URL/api/health" -ForegroundColor Yellow
}
Write-Host ""
