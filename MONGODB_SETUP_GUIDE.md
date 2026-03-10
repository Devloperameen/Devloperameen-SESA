# MongoDB Setup Guide

## Current Status

✅ **Frontend**: Running on http://localhost:3000  
❌ **Backend**: Waiting for MongoDB  
❌ **MongoDB**: Not installed

---

## Install MongoDB

### Option 1: Docker (Recommended - Easiest)

```bash
# Pull MongoDB image
docker pull mongo:latest

# Run MongoDB container
docker run -d \
  --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:latest

# Verify it's running
docker ps
```

Then update `backend/.env`:
```env
MONGO_URI=mongodb://admin:password@localhost:27017/sesa?authSource=admin
```

### Option 2: Install MongoDB on Ubuntu/Debian

```bash
# Import MongoDB public GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod

# Enable MongoDB to start on boot
sudo systemctl enable mongod

# Check status
sudo systemctl status mongod
```

### Option 3: MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster
4. Get connection string
5. Update `backend/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/sesa?retryWrites=true&w=majority
```

---

## After MongoDB is Running

### 1. Seed the Database

```bash
cd backend
npm run seed:enhanced
```

This creates:
- 14 test users (one per role)
- 5 sample courses
- Enrollments, payments, certificates
- Test data

### 2. Restart Backend

The backend should automatically connect once MongoDB is running.

If not, restart it:
```bash
# Stop current backend process
# Then start again
cd backend
npm run dev
```

### 3. Test the Setup

```bash
# Test backend health
curl http://localhost:5000

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@sesa.com","password":"password123"}'
```

---

## Test Credentials

All passwords: `password123`

```
superadmin@sesa.com    - Super Admin
admin@sesa.com         - Admin
moderator@sesa.com     - Moderator
content@sesa.com       - Content Manager
support@sesa.com       - Support Staff
instructor@sesa.com    - Instructor
assistant@sesa.com     - Assistant Instructor
guest@sesa.com         - Guest Instructor
student@sesa.com       - Student
premium@sesa.com       - Premium Student
trial@sesa.com         - Trial Student
reviewer@sesa.com      - Reviewer
analyst@sesa.com       - Analyst
finance@sesa.com       - Finance Manager
```

---

## Verify Everything is Working

### 1. Check Services

- Frontend: http://localhost:3000 ✅
- Backend: http://localhost:5000 (after MongoDB)
- MongoDB: localhost:27017

### 2. Test Login

1. Go to http://localhost:3000
2. Click Login
3. Use: `student@sesa.com` / `password123`
4. Should see student dashboard

### 3. Test Different Roles

Try logging in with different role accounts to see different dashboards:
- Admin: `admin@sesa.com`
- Instructor: `instructor@sesa.com`
- Student: `student@sesa.com`

---

## Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
sudo systemctl restart mongod
```

### Backend Not Starting

```bash
# Check backend logs
cd backend
npm run dev

# Check if port 5000 is in use
lsof -i :5000

# Kill process on port 5000
kill -9 <PID>
```

### Frontend Issues

```bash
# Check frontend logs
cd frontend
npm run dev

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

---

## Quick Start (After MongoDB is Installed)

```bash
# Terminal 1 - Backend
cd backend
npm run seed:enhanced
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Then open: http://localhost:3000

---

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sesa
JWT_SECRET=your_secure_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Next Steps

1. ✅ Install MongoDB (choose one option above)
2. ✅ Seed the database
3. ✅ Test login with different roles
4. ✅ Explore role-specific dashboards
5. ✅ Test payment flow
6. ✅ Test video access control

---

## Support

For issues:
- Check QUICK_REFERENCE.md
- Check API_DOCUMENTATION.md
- Check backend logs
- Check MongoDB logs

---

**Current Status**: Frontend running, waiting for MongoDB installation to complete setup.
