# Add Kubernetes tools to PATH for current session
$currentDir = Get-Location
$env:Path = "$currentDir;$env:Path"

Write-Host "✅ Tools added to PATH for this session" -ForegroundColor Green
Write-Host ""
Write-Host "Verifying installations:" -ForegroundColor Cyan
Write-Host "------------------------" -ForegroundColor Cyan

Write-Host -NoNewline "AWS CLI:  "
aws --version

Write-Host -NoNewline "kubectl:  "
kubectl version --client --short 2>$null

Write-Host -NoNewline "eksctl:   "
eksctl version

Write-Host -NoNewline "Helm:     "
helm version --short

Write-Host ""
Write-Host "✅ All tools ready! You can now create your EKS cluster." -ForegroundColor Green
Write-Host ""
Write-Host "Next step: Run the following command to create your cluster:" -ForegroundColor Yellow
Write-Host "eksctl create cluster --name auth-api-cluster --region us-east-1 --nodegroup-name auth-api-nodes --node-type t3.medium --nodes 2 --managed" -ForegroundColor White
