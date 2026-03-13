# Create AWS Resources for EKS Deployment

Write-Host "Creating AWS Resources..." -ForegroundColor Cyan
Write-Host ""

# 1. Create ECR Repository
Write-Host "1. Creating ECR Repository..." -ForegroundColor Yellow
aws ecr create-repository --repository-name auth-api --region us-east-1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ ECR Repository created successfully" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  ECR Repository might already exist or error occurred" -ForegroundColor Yellow
}
Write-Host ""

# 2. Create DynamoDB Users Table
Write-Host "2. Creating DynamoDB Users Table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name prod-Users `
    --attribute-definitions AttributeName=userId,AttributeType=S AttributeName=email,AttributeType=S `
    --key-schema AttributeName=userId,KeyType=HASH `
    --global-secondary-indexes "IndexName=EmailIndex,KeySchema=[{AttributeName=email,KeyType=HASH}],Projection={ProjectionType=ALL},ProvisionedThroughput={ReadCapacityUnits=5,WriteCapacityUnits=5}" `
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region us-east-1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Users table created successfully" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Users table might already exist or error occurred" -ForegroundColor Yellow
}
Write-Host ""

# 3. Create DynamoDB Products Table
Write-Host "3. Creating DynamoDB Products Table..." -ForegroundColor Yellow
aws dynamodb create-table `
    --table-name prod-Products `
    --attribute-definitions AttributeName=productId,AttributeType=S `
    --key-schema AttributeName=productId,KeyType=HASH `
    --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 `
    --region us-east-1

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Products table created successfully" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Products table might already exist or error occurred" -ForegroundColor Yellow
}
Write-Host ""

# 4. Get ECR Repository URI
Write-Host "4. Getting ECR Repository URI..." -ForegroundColor Yellow
$ecrUri = aws ecr describe-repositories --repository-names auth-api --region us-east-1 --query "repositories[0].repositoryUri" --output text
Write-Host "   ECR URI: $ecrUri" -ForegroundColor Cyan
Write-Host ""

# 5. Verify Resources
Write-Host "5. Verifying Resources..." -ForegroundColor Yellow
Write-Host ""

Write-Host "   EKS Cluster:" -ForegroundColor Cyan
.\eksctl.exe get cluster --name auth-api-cluster --region us-east-1
Write-Host ""

Write-Host "   DynamoDB Tables:" -ForegroundColor Cyan
aws dynamodb list-tables --region us-east-1 --query "TableNames[?contains(@, 'prod-')]"
Write-Host ""

Write-Host "✅ All AWS resources created!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Configure GitHub Secrets (see FOLLOW-THIS.md Step 3.2)" -ForegroundColor White
Write-Host "2. Push code to development branch" -ForegroundColor White
Write-Host "3. Watch CI/CD pipeline deploy your app" -ForegroundColor White
