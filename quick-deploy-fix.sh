#!/bin/bash

# Quick Deployment Fix Script
# Fixes common deployment issues

echo "🔧 SafeEdu Deployment Quick Fix"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1. Generate strong JWT secret
echo -e "\n${YELLOW}1. Generating Strong JWT Secret...${NC}"
if command -v openssl >/dev/null 2>&1; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}✓ JWT Secret generated${NC}"
else
    JWT_SECRET=$(date +%s | sha256sum | base64 | head -c 32)
    echo -e "${GREEN}✓ JWT Secret generated (fallback method)${NC}"
fi

# 2. Update backend .env
echo -e "\n${YELLOW}2. Updating Backend Configuration...${NC}"
cat > backend/.env << EOF
# Production Environment Variables
PORT=5000

# MongoDB Atlas Connection
MONGO_URI=mongodb+srv://sadiqferegabdushukur_db_user:7Z5PapDvKAjTUGgS@cluster0.2amblcf.mongodb.net/safeedu?retryWrites=true&w=majority&appName=Cluster0

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=7d

# CORS Configuration (Update after frontend deployment)
CORS_ORIGIN=https://your-frontend-app.vercel.app

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# Security
NODE_ENV=production
HELMET_ENABLED=true

# Socket.IO Configuration
SOCKET_CORS_ORIGIN=https://your-frontend-app.vercel.app

# Application Settings
APP_NAME=SafeEdu Educational Platform
APP_VERSION=1.0.0
EOF

echo -e "${GREEN}✓ Backend .env updated${NC}"

# 3. Update frontend .env.production
echo -e "\n${YELLOW}3. Updating Frontend Configuration...${NC}"
cat > frontend/.env.production << EOF
# Production environment variables for Vercel
VITE_API_URL=https://safeedu-backend.onrender.com
VITE_APP_NAME=SafeEdu Educational Platform
VITE_APP_DESCRIPTION=Full-stack educational platform with course management
VITE_APP_VERSION=1.0.0
EOF

echo -e "${GREEN}✓ Frontend .env.production updated${NC}"

# 4. Update vercel.json
echo -e "\n${YELLOW}4. Updating Vercel Configuration...${NC}"
cat > frontend/vercel.json << 'EOF'
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "VITE_API_URL": "https://safeedu-backend.onrender.com"
  }
}
EOF

echo -e "${GREEN}✓ Vercel configuration updated${NC}"

# 5. Check .gitignore
echo -e "\n${YELLOW}5. Checking .gitignore...${NC}"
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
out/

# Logs
logs
*.log

# Editor
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Temporary
tmp/
temp/
EOF
    echo -e "${GREEN}✓ .gitignore created${NC}"
else
    echo -e "${GREEN}✓ .gitignore exists${NC}"
fi

# 6. Create deployment summary
echo -e "\n${YELLOW}6. Creating Deployment Summary...${NC}"
cat > DEPLOYMENT_SUMMARY.txt << EOF
SafeEdu Platform - Deployment Configuration
============================================

Generated: $(date)

BACKEND CONFIGURATION:
---------------------
MongoDB URI: mongodb+srv://sadiqferegabdushukur_db_user:***@cluster0.2amblcf.mongodb.net/safeedu
Database: safeedu
JWT Secret: ${JWT_SECRET:0:20}... (32 characters)
Port: 5000

RENDER DEPLOYMENT:
-----------------
Service Name: safeedu-backend
Build Command: npm run render-build
Start Command: npm run render-start
Environment: Node

FRONTEND CONFIGURATION:
----------------------
API URL: https://safeedu-backend.onrender.com
App Name: SafeEdu Educational Platform

VERCEL DEPLOYMENT:
-----------------
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist

NEXT STEPS:
----------
1. Review backend/.env file
2. Commit changes: git add . && git commit -m "Configure for deployment"
3. Push to GitHub: git push origin main
4. Deploy backend to Render
5. Update CORS_ORIGIN with your Vercel URL
6. Deploy frontend to Vercel
7. Test the application

IMPORTANT SECURITY NOTES:
------------------------
- Keep your JWT_SECRET secure
- Never commit .env files to Git
- Update CORS_ORIGIN after frontend deployment
- Enable MongoDB Atlas IP whitelisting
- Set up monitoring and alerts

For detailed instructions, see:
- DEPLOYMENT_CHECKLIST.md
- DEPLOYMENT_GUIDE.md
EOF

echo -e "${GREEN}✓ Deployment summary created${NC}"

# 7. Display summary
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✅ Configuration Complete!${NC}"
echo -e "${GREEN}================================${NC}"

echo -e "\n${YELLOW}Configuration Summary:${NC}"
echo "• MongoDB Database: safeedu"
echo "• JWT Secret: ${JWT_SECRET:0:20}... (saved in backend/.env)"
echo "• Backend URL: https://safeedu-backend.onrender.com"
echo "• Frontend API: https://safeedu-backend.onrender.com"

echo -e "\n${YELLOW}Files Updated:${NC}"
echo "• backend/.env"
echo "• frontend/.env.production"
echo "• frontend/vercel.json"
echo "• DEPLOYMENT_SUMMARY.txt"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Review the configuration files"
echo "2. Commit changes to Git"
echo "3. Push to GitHub"
echo "4. Deploy backend to Render"
echo "5. Deploy frontend to Vercel"
echo "6. Update CORS_ORIGIN in Render"

echo -e "\n${YELLOW}Quick Commands:${NC}"
echo "git add ."
echo "git commit -m \"Configure for production deployment\""
echo "git push origin main"

echo -e "\n${GREEN}See DEPLOYMENT_CHECKLIST.md for detailed steps!${NC}"

# Make script executable
chmod +x quick-deploy-fix.sh