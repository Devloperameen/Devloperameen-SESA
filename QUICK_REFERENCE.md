# Quick Reference Card

## 🚀 Start Backend

```bash
cd backend
npm install
npm run seed:enhanced
npm run dev
```

Server: `http://localhost:5000`

---

## 🔑 Test Credentials

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

## 📡 Key API Endpoints

### Auth
```
POST /api/auth/login
POST /api/auth/register
```

### Dashboard
```
GET /api/dashboard (role-specific)
```

### Courses
```
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses
GET    /api/courses/:courseId/content (protected)
POST   /api/courses/enroll/:id
```

### Payments
```
POST /api/payments/create
POST /api/payments/:paymentId/confirm
GET  /api/payments/my-payments
```

### Certificates
```
POST /api/certificates/generate/:courseId
GET  /api/certificates/my-certificates
GET  /api/certificates/verify/:certificateNumber
```

### Analytics
```
GET /api/analytics/dashboard
GET /api/analytics/course/:courseId
GET /api/analytics/system
```

### Admin
```
GET    /api/admin/management/users
POST   /api/admin/management/users
PUT    /api/admin/management/users/:userId/role
DELETE /api/admin/management/users/:userId
```

---

## 🎥 Video Access Logic

```
Part 1 (Index 0) → Always Free
Parts 2+ → Requires Payment OR Approved Enrollment
```

### Check Access
```typescript
if (videoIndex === 0) {
  // Show video
} else {
  // Check payment/enrollment
  // Show payment prompt if needed
}
```

---

## 💳 Payment Flow

```
1. POST /api/payments/create
2. Process payment (Stripe/PayPal)
3. POST /api/payments/:id/confirm
4. Access granted automatically
```

---

## 🎭 14 Roles

### Admin (5)
- super_admin
- admin
- moderator
- content_manager
- support_staff

### Instructor (3)
- instructor
- assistant_instructor
- guest_instructor

### Student (3)
- student
- premium_student
- trial_student

### Specialized (3)
- reviewer
- analyst
- finance_manager

---

## 📊 Dashboard Data Structure

```typescript
{
  role: "instructor",
  stats: { ... },
  myCourses: [...],
  quickActions: [
    { label: "Create Course", route: "/instructor/create" }
  ]
}
```

---

## 🔐 Authorization Header

```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 📁 New Files Created

### Models (4)
- Payment.ts
- Certificate.ts
- Analytics.ts
- User.ts (enhanced)

### Controllers (5)
- paymentController.ts
- certificateController.ts
- analyticsController.ts
- dashboardController.ts
- adminController.ts

### Routes (5)
- payments.ts
- certificates.ts
- analytics.ts
- dashboard.ts
- adminManagement.ts

### Middleware (1)
- videoAccess.ts

---

## 🧪 Quick Test

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@sesa.com","password":"password123"}'

# Get dashboard
curl http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get courses
curl http://localhost:5000/api/courses
```

---

## 📚 Documentation Files

1. **API_DOCUMENTATION.md** - Complete API reference
2. **IMPLEMENTATION_GUIDE.md** - Technical details
3. **FRONTEND_INTEGRATION_GUIDE.md** - Frontend integration
4. **BACKEND_ENHANCEMENT_SUMMARY.md** - Feature summary
5. **README.md** - Project overview
6. **QUICK_REFERENCE.md** - This file

---

## 🎯 Key Features

✅ 14 role-based access control
✅ Payment integration (Stripe, PayPal, etc.)
✅ Video access control (Part 1 free)
✅ Certificate system
✅ Advanced analytics
✅ Role-specific dashboards
✅ Real-time notifications
✅ Progress tracking

---

## 🔧 Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sesa
JWT_SECRET=your_secure_secret
CORS_ORIGIN=http://localhost:5173
```

---

## 📞 Need Help?

1. Check API_DOCUMENTATION.md
2. Review IMPLEMENTATION_GUIDE.md
3. See FRONTEND_INTEGRATION_GUIDE.md
4. Contact development team

---

**Status**: ✅ Ready for Production
**Version**: 2.0.0
