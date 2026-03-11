# SafeEdu Platform - Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Configuration
- [x] MongoDB Atlas connection string configured
- [x] Database name: `safeedu`
- [x] Database user: `sadiqferegabdushukur_db_user`
- [ ] JWT_SECRET updated (change from default)
- [ ] Backend URL updated in frontend config
- [ ] CORS_ORIGIN updated after frontend deployment

### 2. Backend Configuration (Render)
**File: `backend/.env`**
```env
PORT=5000
MONGO_URI=mongodb+srv://sadiqferegabdushukur_db_user:7Z5PapDvKAjTUGgS@cluster0.2amblcf.mongodb.net/safeedu?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=CHANGE_THIS_TO_STRONG_SECRET
CORS_ORIGIN=https://your-frontend.vercel.app
NODE_ENV=production
```

**Render Settings:**
- Name: `safeedu-backend`
- Environment: `Node`
- Build Command: `npm run render-build`
- Start Command: `npm run render-start`
- Auto-Deploy: `Yes`

### 3. Frontend Configuration (Vercel)
**File: `frontend/.env.production`**
```env
VITE_API_URL=https://safeedu-backend.onrender.com
VITE_APP_NAME=SafeEdu Educational Platform
```

**Vercel Settings:**
- Framework: `Vite`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

## 🚀 Deployment Steps

### Step 1: Generate Strong JWT Secret
```bash
# On Linux/Mac
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and update `JWT_SECRET` in backend/.env

### Step 2: Commit Changes to Git
```bash
# Check status
git status

# Add all changes
git add .

# Commit
git commit -m "Configure for production deployment"

# Push to GitHub
git push origin main
```

### Step 3: Deploy Backend to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure Service**:
   ```
   Name: safeedu-backend
   Environment: Node
   Region: Oregon (or closest to your users)
   Branch: main
   Root Directory: backend
   Build Command: npm run render-build
   Start Command: npm run render-start
   ```

4. **Add Environment Variables**:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://sadiqferegabdushukur_db_user:7Z5PapDvKAjTUGgS@cluster0.2amblcf.mongodb.net/safeedu?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=<your_generated_secret>
   JWT_EXPIRE=7d
   CORS_ORIGIN=https://your-frontend.vercel.app
   SOCKET_CORS_ORIGIN=https://your-frontend.vercel.app
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=1000
   HELMET_ENABLED=true
   APP_NAME=SafeEdu Educational Platform
   APP_VERSION=1.0.0
   ```

5. **Create Web Service**
6. **Wait for deployment** (5-10 minutes)
7. **Copy your backend URL**: `https://safeedu-backend.onrender.com`

### Step 4: Update Frontend Configuration

1. **Update `frontend/.env.production`**:
   ```env
   VITE_API_URL=https://safeedu-backend.onrender.com
   VITE_APP_NAME=SafeEdu Educational Platform
   VITE_APP_DESCRIPTION=Full-stack educational platform with course management
   VITE_APP_VERSION=1.0.0
   ```

2. **Update `frontend/vercel.json`**:
   ```json
   {
     "env": {
       "VITE_API_URL": "https://safeedu-backend.onrender.com"
     }
   }
   ```

3. **Commit and push**:
   ```bash
   git add frontend/.env.production frontend/vercel.json
   git commit -m "Update frontend with backend URL"
   git push origin main
   ```

### Step 5: Deploy Frontend to Vercel

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

**Option B: Using Vercel Dashboard**
1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select your repository

3. **Configure Project**:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variables**:
   ```
   VITE_API_URL=https://safeedu-backend.onrender.com
   VITE_APP_NAME=SafeEdu Educational Platform
   VITE_APP_DESCRIPTION=Full-stack educational platform with course management
   VITE_APP_VERSION=1.0.0
   ```

5. **Deploy**
6. **Copy your frontend URL**: `https://your-app.vercel.app`

### Step 6: Update Backend CORS

1. **Go to Render Dashboard** → Your backend service
2. **Navigate to Environment**
3. **Update these variables**:
   ```
   CORS_ORIGIN=https://your-app.vercel.app
   SOCKET_CORS_ORIGIN=https://your-app.vercel.app
   ```
4. **Save Changes**
5. **Redeploy** (if not auto-deployed)

## 🧪 Testing Deployment

### Test Backend
```bash
# Health check
curl https://safeedu-backend.onrender.com/

# Expected response:
# "SESA Secure API with Real-time Notifications is running..."
```

### Test Frontend
1. Visit your Vercel URL
2. Check browser console for errors
3. Test login functionality
4. Test course creation (teacher)
5. Test course review (admin)
6. Test enrollment (student)

### Test API Connection
```bash
# Test login endpoint
curl -X POST https://safeedu-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

## 🔧 Post-Deployment Configuration

### 1. Create Test Users
Use MongoDB Compass or Atlas to create initial users:

**Admin User:**
```javascript
{
  "name": "Admin User",
  "email": "admin@safeedu.com",
  "password": "<hashed_password>",
  "role": "admin",
  "isActive": true
}
```

**Teacher User:**
```javascript
{
  "name": "Teacher User",
  "email": "teacher@safeedu.com",
  "password": "<hashed_password>",
  "role": "instructor",
  "isActive": true
}
```

**Student User:**
```javascript
{
  "name": "Student User",
  "email": "student@safeedu.com",
  "password": "<hashed_password>",
  "role": "student",
  "isActive": true
}
```

### 2. Set Up MongoDB Atlas Security

1. **Network Access**:
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (for development)
   - For production, add Render's IP ranges

2. **Database Access**:
   - Verify user has correct permissions
   - Enable audit logs

3. **Backups**:
   - Enable automatic backups
   - Set backup schedule

### 3. Configure Custom Domains (Optional)

**Vercel Custom Domain:**
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records

**Render Custom Domain:**
1. Go to Service Settings → Custom Domain
2. Add your domain
3. Update DNS records

## 📊 Monitoring Setup

### Render Monitoring
1. **Metrics**: CPU, Memory, Response times
2. **Logs**: Real-time log streaming
3. **Alerts**: Email notifications for downtime

### Vercel Analytics
1. Enable Vercel Analytics
2. Monitor Core Web Vitals
3. Track page views and performance

### MongoDB Atlas Monitoring
1. **Performance Advisor**: Query optimization
2. **Real-time Metrics**: Connections, operations
3. **Alerts**: Set up for high CPU, memory

## 🐛 Troubleshooting

### Backend Issues

**Issue: Backend won't start**
```bash
# Check Render logs
# Common causes:
# 1. Missing environment variables
# 2. MongoDB connection failed
# 3. Port already in use
```

**Solution:**
- Verify all environment variables are set
- Test MongoDB connection string
- Check Render logs for specific errors

**Issue: CORS errors**
```
Access to fetch at 'https://backend.com' from origin 'https://frontend.com' 
has been blocked by CORS policy
```

**Solution:**
- Verify CORS_ORIGIN matches frontend URL exactly
- No trailing slashes
- Check for http vs https

### Frontend Issues

**Issue: API calls failing**
```
Failed to fetch
Network error
```

**Solution:**
- Verify VITE_API_URL is correct
- Check backend is running
- Test API endpoint with curl

**Issue: Build fails**
```
TypeScript compilation errors
Module not found
```

**Solution:**
- Check all imports are correct
- Verify all dependencies are in package.json
- Test build locally first

### Database Issues

**Issue: Connection timeout**
```
MongoServerError: connection timed out
```

**Solution:**
- Check MongoDB Atlas IP whitelist
- Verify connection string
- Check network access settings

## 🔒 Security Checklist

- [ ] JWT_SECRET is strong and unique
- [ ] MongoDB password is strong
- [ ] CORS is configured for specific origins only
- [ ] Rate limiting is enabled
- [ ] Helmet security headers enabled
- [ ] Environment variables not committed to Git
- [ ] MongoDB Atlas IP whitelist configured
- [ ] SSL/TLS enabled (automatic on Vercel/Render)
- [ ] Regular security updates scheduled

## 📈 Performance Optimization

### Backend
- [ ] Database indexes created
- [ ] Connection pooling configured
- [ ] Response caching implemented
- [ ] Compression enabled

### Frontend
- [ ] Code splitting enabled
- [ ] Images optimized
- [ ] Lazy loading implemented
- [ ] CDN configured (Vercel automatic)

## 🎯 Success Criteria

- [ ] Backend accessible at Render URL
- [ ] Frontend accessible at Vercel URL
- [ ] Database connected and working
- [ ] Authentication working
- [ ] Course creation working
- [ ] Enrollment workflow working
- [ ] Admin panel accessible
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable (< 3s load time)

## 📞 Support Resources

### Documentation
- Backend API: See `COURSE_MANAGEMENT_SYSTEM.md`
- Deployment: See `DEPLOYMENT_GUIDE.md`
- Setup: See `SETUP_GUIDE.md`

### Platform Support
- Render: https://render.com/docs
- Vercel: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com

### Emergency Contacts
- Render Support: support@render.com
- Vercel Support: support@vercel.com
- MongoDB Support: Cloud support portal

## 🎉 Deployment Complete!

Once all checkboxes are complete, your SafeEdu platform is live and ready for users!

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://safeedu-backend.onrender.com`
- Database: MongoDB Atlas

**Next Steps:**
1. Share URLs with team
2. Create initial content
3. Invite beta users
4. Monitor performance
5. Gather feedback
6. Iterate and improve

---

**Deployed by:** [Your Name]  
**Date:** [Deployment Date]  
**Version:** 1.0.0