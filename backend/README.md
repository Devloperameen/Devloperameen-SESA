# SESA Backend - Enhanced Learning Management System

## Overview
Comprehensive backend system with 14+ role-based access control, payment integration, video access control, and advanced analytics.

## Features

### 🎭 14 Role-Based Access Control
- **Admin Roles**: Super Admin, Admin, Moderator, Content Manager, Support Staff
- **Instructor Roles**: Instructor, Assistant Instructor, Guest Instructor
- **Student Roles**: Student, Premium Student, Trial Student
- **Specialized Roles**: Reviewer, Analyst, Finance Manager

### 💳 Payment System
- Multiple payment methods (Stripe, PayPal, Bank Transfer, Cash)
- Auto-enrollment after payment
- Payment tracking and history
- Refund processing
- Revenue analytics

### 🎥 Video Access Control
- Part 1 (Preview) always free
- Full content requires payment or enrollment approval
- Middleware-based access control
- Flexible content protection

### 📊 Advanced Analytics
- Role-specific dashboards
- Course performance metrics
- Revenue tracking
- User engagement analytics
- System-wide statistics

### 🎓 Certificate System
- Auto-generation on completion
- Unique certificate numbers
- Public verification
- Certificate management

### 📈 Progress Tracking
- Watch time monitoring
- Completion tracking
- Course progress analytics

## Installation

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm or yarn

### Setup

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Configure environment**
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sesa
JWT_SECRET=your_secure_jwt_secret_here
CORS_ORIGIN=http://localhost:5173
```

3. **Seed database**
```bash
npm run seed:enhanced
```

This creates test users for all 14 roles with credentials:
- Email: `[role]@sesa.com`
- Password: `password123`

4. **Start server**
```bash
npm run dev
```

Server runs on `http://localhost:5000`

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

### Quick Start

#### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@sesa.com",
    "password": "password123"
  }'
```

#### Get Dashboard
```bash
curl http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Browse Courses
```bash
curl http://localhost:5000/api/courses
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/
│   │   ├── adminController.ts          # Admin management
│   │   ├── analyticsController.ts      # Analytics & reporting
│   │   ├── certificateController.ts    # Certificate management
│   │   ├── dashboardController.ts      # Role-based dashboards
│   │   ├── enrollmentController.ts     # Enrollment handling
│   │   └── paymentController.ts        # Payment processing
│   ├── middleware/
│   │   ├── auth.ts                     # Authentication
│   │   ├── verifyAccess.ts            # Enrollment verification
│   │   └── videoAccess.ts             # Video access control
│   ├── models/
│   │   ├── Analytics.ts               # Analytics data
│   │   ├── Announcement.ts            # Announcements
│   │   ├── Category.ts                # Course categories
│   │   ├── Certificate.ts             # Certificates
│   │   ├── Course.ts                  # Courses
│   │   ├── Enrollment.ts              # Enrollments
│   │   ├── Payment.ts                 # Payments
│   │   ├── Progress.ts                # User progress
│   │   └── User.ts                    # Users (14 roles)
│   ├── routes/
│   │   ├── admin.ts                   # Admin routes
│   │   ├── adminManagement.ts         # User/course management
│   │   ├── analytics.ts               # Analytics routes
│   │   ├── announcements.ts           # Announcements
│   │   ├── auth.ts                    # Authentication
│   │   ├── categories.ts              # Categories
│   │   ├── certificates.ts            # Certificates
│   │   ├── courses.ts                 # Courses
│   │   ├── dashboard.ts               # Dashboards
│   │   ├── enrollments.ts             # Enrollments
│   │   ├── payments.ts                # Payments
│   │   ├── progress.ts                # Progress tracking
│   │   └── users.ts                   # User management
│   ├── utils/
│   │   ├── seed.ts                    # Basic seeding
│   │   ├── seedEnhanced.ts            # Enhanced seeding
│   │   ├── socket.ts                  # WebSocket
│   │   └── youtubeParser.ts           # YouTube utilities
│   └── index.ts                       # Main server
├── API_DOCUMENTATION.md               # Complete API docs
├── IMPLEMENTATION_GUIDE.md            # Implementation guide
├── README.md                          # This file
└── package.json
```

## Role Capabilities

### Super Admin
- Full system access
- User management (all roles)
- System configuration
- All analytics

### Admin
- User management (except super admin)
- Course approval
- Enrollment management
- Payment oversight

### Moderator
- Enrollment approvals
- Content moderation
- Comment management

### Content Manager
- Course management
- Category management
- Content analytics

### Support Staff
- User support
- Enrollment assistance
- Issue resolution

### Instructor
- Create/manage courses
- Student management
- Course analytics
- Revenue tracking

### Assistant Instructor
- Assist with courses
- Limited course management
- Student interaction

### Guest Instructor
- Limited course creation
- Basic course management

### Student
- Browse courses
- Enroll in courses
- Track progress
- View certificates

### Premium Student
- All student features
- Premium content access
- Priority support

### Trial Student
- Limited course access
- Trial period features

### Reviewer
- Review course content
- Approve/reject courses
- Quality assurance

### Analyst
- Access analytics
- Generate reports
- Data insights

### Finance Manager
- Payment management
- Revenue reports
- Refund processing

## Video Access Flow

### 1. Course Structure
```javascript
{
  previewVideoUrl: "Part 1 - Always Free",
  enrolledContentUrls: [
    "Part 2 - Requires Payment",
    "Part 3 - Requires Payment",
    ...
  ]
}
```

### 2. Access Logic
```
User views course
  ↓
Part 1 (Preview) → Always accessible
  ↓
Parts 2+ → Check payment/enrollment
  ↓
  ├─ Has payment? → Grant access
  ├─ Has approved enrollment? → Grant access
  └─ Neither? → Show payment prompt
```

### 3. Implementation
```typescript
// Backend middleware
router.get('/:courseId/content', 
  authenticate, 
  checkFullCourseAccess,  // Checks payment/enrollment
  getContent
);

// Frontend check
if (videoIndex === 0) {
  // Show preview
} else {
  // Check access, show payment if needed
}
```

## Payment Flow

### 1. Create Payment
```javascript
POST /api/payments/create
{
  courseId: "...",
  paymentMethod: "stripe",
  amount: 99.99
}
```

### 2. Process Payment
```javascript
// Frontend handles Stripe/PayPal
// On success:
POST /api/payments/:paymentId/confirm
```

### 3. Auto-Enrollment
- Payment confirmed
- Enrollment auto-approved
- Course access granted
- User notified

## Dashboard Features

Each role gets a customized dashboard with:
- Relevant statistics
- Quick actions
- Recent activity
- Role-specific tools

Example (Instructor):
```javascript
{
  stats: {
    totalCourses: 5,
    totalEnrollments: 120,
    totalRevenue: 5000,
    activeStudents: 85
  },
  myCourses: [...],
  pendingEnrollments: [...],
  quickActions: [...]
}
```

## Testing

### Test Credentials
All test accounts use password: `password123`

```
superadmin@sesa.com - Super Admin
admin@sesa.com - Admin
moderator@sesa.com - Moderator
content@sesa.com - Content Manager
support@sesa.com - Support Staff
instructor@sesa.com - Instructor
assistant@sesa.com - Assistant Instructor
guest@sesa.com - Guest Instructor
student@sesa.com - Student
premium@sesa.com - Premium Student
trial@sesa.com - Trial Student
reviewer@sesa.com - Reviewer
analyst@sesa.com - Analyst
finance@sesa.com - Finance Manager
```

### Run Tests
```bash
# Seed database
npm run seed:enhanced

# Start server
npm run dev

# Test API endpoints
curl http://localhost:5000/api/courses
```

## Security

### Authentication
- JWT tokens with expiration
- Bcrypt password hashing
- Secure token storage

### Authorization
- Role-based access control
- Permission checking
- Resource ownership validation

### Payment Security
- Server-side validation
- Transaction verification
- Secure payment processing

### Data Protection
- Input validation
- MongoDB injection prevention
- XSS protection
- Rate limiting
- CORS configuration

## Environment Variables

```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/sesa

# Security
JWT_SECRET=your_secure_random_string_here

# CORS
CORS_ORIGIN=http://localhost:5173

# Payment (Optional)
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=...
```

## Deployment

### Production Checklist
- [ ] Set secure JWT_SECRET
- [ ] Configure production MongoDB
- [ ] Set CORS_ORIGIN to production URL
- [ ] Enable HTTPS
- [ ] Set up payment webhooks
- [ ] Configure email service
- [ ] Enable logging
- [ ] Set up monitoring
- [ ] Database backups
- [ ] Rate limiting

### Deploy to Production
```bash
# Build
npm run build

# Start
npm start
```

## Monitoring

### Logs
```bash
# View logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log
```

### Health Check
```bash
curl http://localhost:5000/
```

## Troubleshooting

### Database Connection Issues
```bash
# Check MongoDB status
systemctl status mongod

# Restart MongoDB
systemctl restart mongod
```

### Port Already in Use
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 <PID>
```

### JWT Token Issues
- Verify JWT_SECRET is set
- Check token expiration
- Ensure proper Authorization header

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License

## Support

For issues or questions:
- Check API_DOCUMENTATION.md
- Check IMPLEMENTATION_GUIDE.md
- Contact development team

## Changelog

### Version 2.0.0 (Current)
- ✅ 14 role-based access control
- ✅ Payment system integration
- ✅ Video access control (Part 1 free)
- ✅ Advanced analytics
- ✅ Certificate system
- ✅ Role-specific dashboards
- ✅ Enhanced user management
- ✅ Progress tracking
- ✅ Real-time notifications

### Version 1.0.0
- Basic course management
- User authentication
- Simple enrollment system
