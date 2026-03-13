# AWS EKS Deployment - Summary

## What Was Created

### Documentation
1. **K8S-DEPLOYMENT-GUIDE.md** - Complete step-by-step deployment guide (10 steps)
2. **k8s/QUICKSTART.md** - Quick start guide with automated and manual options
3. **K8S-DEPLOYMENT-SUMMARY.md** - This summary document

### Helm Chart Files
```
k8s/helm/auth-api/
├── Chart.yaml                      # Helm chart metadata
├── values.yaml                     # Default configuration values
└── templates/
    ├── _helpers.tpl                # Template helper functions
    ├── deployment.yaml             # Kubernetes Deployment
    ├── service.yaml                # Kubernetes Service (LoadBalancer)
    ├── hpa.yaml                    # Horizontal Pod Autoscaler
    ├── ingress.yaml                # Ingress (optional, for ALB)
    ├── serviceaccount.yaml         # Service Account
    ├── configmap.yaml              # ConfigMap for env vars
    └── pdb.yaml                    # Pod Disruption Budget
```

### Configuration Files
1. **k8s/eks-cluster-config.yaml** - EKS cluster configuration for eksctl
2. **k8s/deploy.sh** - Automated deployment script (Bash)
3. **k8s/deploy.ps1** - Automated deployment script (PowerShell for Windows)

---

## Deployment Architecture

```
+------------------------------------------------------------------+
|                         AWS Cloud                                |
|  +------------------------------------------------------------+  |
|  |                      EKS Cluster                           |  |
|  |  +------------------------------------------------------+  |  |
|  |  |                   Kubernetes                         |  |  |
|  |  |  +----------------+      +------------------------+  |  |  |
|  |  |  | Load Balancer  | ---> |   Auth API Service     |  |  |  |
|  |  |  | (AWS ELB)      |      |   (3 replicas)         |  |  |  |
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

---

## Key Features

### High Availability
- **3 replicas** by default
- **Pod anti-affinity** rules to spread pods across nodes
- **Pod Disruption Budget** ensures minimum availability during updates
- **Health checks** (liveness and readiness probes)

### Auto-Scaling
- **Horizontal Pod Autoscaler** (2-10 replicas)
- **CPU-based scaling** (70% threshold)
- **Memory-based scaling** (80% threshold)
- **Cluster Autoscaler** support via EKS managed node groups

### Security
- **Secrets management** via Kubernetes Secrets
- **Pod security context** (non-root user)
- **Container security context** (no privilege escalation)
- **Service account** with IAM role support (OIDC)
- **Network policies** ready

### Monitoring & Logging
- **Health check endpoint** at `/api/health`
- **CloudWatch integration** for cluster logs
- **Prometheus-ready** metrics
- **Structured logging** to stdout

---

## Quick Start Options

### Option 1: Automated Deployment (Recommended)

**Windows (PowerShell):**
```powershell
.\k8s\deploy.ps1
```

**Linux/Mac (Bash):**
```bash
chmod +x k8s/deploy.sh
./k8s/deploy.sh
```

### Option 2: Manual Deployment

Follow the step-by-step guide in `K8S-DEPLOYMENT-GUIDE.md`

### Option 3: Quick Manual Commands

```bash
# 1. Set variables
export AWS_REGION=us-east-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# 2. Create ECR and push image
aws ecr create-repository --repository-name auth-api --region $AWS_REGION
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
docker build -t auth-api:latest .
docker tag auth-api:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/auth-api:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/auth-api:latest

# 3. Create EKS cluster
eksctl create cluster -f k8s/eks-cluster-config.yaml
aws eks update-kubeconfig --name auth-api-cluster --region $AWS_REGION

# 4. Create secrets
kubectl create secret generic auth-api-secrets \
  --from-literal=JWT_SECRET=your-jwt-secret \
  --from-literal=AWS_ACCESS_KEY_ID=your-access-key \
  --from-literal=AWS_SECRET_ACCESS_KEY=your-secret-key \
  --from-literal=AWS_REGION=us-east-1 \
  --from-literal=DYNAMODB_USERS_TABLE=prod-Users \
  --from-literal=DYNAMODB_PRODUCTS_TABLE=prod-Products

# 5. Deploy with Helm
helm install auth-api k8s/helm/auth-api \
  --set image.repository=$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/auth-api \
  --set image.tag=latest

# 6. Get service URL
kubectl get service auth-api-service
```

---

## Configuration Options

### Helm Values (values.yaml)

**Image Configuration:**
```yaml
image:
  repository: <your-ecr-repo>
  tag: latest
  pullPolicy: Always
```

**Scaling:**
```yaml
replicaCount: 3
autoscaling:
  enabled: true
  minReplicas: 2
  maxReplicas: 10
  targetCPUUtilizationPercentage: 70
```

**Resources:**
```yaml
resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi
```

**Service Type:**
```yaml
service:
  type: LoadBalancer  # or ClusterIP with Ingress
  port: 80
  targetPort: 3000
```

---

## Common Operations

### View Application Status
```bash
kubectl get all
kubectl get pods -l app=auth-api
kubectl logs -l app=auth-api --tail=100
```

### Scale Application
```bash
kubectl scale deployment auth-api --replicas=5
```

### Update Application
```bash
# Build and push new version
docker build -t auth-api:v2 .
docker tag auth-api:v2 $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/auth-api:v2
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/auth-api:v2

# Upgrade with Helm
helm upgrade auth-api k8s/helm/auth-api --set image.tag=v2
```

### Rollback
```bash
helm rollback auth-api
```

### View Logs
```bash
kubectl logs -l app=auth-api -f
```

---

## Cost Estimate

**Monthly costs (us-east-1):**
- EKS Control Plane: $73
- EC2 Instances (2x t3.medium): ~$60
- Load Balancer: ~$20
- Data Transfer: Variable
- DynamoDB: Pay per request

**Total: ~$150-200/month**

**Cost Optimization:**
- Use Spot Instances for non-production
- Enable Cluster Autoscaler
- Use Fargate for serverless option
- Right-size instance types

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
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

### DynamoDB Connection Issues
```bash
kubectl exec <pod-name> -- env | grep DYNAMODB
kubectl logs <pod-name> | grep -i dynamodb
```

---

## Next Steps

1. **CI/CD Pipeline**: Set up GitHub Actions or Jenkins
2. **Monitoring**: Install Prometheus and Grafana
3. **Logging**: Configure CloudWatch or ELK stack
4. **Alerting**: Set up CloudWatch Alarms
5. **Custom Domain**: Configure Route 53 and ACM
6. **HTTPS**: Enable TLS with ACM certificates
7. **Staging Environment**: Create separate cluster
8. **Backup Strategy**: Configure DynamoDB backups

---

## Useful Resources

- **AWS EKS Documentation**: https://docs.aws.amazon.com/eks/
- **Helm Documentation**: https://helm.sh/docs/
- **kubectl Cheat Sheet**: https://kubernetes.io/docs/reference/kubectl/cheatsheet/
- **eksctl Documentation**: https://eksctl.io/

---

## Support

For issues or questions:
1. Check `K8S-DEPLOYMENT-GUIDE.md` for detailed instructions
2. Check `k8s/QUICKSTART.md` for quick reference
3. Review troubleshooting section above
4. Check AWS CloudWatch logs
5. Review Kubernetes events: `kubectl get events`

---

**Ready to deploy!** Choose your deployment method and follow the guide.
