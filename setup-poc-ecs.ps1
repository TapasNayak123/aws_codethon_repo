# =============================================================================
# POC ECS Fargate - Full Setup Script
# =============================================================================
# This script creates all AWS resources needed for the POC ECS Fargate deployment:
#   - ECS Cluster (Fargate)
#   - IAM Roles (execution + task)
#   - VPC with public subnets (or uses default VPC)
#   - Application Load Balancer
#   - ECS Service + Task Definition
#   - ECR Repository
#   - DynamoDB Tables
#
# Prerequisites:
#   1. AWS CLI configured with credentials that have admin access
#   2. Set environment variables: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
#      For SSO: also set AWS_SESSION_TOKEN
#
# Run: .\setup-poc-ecs.ps1
# =============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  POC ECS Fargate - Full Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------
# STEP 0: Verify AWS identity
# ---------------------------------------------------------
Write-Host "STEP 0: Verifying AWS account..." -ForegroundColor Yellow
$identity = aws sts get-caller-identity --output json | ConvertFrom-Json
$ACCOUNT_ID = $identity.Account
Write-Host "  Account ID : $ACCOUNT_ID" -ForegroundColor Cyan
Write-Host "  User/Role  : $($identity.Arn)" -ForegroundColor Cyan
Write-Host ""

$confirm = Read-Host "Is this your POC AWS account? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Aborted. Configure the correct credentials first." -ForegroundColor Red
    exit 1
}

$REGION = Read-Host "Enter AWS region for POC (default: ap-south-1)"
if ([string]::IsNullOrWhiteSpace($REGION)) { $REGION = "ap-south-1" }

Write-Host ""
Write-Host "Using region: $REGION" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------
# STEP 1: Create ECR Repository
# ---------------------------------------------------------
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  STEP 1: Create ECR Repository" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""

aws ecr create-repository --repository-name auth-api --region $REGION 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ECR repository 'auth-api' created." -ForegroundColor Green
} else {
    Write-Host "  ECR repository already exists." -ForegroundColor Yellow
}

$ecrUri = aws ecr describe-repositories --repository-names auth-api --region $REGION --query "repositories[0].repositoryUri" --output text
Write-Host "  ECR URI: $ecrUri" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------
# STEP 2: Create DynamoDB Tables
# ---------------------------------------------------------
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  STEP 2: Create DynamoDB Tables" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""

# Users table
Write-Host "  Creating poc-Users table..." -ForegroundColor Cyan
aws dynamodb create-table `
    --table-name poc-Users `
    --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=email,AttributeType=S `
    --key-schema AttributeName=userId,KeyType=HASH `
    --global-secondary-indexes "IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" `
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region $REGION 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  poc-Users table created." -ForegroundColor Green
} else {
    Write-Host "  poc-Users table already exists." -ForegroundColor Yellow
}

# Products table
Write-Host "  Creating poc-Products table..." -ForegroundColor Cyan
aws dynamodb create-table `
    --table-name poc-Products `
    --attribute-definitions AttributeName=productId,AttributeType=S `
    --key-schema AttributeName=productId,KeyType=HASH `
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region $REGION 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  poc-Products table created." -ForegroundColor Green
} else {
    Write-Host "  poc-Products table already exists." -ForegroundColor Yellow
}

Write-Host ""

# ---------------------------------------------------------
# STEP 3: Get Default VPC and Subnets
# ---------------------------------------------------------
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  STEP 3: Get VPC and Subnets" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""

$VPC_ID = aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" --region $REGION --query "Vpcs[0].VpcId" --output text
if ([string]::IsNullOrWhiteSpace($VPC_ID) -or $VPC_ID -eq "None") {
    Write-Host "  No default VPC found. Creating one..." -ForegroundColor Yellow
    $VPC_ID = aws ec2 create-default-vpc --region $REGION --query "Vpc.VpcId" --output text
}
Write-Host "  VPC ID: $VPC_ID" -ForegroundColor Cyan

$SUBNETS = aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" --region $REGION --query "Subnets[*].SubnetId" --output text
$SUBNET_LIST = $SUBNETS -split "\s+"
Write-Host "  Subnets: $($SUBNET_LIST -join ', ')" -ForegroundColor Cyan
Write-Host ""

# ---------------------------------------------------------
# STEP 4: Create Security Groups
# ---------------------------------------------------------
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  STEP 4: Create Security Groups" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""

# ALB Security Group
$ALB_SG_ID = aws ec2 describe-security-groups --filters "Name=group-name,Values=auth-api-poc-alb-sg" "Name=vpc-id,Values=$VPC_ID" --region $REGION --query "SecurityGroups[0].GroupId" --output text 2>$null
if ([string]::IsNullOrWhiteSpace($ALB_SG_ID) -or $ALB_SG_ID -eq "None") {
    Write-Host "  Creating ALB security group..." -ForegroundColor Cyan
    $ALB_SG_ID = aws ec2 create-security-group `
        --group-name auth-api-poc-alb-sg `
        --description "ALB security group for auth-api POC" `
        --vpc-id $VPC_ID `
        --region $REGION `
        --query "GroupId" --output text

    aws ec2 authorize-security-group-ingress --group-id $ALB_SG_ID --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $REGION 2>$null
    Write-Host "  ALB SG created: $ALB_SG_ID" -ForegroundColor Green
} else {
    Write-Host "  ALB SG already exists: $ALB_SG_ID" -ForegroundColor Yellow
}

# ECS Task Security Group
$ECS_SG_ID = aws ec2 describe-security-groups --filters "Name=group-name,Values=auth-api-poc-ecs-sg" "Name=vpc-id,Values=$VPC_ID" --region $REGION --query "SecurityGroups[0].GroupId" --output text 2>$null
if ([string]::IsNullOrWhiteSpace($ECS_SG_ID) -or $ECS_SG_ID -eq "None") {
    Write-Host "  Creating ECS task security group..." -ForegroundColor Cyan
    $ECS_SG_ID = aws ec2 create-security-group `
        --group-name auth-api-poc-ecs-sg `
        --description "ECS task security group for auth-api POC" `
        --vpc-id $VPC_ID `
        --region $REGION `
        --query "GroupId" --output text

    aws ec2 authorize-security-group-ingress --group-id $ECS_SG_ID --protocol tcp --port 3000 --source-group $ALB_SG_ID --region $REGION 2>$null
    Write-Host "  ECS SG created: $ECS_SG_ID" -ForegroundColor Green
} else {
    Write-Host "  ECS SG already exists: $ECS_SG_ID" -ForegroundColor Yellow
}

Write-Host ""

# ---------------------------------------------------------
# STEP 5: Create IAM Roles
# ---------------------------------------------------------
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  STEP 5: Create IAM Roles" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""

# ECS Task Execution Role (pulls images from ECR, writes logs)
$execRoleExists = aws iam get-role --role-name auth-api-poc-execution-role --query "Role.Arn" --output text 2>$null
if ([string]::IsNullOrWhiteSpace($execRoleExists) -or $LASTEXITCODE -ne 0) {
    Write-Host "  Creating ECS execution role..." -ForegroundColor Cyan

    $execTrustPolicy = @'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }
  ]
}
'@
    $execTrustPolicy | Set-Content -Path "exec-trust-policy.json" -Encoding UTF8

    aws iam create-role `
        --role-name auth-api-poc-execution-role `
        --assume-role-policy-document file://exec-trust-policy.json `
        --description "ECS task execution role for auth-api POC"

    aws iam attach-role-policy `
        --role-name auth-api-poc-execution-role `
        --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy

    Remove-Item exec-trust-policy.json -ErrorAction SilentlyContinue
    Write-Host "  Execution role created." -ForegroundColor Green
} else {
    Write-Host "  Execution role already exists." -ForegroundColor Yellow
}

# ECS Task Role (app permissions: DynamoDB, CloudWatch)
$taskRoleExists = aws iam get-role --role-name auth-api-poc-task-role --query "Role.Arn" --output text 2>$null
if ([string]::IsNullOrWhiteSpace($taskRoleExists) -or $LASTEXITCODE -ne 0) {
    Write-Host "  Creating ECS task role..." -ForegroundColor Cyan

    $taskTrustPolicy = @'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {"Service": "ecs-tasks.amazonaws.com"},
      "Action": "sts:AssumeRole"
    }
  ]
}
'@
    $taskTrustPolicy | Set-Content -Path "task-trust-policy.json" -Encoding UTF8

    aws iam create-role `
        --role-name auth-api-poc-task-role `
        --assume-role-policy-document file://task-trust-policy.json `
        --description "ECS task role for auth-api POC"

    aws iam attach-role-policy `
        --role-name auth-api-poc-task-role `
        --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess

    aws iam attach-role-policy `
        --role-name auth-api-poc-task-role `
        --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess

    Remove-Item task-trust-policy.json -ErrorAction SilentlyContinue
    Write-Host "  Task role created." -ForegroundColor Green
} else {
    Write-Host "  Task role already exists." -ForegroundColor Yellow
}

Write-Host ""

# ---------------------------------------------------------
# STEP 6: Create Application Load Balancer
# ---------------------------------------------------------
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  STEP 6: Create Application Load Balancer" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""

# Check if ALB exists
$ALB_ARN = aws elbv2 describe-load-balancers --names auth-api-poc-alb --region $REGION --query "LoadBalancers[0].LoadBalancerArn" --output text 2>$null
if ([string]::IsNullOrWhiteSpace($ALB_ARN) -or $ALB_ARN -eq "None" -or $LASTEXITCODE -ne 0) {
    Write-Host "  Creating ALB..." -ForegroundColor Cyan
    $subnetArgs = ($SUBNET_LIST | ForEach-Object { $_ }) -join " "
    $ALB_ARN = aws elbv2 create-load-balancer `
        --name auth-api-poc-alb `
        --subnets $SUBNET_LIST `
        --security-groups $ALB_SG_ID `
        --scheme internet-facing `
        --type application `
        --region $REGION `
        --query "LoadBalancers[0].LoadBalancerArn" --output text
    Write-Host "  ALB created: $ALB_ARN" -ForegroundColor Green
} else {
    Write-Host "  ALB already exists: $ALB_ARN" -ForegroundColor Yellow
}

$ALB_DNS = aws elbv2 describe-load-balancers --load-balancer-arns $ALB_ARN --region $REGION --query "LoadBalancers[0].DNSName" --output text
Write-Host "  ALB DNS: $ALB_DNS" -ForegroundColor Cyan

# Create Target Group
$TG_ARN = aws elbv2 describe-target-groups --names auth-api-poc-tg --region $REGION --query "TargetGroups[0].TargetGroupArn" --output text 2>$null
if ([string]::IsNullOrWhiteSpace($TG_ARN) -or $TG_ARN -eq "None" -or $LASTEXITCODE -ne 0) {
    Write-Host "  Creating target group..." -ForegroundColor Cyan
    $TG_ARN = aws elbv2 create-target-group `
        --name auth-api-poc-tg `
        --protocol HTTP `
        --port 3000 `
        --vpc-id $VPC_ID `
        --target-type ip `
        --health-check-path /api/health `
        --health-check-interval-seconds 30 `
        --health-check-timeout-seconds 5 `
        --healthy-threshold-count 2 `
        --unhealthy-threshold-count 3 `
        --region $REGION `
        --query "TargetGroups[0].TargetGroupArn" --output text
    Write-Host "  Target group created: $TG_ARN" -ForegroundColor Green
} else {
    Write-Host "  Target group already exists: $TG_ARN" -ForegroundColor Yellow
}

# Create Listener
$LISTENER_ARN = aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --region $REGION --query "Listeners[0].ListenerArn" --output text 2>$null
if ([string]::IsNullOrWhiteSpace($LISTENER_ARN) -or $LISTENER_ARN -eq "None" -or $LASTEXITCODE -ne 0) {
    Write-Host "  Creating listener..." -ForegroundColor Cyan
    aws elbv2 create-listener `
        --load-balancer-arn $ALB_ARN `
        --protocol HTTP `
        --port 80 `
        --default-actions Type=forward,TargetGroupArn=$TG_ARN `
        --region $REGION
    Write-Host "  Listener created (HTTP:80 -> Target Group)." -ForegroundColor Green
} else {
    Write-Host "  Listener already exists." -ForegroundColor Yellow
}

Write-Host ""

# ---------------------------------------------------------
# STEP 7: Create ECS Cluster
# ---------------------------------------------------------
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  STEP 7: Create ECS Cluster" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""

aws ecs create-cluster --cluster-name auth-api-poc-cluster --region $REGION 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ECS cluster 'auth-api-poc-cluster' created." -ForegroundColor Green
} else {
    Write-Host "  ECS cluster already exists." -ForegroundColor Yellow
}

Write-Host ""

# ---------------------------------------------------------
# STEP 8: Create CloudWatch Log Group
# ---------------------------------------------------------
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  STEP 8: Create CloudWatch Log Group" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""

aws logs create-log-group --log-group-name /ecs/auth-api-poc --region $REGION 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  Log group '/ecs/auth-api-poc' created." -ForegroundColor Green
} else {
    Write-Host "  Log group already exists." -ForegroundColor Yellow
}
aws logs put-retention-policy --log-group-name /ecs/auth-api-poc --retention-in-days 30 --region $REGION

Write-Host ""

# ---------------------------------------------------------
# STEP 9: Register Task Definition & Create Service
# ---------------------------------------------------------
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host "  STEP 9: Register Task Definition & Create Service" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow
Write-Host ""

# Generate JWT Secret
$JWT_SECRET = node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
Write-Host "  Generated JWT Secret: $JWT_SECRET" -ForegroundColor Cyan

# Register initial task definition with placeholder image
$taskDefJson = @"
{
  "family": "auth-api-poc-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/auth-api-poc-execution-role",
  "taskRoleArn": "arn:aws:iam::${ACCOUNT_ID}:role/auth-api-poc-task-role",
  "containerDefinitions": [
    {
      "name": "auth-api",
      "image": "${ecrUri}:poc-latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {"name": "NODE_ENV", "value": "production"},
        {"name": "PORT", "value": "3000"},
        {"name": "AWS_REGION", "value": "$REGION"},
        {"name": "DYNAMODB_USERS_TABLE", "value": "poc-Users"},
        {"name": "DYNAMODB_PRODUCTS_TABLE", "value": "poc-Products"},
        {"name": "JWT_SECRET", "value": "$JWT_SECRET"},
        {"name": "JWT_EXPIRATION", "value": "1h"},
        {"name": "RATE_LIMIT_WINDOW_MS", "value": "900000"},
        {"name": "RATE_LIMIT_MAX_REQUESTS", "value": "200"},
        {"name": "LOG_LEVEL", "value": "info"}
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/auth-api-poc",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "node -e \"require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})\" || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      }
    }
  ]
}
"@

$taskDefJson | Set-Content -Path "task-definition.json" -Encoding UTF8

Write-Host "  Registering task definition..." -ForegroundColor Cyan
aws ecs register-task-definition --cli-input-json file://task-definition.json --region $REGION | Out-Null
Write-Host "  Task definition registered." -ForegroundColor Green

# Create ECS Service
$serviceExists = aws ecs describe-services --cluster auth-api-poc-cluster --services auth-api-poc-service --region $REGION --query "services[?status=='ACTIVE'].serviceName" --output text 2>$null
if ([string]::IsNullOrWhiteSpace($serviceExists)) {
    Write-Host "  Creating ECS service..." -ForegroundColor Cyan

    $networkConfig = "awsvpcConfiguration={subnets=[$($SUBNET_LIST -join ',')],securityGroups=[$ECS_SG_ID],assignPublicIp=ENABLED}"

    aws ecs create-service `
        --cluster auth-api-poc-cluster `
        --service-name auth-api-poc-service `
        --task-definition auth-api-poc-task `
        --desired-count 1 `
        --launch-type FARGATE `
        --network-configuration $networkConfig `
        --load-balancers "targetGroupArn=$TG_ARN,containerName=auth-api,containerPort=3000" `
        --region $REGION | Out-Null

    Write-Host "  ECS service created." -ForegroundColor Green
} else {
    Write-Host "  ECS service already exists." -ForegroundColor Yellow
}

Remove-Item task-definition.json -ErrorAction SilentlyContinue
Write-Host ""

# ---------------------------------------------------------
# STEP 10: Summary - GitHub Secrets to Configure
# ---------------------------------------------------------
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  STEP 10: Configure GitHub Secrets" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Go to: GitHub repo -> Settings -> Secrets and variables -> Actions" -ForegroundColor White
Write-Host "  Click 'New repository secret' for each:" -ForegroundColor White
Write-Host ""
Write-Host "  Secret Name                        Value" -ForegroundColor Cyan
Write-Host "  -----------------------------------  -----------------------------------------------" -ForegroundColor Cyan
Write-Host "  POC_AWS_ACCESS_KEY_ID              (your IAM access key ID)" -ForegroundColor White
Write-Host "  POC_AWS_SECRET_ACCESS_KEY           (your IAM secret access key)" -ForegroundColor White
Write-Host "  POC_AWS_REGION                      $REGION" -ForegroundColor White
Write-Host "  POC_JWT_SECRET                      $JWT_SECRET" -ForegroundColor White
Write-Host "  POC_DYNAMODB_USERS_TABLE            poc-Users" -ForegroundColor White
Write-Host "  POC_DYNAMODB_PRODUCTS_TABLE         poc-Products" -ForegroundColor White
Write-Host ""

# ---------------------------------------------------------
# STEP 11: GitHub Environment + Branch
# ---------------------------------------------------------
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  STEP 11: Create GitHub Environment & Branch" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  1. Go to: GitHub repo -> Settings -> Environments -> New environment" -ForegroundColor White
Write-Host "     Name: poc" -ForegroundColor Cyan
Write-Host ""
Write-Host "  2. Create and push the poc branch:" -ForegroundColor White
Write-Host "     git checkout -b poc" -ForegroundColor Cyan
Write-Host "     git push origin poc" -ForegroundColor Cyan
Write-Host ""
Write-Host "  This triggers the GitHub Actions pipeline which will:" -ForegroundColor White
Write-Host "    1. Run security scans" -ForegroundColor White
Write-Host "    2. Run tests" -ForegroundColor White
Write-Host "    3. Build Docker image -> push to ECR ($ecrUri)" -ForegroundColor White
Write-Host "    4. Deploy to ECS Fargate" -ForegroundColor White
Write-Host "    5. Run smoke tests" -ForegroundColor White
Write-Host "    6. Post-deployment validation" -ForegroundColor White
Write-Host ""

# ---------------------------------------------------------
# DONE
# ---------------------------------------------------------
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "  AWS Resources Created:" -ForegroundColor White
Write-Host "    - ECS Cluster    : auth-api-poc-cluster (Fargate)" -ForegroundColor Cyan
Write-Host "    - ALB            : auth-api-poc-alb" -ForegroundColor Cyan
Write-Host "    - ECR Repository : $ecrUri" -ForegroundColor Cyan
Write-Host "    - DynamoDB       : poc-Users, poc-Products" -ForegroundColor Cyan
Write-Host "    - IAM Roles      : auth-api-poc-execution-role, auth-api-poc-task-role" -ForegroundColor Cyan
Write-Host "    - Log Group      : /ecs/auth-api-poc" -ForegroundColor Cyan
Write-Host ""
Write-Host "  POC URL: http://$ALB_DNS" -ForegroundColor Green
Write-Host ""
Write-Host "  Remaining Manual Steps:" -ForegroundColor Yellow
Write-Host "    1. Add 6 GitHub Secrets (see Step 10 above)" -ForegroundColor White
Write-Host "    2. Create 'poc' GitHub Environment (see Step 11)" -ForegroundColor White
Write-Host "    3. Push 'poc' branch (see Step 11)" -ForegroundColor White
Write-Host ""
