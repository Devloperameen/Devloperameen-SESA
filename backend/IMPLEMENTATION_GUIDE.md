# Backend Implementation Guide

## Overview
This guide explains the enhanced backend implementation with 14+ roles, payment integration, and video access control.

---

## New Features Implemented

### 1. Extended Role System (14 Roles)

#### Admin Roles
- **SUPER_ADMIN**: Complete system control
- **ADMIN**: System administration
- **MODERATOR**: Content and user moderation
- **CONTENT_MANAGER**: Course content oversight
- **SUPPORT_STAFF**: User support and assistance

#### Instructor Roles
- **INSTRUCTOR**: Full course creation and management
- **ASSISTANT_INSTRUCTOR**: Course assistance
- **GUEST_INSTRUCTOR**: Limited instructor privileges

#### Student Roles
- **STUDENT**: Standard student access
- **PREMIUM_STUDENT**: Enhanced features
- **TRIAL_STUDENT**: Trial period access

#### Specialized Roles
- **REVIEWER**: Content review and approval
- **ANALYST**: Analytics and reporting
- **FINANCE_MANAGER**: Financial operations

### 2. Payment System

#### Features
- Multiple payment methods (Stripe, PayPal, Bank Transfer, Cash)
- Payment status tracking (pending, completed, failed, refunded)
- Auto-enrollment after successful payment
- Refund processing
- Revenue analytics

#### Models
- **Payment**: Transaction records
- Links users to courses
- Tracks payment status and metadata

#### Controllers
- `createPayment`: Initiate payment
- `confirmPayment`: Complete payment and grant access
- `getUserPayments`: User payment history
- `getAllPayments`: Admin payment overview
- `refundPayment`: Process refunds

### 3. Video Access Control

#### Part 1 (Preview)
- Always accessible to authenticated users
- No payment required
- Encourages enrollment

#### Parts 2+ (Full Content)
- Requires payment OR approved enrollment
- Middleware checks access
- Returns 403 with payment prompt if unauthorized

#### Middleware
- `checkVideoAccess`: Validates access per video
- `checkFullCourseAccess`: Validates full course access

### 4. Certificate System

#### Features
- Auto-generate on course completion
- Unique certificate numbers
- Verification system (public)
- Certificate revocation (admin)

#### Models
- **Certificate**: Certificate records
- Links to user and course
- Includes issue date and certificate URL

### 5. Analytics System

#### Dashboard Analytics
- Role-specific metrics
- Real-time statistics
- Trend analysis

#### Course Analytics
- Enrollment tracking
- Completion rates
- Revenue per course
- Active student monitoring

#### System Analytics
- User growth
- Course performance
- Top instructors
- Revenue trends

### 6. Role-Based Dashboards

Each role has a customized dashboard with:
- Relevant statistics
- Quick actions
- Recent activity
- Role-specific tools

#### Implementation
```typescript
// Dashboard controller automatically detects role
// and returns appropriate data
GET /api/dashboard
```

---

## Database Models

### Enhanced User Model
```typescript
{
  name: string
  email: string
  password: string
  role: UserRole (14 options)
  permissions: string[]
  isActive: boolean
  profileImage: string
  bio: string
  phone: string
  address: string
  dateOfBirth: Date
  enrolledCourses: ObjectId[]
  completedCourses: ObjectId[]
  createdAt: Date
  updatedAt: Date
}
```

### Payment Model
```typescript
{
  user: ObjectId
  course: ObjectId
  amount: number
  currency: string
  paymentMethod: 'stripe' | 'paypal' | 'bank_transfer' | 'cash'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId: string
  paymentDate: Date
  metadata: object
}
```

### Certificate Model
```typescript
{
  user: ObjectId
  course: ObjectId
  certificateNumber: string (unique)
  issuedDate: Date
  expiryDate: Date
  grade: string
  certificateUrl: string
}
```

### Analytics Model
```typescript
{
  course: ObjectId
  instructor: ObjectId
  totalEnrollments: number
  activeStudents: number
  completionRate: number
  averageProgress: number
  totalRevenue: number
  viewCount: number
  rating: number
  reviews: number
  date: Date
}
```

---

## API Routes Structure

```
/api
├── /auth
│   ├── POST /register
│   └── POST /login
├── /dashboard
│   └── GET / (role-specific)
├── /courses
│   ├── GET / (all courses)
│   ├── GET /:id (single course)
│   ├── POST / (create)
│   ├── PUT /:id (update)
│   ├── DELETE /:id (delete)
│   ├── GET /my/created (instructor)
│   ├── GET /my/enrolled (student)
│   ├── POST /enroll/:id (request enrollment)
│   ├── GET /:courseId/content (protected content)
│   └── /comments (CRUD)
├── /payments
│   ├── POST /create
│   ├── POST /:paymentId/confirm
│   ├── GET /my-payments
│   ├── GET /all (admin)
│   └── POST /:paymentId/refund (admin)
├── /enrollments
│   ├── POST /request/:courseId
│   ├── GET /pending (admin)
│   └── PUT /:enrollmentId (admin)
├── /certificates
│   ├── POST /generate/:courseId
│   ├── GET /my-certificates
│   ├── GET /verify/:certificateNumber (public)
│   ├── GET /all (admin)
│   └── DELETE /:certificateId (admin)
├── /analytics
│   ├── GET /dashboard
│   ├── GET /course/:courseId
│   └── GET /system (admin)
├── /admin/management
│   ├── /users (CRUD)
│   ├── /enrollments (manage)
│   ├── /courses (manage)
│   └── /stats
├── /progress
│   ├── POST /:courseId
│   └── GET /my-progress
├── /categories
│   └── CRUD operations
└── /announcements
    └── CRUD operations
```

---

## Middleware

### Authentication
```typescript
authenticate: Verify JWT token
optionalAuthenticate: Attach user if token present
```

### Authorization
```typescript
checkRole([roles]): Verify user has required role
```

### Video Access
```typescript
checkVideoAccess: Validate video access per index
checkFullCourseAccess: Validate full course access
```

### Enrollment Verification
```typescript
verifyAccess: Check enrollment approval status
```

---

## Payment Flow

### 1. Student Views Course
```
GET /api/courses/:id
→ Returns preview video (Part 1)
→ Shows "Enroll" or "Purchase" button
```

### 2. Student Initiates Payment
```
POST /api/payments/create
{
  courseId: "...",
  paymentMethod: "stripe",
  amount: 99.99
}
→ Returns payment intent
```

### 3. Payment Processing
```
// Frontend handles payment with Stripe/PayPal
// On success, confirm payment
POST /api/payments/:paymentId/confirm
→ Updates payment status
→ Auto-approves enrollment
→ Grants course access
```

### 4. Access Full Content
```
GET /api/courses/:courseId/content
→ Middleware checks payment/enrollment
→ Returns full course content
```

---

## Video Access Implementation

### Frontend Logic
```typescript
// Check video index
if (videoIndex === 0) {
  // Part 1 - Always show
  displayVideo(previewUrl);
} else {
  // Check access
  const hasAccess = await checkCourseAccess(courseId);
  
  if (hasAccess) {
    displayVideo(videoUrl);
  } else {
    showPaymentPrompt(course);
  }
}
```

### Backend Middleware
```typescript
// In course routes
router.get('/:courseId/content', 
  authenticate, 
  checkFullCourseAccess, 
  getContent
);
```

---

## Role-Based Access Examples

### Super Admin
```typescript
// Can access everything
checkRole([UserRole.SUPER_ADMIN])
```

### Instructor
```typescript
// Can manage own courses
if (course.instructor.toString() === userId || isAdmin) {
  // Allow access
}
```

### Student
```typescript
// Can access enrolled courses
const enrollment = await Enrollment.findOne({
  user: userId,
  course: courseId,
  status: 'approved'
});
```

### Finance Manager
```typescript
// Can manage payments
checkRole([UserRole.FINANCE_MANAGER, UserRole.ADMIN])
```

---

## Dashboard Implementation

### Controller Logic
```typescript
export const getDashboard = async (req, res) => {
  const role = req.user.role;
  
  switch (role) {
    case UserRole.ADMIN:
      return getAdminDashboard();
    case UserRole.INSTRUCTOR:
      return getInstructorDashboard();
    case UserRole.STUDENT:
      return getStudentDashboard();
    // ... other roles
  }
};
```

### Dashboard Data Structure
```typescript
{
  role: "instructor",
  stats: {
    totalCourses: 5,
    totalEnrollments: 120,
    totalRevenue: 5000,
    activeStudents: 85
  },
  myCourses: [...],
  pendingEnrollments: [...],
  recentComments: [...],
  quickActions: [
    { label: "Create Course", route: "/instructor/create" },
    { label: "My Courses", route: "/instructor/courses" }
  ]
}
```

---

## Security Considerations

### 1. Authentication
- JWT tokens with expiration
- Secure password hashing (bcrypt)
- Token refresh mechanism

### 2. Authorization
- Role-based access control
- Permission checking
- Resource ownership validation

### 3. Payment Security
- Server-side validation
- Transaction verification
- Secure payment processing

### 4. Data Protection
- Input validation
- SQL injection prevention (Mongoose)
- XSS protection
- Rate limiting

---

## Testing

### Unit Tests
```bash
npm test
```

### API Testing
Use Postman collection or:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Role Testing
Create test users for each role and verify:
- Dashboard access
- API permissions
- Resource access

---

## Deployment

### Environment Setup
```env
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=secure_random_string
CORS_ORIGIN=https://yourdomain.com
STRIPE_SECRET_KEY=sk_...
PAYPAL_CLIENT_ID=...
```

### Production Checklist
- [ ] Set secure JWT_SECRET
- [ ] Configure CORS properly
- [ ] Enable HTTPS
- [ ] Set up payment webhooks
- [ ] Configure email notifications
- [ ] Set up monitoring
- [ ] Enable logging
- [ ] Database backups

---

## Maintenance

### Regular Tasks
1. Monitor payment transactions
2. Review user enrollments
3. Check system analytics
4. Update course content
5. Process refunds
6. Generate reports

### Database Maintenance
```bash
# Backup
mongodump --uri="mongodb://..."

# Restore
mongorestore --uri="mongodb://..." dump/
```

---

## Future Enhancements

### Planned Features
1. Email notifications
2. SMS alerts
3. Advanced analytics
4. Course recommendations
5. Live streaming
6. Interactive quizzes
7. Discussion forums
8. Mobile app API
9. Third-party integrations
10. Advanced reporting

---

## Support

### Documentation
- API_DOCUMENTATION.md
- TEST_CREDENTIALS.md
- README.md

### Contact
For technical support, contact the development team.
