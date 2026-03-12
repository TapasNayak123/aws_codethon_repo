# GitHub Setup Guide

Complete guide to add your codebase to GitHub for the first time.

---

## 🎯 Quick Start (5 Minutes)

### Prerequisites
- GitHub account (create at https://github.com)
- Git installed (`git --version` to check)

### Security Status: ✅ SAFE
Your `.env` file with AWS credentials will NOT be uploaded (protected by `.gitignore`)

---

## 📋 Step-by-Step Instructions

### Step 1: Initialize Git Repository

```bash
# Navigate to your project directory
cd "D:\Ideathon_Workspace\Synapse Ops"

# Initialize git
git init

# Check status
git status
```

### Step 2: Configure Git (First Time Only)

```bash
# Set your name
git config --global user.name "Your Name"

# Set your email (use your GitHub email)
git config --global user.email "your.email@example.com"

# Verify
git config --list
```

### Step 3: Stage and Commit Files

```bash
# Add all files (respects .gitignore)
git add .

# Verify .env is NOT in the list
git status

# Create first commit
git commit -m "Initial commit: Production-ready Auth & Products API"
```

### Step 4: Create GitHub Repository

**Go to**: https://github.com/new

**Settings**:
- **Repository name**: `auth-products-api` (or your preferred name)
- **Description**: "Production-ready Node.js/TypeScript REST API with JWT authentication and DynamoDB"
- **Visibility**: 
  - ✅ **Private** (recommended - keeps code private)
  - ⚠️ Public (anyone can see)
- **DO NOT** check "Initialize with README" (we already have one)

Click **"Create repository"**

### Step 5: Connect and Push

**Replace `YOUR_USERNAME` with your actual GitHub username:**

```bash
# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/auth-products-api.git

# Verify remote
git remote -v

# Push to GitHub
git push -u origin main
```

### Step 6: Authentication

When prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use **Personal Access Token** (NOT your GitHub password)

#### Create Personal Access Token:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name: "Auth API Development"
4. Select scope: ✅ `repo` (full control of private repositories)
5. Click "Generate token"
6. **Copy the token** (save it - you won't see it again!)
7. Use this token as password when pushing

### Step 7: Verify Upload

1. Go to: `https://github.com/YOUR_USERNAME/auth-products-api`
2. Check:
   - ✅ All files are visible
   - ✅ `.env` is NOT visible (protected!)
   - ✅ README.md displays on main page

---

## 📦 What Gets Uploaded

### ✅ Uploaded to GitHub:
- **Source code**: `src/` directory (all TypeScript files)
- **Scripts**: `scripts/` directory
- **Configuration**: `package.json`, `tsconfig.json`
- **Docker**: `Dockerfile`, `.dockerignore`
- **Documentation**: All `.md` files
- **Templates**: `.env.example` (no secrets)
- **Git config**: `.gitignore`

### ❌ NOT Uploaded (Protected):
- **`.env`** - YOUR AWS CREDENTIALS (SAFE!)
- **`node_modules/`** - Dependencies (too large, installed via npm)
- **`dist/`** - Build output (generated)
- **IDE files** - `.vscode/`, `.idea/`
- **Logs** - `*.log` files

**Total**: ~60 files (~500 KB excluding node_modules)

---

## 🔄 Future Updates

After initial setup, to push changes:

```bash
# Check what changed
git status

# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add new feature: user profile endpoint"

# Push to GitHub
git push
```

---

## 🛠️ Common Commands

```bash
# View commit history
git log --oneline

# View remote repository
git remote -v

# Pull latest changes (if working with team)
git pull

# Create new branch
git checkout -b feature-name

# Switch branches
git checkout main

# View all branches
git branch -a

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- filename
```

---

## ⚠️ Troubleshooting

### Error: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/auth-products-api.git
```

### Error: "failed to push some refs"
```bash
git pull origin main --rebase
git push origin main
```

### Error: "Authentication failed"
- Use Personal Access Token instead of password
- Or set up SSH keys (see GitHub docs)

### Accidentally Committed .env File
```bash
# Remove from git (keeps local file)
git rm --cached .env

# Commit the removal
git commit -m "Remove .env from repository"

# Push
git push
```

### Wrong Commit Message
```bash
# Change last commit message
git commit --amend -m "New commit message"

# Force push (if already pushed)
git push --force
```

---

## 🔒 Security Checklist

Before pushing to GitHub, verify:

- [x] `.env` is in `.gitignore` ✅
- [x] No AWS credentials in code ✅
- [x] No hardcoded passwords ✅
- [x] `.env.example` has placeholders only ✅
- [x] Run `git status` - `.env` should NOT appear ✅

After pushing to GitHub, verify:

- [x] Browse repository files
- [x] Confirm `.env` is NOT visible ✅
- [x] Confirm source code is visible ✅
- [x] README.md displays correctly ✅

---

## 🎨 Optional: Repository Settings

### Add Description and Topics
1. Go to your repository on GitHub
2. Click **"About"** (gear icon, top right)
3. Add description
4. Add topics: `nodejs`, `typescript`, `express`, `jwt`, `dynamodb`, `rest-api`, `authentication`
5. Save

### Branch Protection (Recommended for Teams)
1. Repository → Settings → Branches
2. Add rule for `main` branch
3. Enable:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date

### Add Collaborators
1. Repository → Settings → Collaborators
2. Click "Add people"
3. Enter GitHub username or email
4. Select permission level

### GitHub Actions (Optional)
Set up automated testing and deployment:
1. Repository → Actions
2. Choose workflow template
3. Configure CI/CD pipeline

---

## 📊 Repository Statistics

After upload, your repository will contain:

- **~60 files** (excluding node_modules)
- **~500 KB** total size
- **20+ documentation files**
- **Production-ready code** with tests
- **Docker support** for deployment
- **Comprehensive API documentation**

---

## 🎉 Success!

Your code is now on GitHub at:
```
https://github.com/YOUR_USERNAME/auth-products-api
```

### Next Steps:
1. ✅ Share repository URL with team
2. ✅ Set up branch protection rules
3. ✅ Configure GitHub Actions for CI/CD
4. ✅ Add repository to your portfolio
5. ✅ Start building new features!

---

## 💡 Best Practices

### Commit Messages
- Use present tense: "Add feature" not "Added feature"
- Be descriptive: "Add user profile endpoint with validation"
- Reference issues: "Fix #123: Resolve login timeout"

### Branching Strategy
- `main` - Production-ready code
- `develop` - Development branch
- `feature/feature-name` - New features
- `bugfix/bug-name` - Bug fixes
- `hotfix/critical-fix` - Emergency fixes

### Pull Requests
- Create PR for all changes
- Add description and screenshots
- Request code review
- Link related issues
- Squash commits before merging

---

## 🆘 Need More Help?

- **GitHub Docs**: https://docs.github.com
- **Git Docs**: https://git-scm.com/doc
- **GitHub Learning Lab**: https://lab.github.com

---

**Your code is production-ready and safe to upload!** 🚀
