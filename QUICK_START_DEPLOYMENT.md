# SafeEdu Platform - Quick Start Deployment

## 🚀 Deploy in 5 Steps

### Step 1: Run Quick Fix Script
```bash
./quick-deploy-fix.sh
```
This will:
- Generate a strong JWT secret
- Update all configuration files
- Create deployment summary

### Step 2: Commit to Git
```bash
git add .
git commit -m "Configure for production deployment"
git push origin main
```

### Step 3: Deploy Backend to Render

1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Use these settings:

```
Name: safeedu-backend
Environment: Node
Root Directory: backend
Build Command: npm run render-build
Start Command: npm run render-start
```

5. Add environment variables (copy from `backend/.env`):
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://sadiqferegabdushukur_db_user:7Z5PapDvKAjTUGgS@cluster0.2amblcf.mongodb.net/safeedu?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=<from backend/.env>
CORS_ORIGIN=https://your-frontend.vercel.app
```

6. Click "Create Web Service"
7. **Copy your backend URL**: `https://safeedu-backend.onrender.com`

### Step 4: Deploy Frontend to Vercel

**Option A: Using CLI**
```bash
npm i -g vercel
cd frontend
vercel --prod
```

**Option B: Using Dashboard**
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Use these settings:

```
Framework: Vite
Root Directory: frontend
Build Command: npm run build
Output Directory: dist
```

5. Add environment variable:
```
VITE_API_URL=https://safeedu-backend.onrender.com
```

6. Click "Deploy"
7. **Copy your frontend URL**: `https://your-app.vercel.app`

### Step 5: Update CORS

1. Go back to Render Dashboard
2. Navigate to your backend service → Environment
3. Update:
```
CORS_ORIGIN=https://your-app.vercel.app
SOCKET_CORS_ORIGIN=https://your-app.vercel.app
```
4. Save and redeploy

## ✅ Test Your Deployment

### Test Backend
```bash
curl https://safeedu-backend.onrender.com/
```
Expected: "SESA Secure API with Real-time Notifications is running..."

### Test Frontend
Visit your Vercel URL and test:
- [ ] Login page loads
- [ ] Can create account
- [ ] Can login
- [ ] Dashboard accessible
- [ ] No console errors

## 📋 Your Configuration

**Database:**
- MongoDB Atlas: `safeedu`
- User: `sadiqferegabdushukur_db_user`

**Backend:**
- Platform: Render
- URL: `https://safeedu-backend.onrender.com`

**Frontend:**
- Platform: Vercel
- URL: `https://your-app.vercel.app`

## 🆘 Quick Troubleshooting

### Backend won't start
- Check Render logs
- Verify MongoDB connection string
- Ensure all environment variables are set

### CORS errors
- Update CORS_ORIGIN to match frontend URL exactly
- No trailing slashes
- Must be https://

### Frontend can't connect
- Verify VITE_API_URL is correct
- Check backend is running
- Test with curl

## 📚 Full Documentation

For detailed instructions, see:
- `DEPLOYMENT_CHECKLIST.md` - Complete checklist
- `DEPLOYMENT_GUIDE.md` - Step-by-step guide
- `COURSE_MANAGEMENT_SYSTEM.md` - API documentation

## 🎉 Success!

Your SafeEdu platform is now live!

**Features Available:**
- ✅ Course management with approval workflow
- ✅ Teacher dashboard
- ✅ Admin review panel
- ✅ Student enrollment
- ✅ Free preview system
- ✅ Role-based access control

**Next Steps:**
1. Create admin account
2. Create test courses
3. Invite beta users
4. Monitor performance
5. Gather feedback

---

**Need Help?**
- Check logs on Render/Vercel
- Review error messages
- Test API with curl
- See full documentation