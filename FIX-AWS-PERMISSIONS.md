# Fix AWS Permissions for EKS

## Problem
Your IAM user `aws_codethon` doesn't have permission to create EKS clusters.

Error: `User: arn:aws:iam::551494044780:user/aws_codethon is not authorized to perform: eks:DescribeClusterVersions`

---

## Solution: Add EKS Permissions

### Option 1: Use AWS Console (Easiest)

1. **Login to AWS Console**: https://console.aws.amazon.com/
2. **Go to IAM**: Search for "IAM" in the top search bar
3. **Click "Users"** in the left sidebar
4. **Click on your user**: `aws_codethon`
5. **Click "Add permissions"** button
6. **Click "Attach policies directly"**
7. **Search and select these policies**:
   - `AmazonEKSClusterPolicy` (for EKS cluster management)
   - `AmazonEKSServicePolicy` (for EKS service operations)
   - `AmazonEC2FullAccess` (for creating EC2 nodes)
   - `IAMFullAccess` (for creating IAM roles for EKS)
   - `AmazonVPCFullAccess` (for networking)
8. **Click "Next"** then **"Add permissions"**

### Option 2: Use AWS CLI (Faster)

Run these commands:

```bash
# Attach EKS Cluster Policy
aws iam attach-user-policy --user-name aws_codethon --policy-arn arn:aws:iam::aws:policy/AmazonEKSClusterPolicy

# Attach EKS Service Policy
aws iam attach-user-policy --user-name aws_codethon --policy-arn arn:aws:iam::aws:policy/AmazonEKSServicePolicy

# Attach EC2 Full Access
aws iam attach-user-policy --user-name aws_codethon --policy-arn arn:aws:iam::aws:policy/AmazonEC2FullAccess

# Attach IAM Full Access
aws iam attach-user-policy --user-name aws_codethon --policy-arn arn:aws:iam::aws:policy/IAMFullAccess

# Attach VPC Full Access
aws iam attach-user-policy --user-name aws_codethon --policy-arn arn:aws:iam::aws:policy/AmazonVPCFullAccess
```

### Option 3: Create Custom Policy (Most Secure)

If you want minimal permissions, create this custom policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "eks:*",
        "ec2:*",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:PutRolePolicy",
        "iam:PassRole",
        "iam:GetRole",
        "iam:ListAttachedRolePolicies",
        "cloudformation:*",
        "autoscaling:*"
      ],
      "Resource": "*"
    }
  ]
}
```

---

## After Adding Permissions

Wait 1-2 minutes for permissions to propagate, then retry:

```powershell
eksctl create cluster --name auth-api-cluster --region us-east-1 --nodegroup-name auth-api-nodes --node-type t3.medium --nodes 2 --managed
```

---

## Alternative: Use Administrator Access (Quick Test)

If you just want to test quickly, attach `AdministratorAccess` policy:

```bash
aws iam attach-user-policy --user-name aws_codethon --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
```

**Warning**: This gives full access to everything. Remove it after testing.

---

## Verify Permissions

After adding permissions, verify:

```bash
aws sts get-caller-identity
# Should show your user

aws eks describe-cluster-versions --region us-east-1
# Should return cluster versions (not an error)
```

---

## Need Help?

If you don't have access to AWS Console or can't run IAM commands, ask your AWS administrator to add these permissions to your `aws_codethon` user.
