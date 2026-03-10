# SESA Backend API Documentation

## Overview
Comprehensive Learning Management System with 14+ role-based access control, payment integration, and advanced analytics.

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## User Roles

### Admin Roles
- **SUPER_ADMIN**: Full system access
- **ADMIN**: System administration
- **MODERATOR**: Content moderation
- **CONTENT_MANAGER**: Course content management
- **SUPPORT_STAFF**: User support

### Instructor Roles
- **INSTRUCTOR**: Create and manage courses
- **ASSISTANT_INSTRUCTOR**: Assist with course management
- **GUEST_INSTRUCTOR**: Limited instructor access

### Student Roles
- **STUDENT**: Basic student access
- **PREMIUM_STUDENT**: Premium features
- **TRIAL_STUDENT**: Trial period access

### Specialized Roles
- **REVIEWER**: Review and approve content
- **ANALYST**: Access to analytics
- **FINANCE_MANAGER**: Financial management

---

## API Endpoints

### Authentication (`/api/auth`)

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "token": "jwt_token",
  "user": { ... }
}
```

---

### Dashboard (`/api/dashboard`)

#### Get Role-Specific Dashboard
```http
GET /api/dashboard
Authorization: Bearer <token>

Response: Role-specific dashboard data
```

---

### Courses (`/api/courses`)

#### Get All Courses
```http
GET /api/courses
Authorization: Bearer <token> (optional)

Query Parameters:
- category: Filter by category ID
- level: beginner|intermediate|advanced
- search: Search term
```

#### Get Single Course
```http
GET /api/courses/:id
Authorization: Bearer <token>

Response:
- Preview video (Part 1) always accessible
- Full content requires payment/enrollment
```

#### Create Course (Instructor/Admin)
```http
POST /api/courses
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Course Title",
  "description": "Course description",
  "resourceUrl": "https://youtube.com/watch?v=...",
  "previewVideoUrl": "https://youtube.com/watch?v=...",
  "enrolledContentUrls": ["url1", "url2", ...],
  "category": "category_id",
  "level": "beginner",
  "duration": "10 hours",
  "price": 99.99,
  "tags": ["tag1", "tag2"]
}
```

#### Update Course
```http
PUT /api/courses/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 149.99,
  ...
}
```

#### Delete Course
```http
DELETE /api/courses/:id
Authorization: Bearer <token>
```

#### Get My Created Courses (Instructor)
```http
GET /api/courses/my/created
Authorization: Bearer <token>
```

#### Get My Enrolled Courses (Student)
```http
GET /api/courses/my/enrolled
Authorization: Bearer <token>

Query Parameters:
- approved: true (only approved enrollments)
```

#### Request Enrollment
```http
POST /api/courses/enroll/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "watchedPart1": true
}
```

#### Get Course Content (Protected)
```http
GET /api/courses/:courseId/content
Authorization: Bearer <token>

Requires: Payment or approved enrollment
```

#### Course Comments
```http
GET /api/courses/:id/comments
POST /api/courses/:id/comments
DELETE /api/courses/:id/comments/:commentId
Authorization: Bearer <token>
```

---

### Payments (`/api/payments`)

#### Create Payment
```http
POST /api/payments/create
Authorization: Bearer <token>
Content-Type: application/json

{
  "courseId": "course_id",
  "paymentMethod": "stripe|paypal|bank_transfer|cash",
  "amount": 99.99
}

Response:
{
  "payment": { ... },
  "clientSecret": "transaction_id"
}
```

#### Confirm Payment
```http
POST /api/payments/:paymentId/confirm
Authorization: Bearer <token>

Response:
- Payment confirmed
- Enrollment auto-approved
- Course access granted
```

#### Get My Payments
```http
GET /api/payments/my-payments
Authorization: Bearer <token>
```

#### Get All Payments (Admin/Finance)
```http
GET /api/payments/all
Authorization: Bearer <token>

Query Parameters:
- status: pending|completed|failed|refunded
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD
```

#### Refund Payment (Admin/Finance)
```http
POST /api/payments/:paymentId/refund
Authorization: Bearer <token>
```

---

### Enrollments (`/api/enrollments`)

#### Request Access
```http
POST /api/enrollments/request/:courseId
Authorization: Bearer <token>
```

#### Get Pending Requests (Admin)
```http
GET /api/enrollments/pending
Authorization: Bearer <token>
```

#### Update Enrollment Status (Admin)
```http
PUT /api/enrollments/:enrollmentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved|rejected"
}
```

---

### Certificates (`/api/certificates`)

#### Generate Certificate
```http
POST /api/certificates/generate/:courseId
Authorization: Bearer <token>

Requires: Course completion
```

#### Get My Certificates
```http
GET /api/certificates/my-certificates
Authorization: Bearer <token>
```

#### Verify Certificate (Public)
```http
GET /api/certificates/verify/:certificateNumber
```

#### Get All Certificates (Admin)
```http
GET /api/certificates/all
Authorization: Bearer <token>
```

#### Revoke Certificate (Admin)
```http
DELETE /api/certificates/:certificateId
Authorization: Bearer <token>
```

---

### Analytics (`/api/analytics`)

#### Get Dashboard Analytics
```http
GET /api/analytics/dashboard
Authorization: Bearer <token>

Returns role-specific analytics:
- Instructor: Course performance, revenue, students
- Student: Progress, completion, watch time
- Admin: System-wide statistics
```

#### Get Course Analytics
```http
GET /api/analytics/course/:courseId
Authorization: Bearer <token>

Returns:
- Enrollment stats
- Completion rate
- Revenue
- Active students
```

#### Get System Analytics (Admin)
```http
GET /api/analytics/system
Authorization: Bearer <token>

Returns:
- User statistics
- Course statistics
- Top courses
- Top instructors
- Revenue trends
```

---

### Progress (`/api/progress`)

#### Track Progress
```http
POST /api/progress/:courseId
Authorization: Bearer <token>
Content-Type: application/json

{
  "minutesWatched": 30,
  "completed": false
}
```

#### Get My Progress
```http
GET /api/progress/my-progress
Authorization: Bearer <token>
```

---

### Admin Management (`/api/admin/management`)

#### Get All Users
```http
GET /api/admin/management/users
Authorization: Bearer <token>

Query Parameters:
- role: Filter by role
- isActive: true|false
- search: Search term
```

#### Get User by ID
```http
GET /api/admin/management/users/:userId
Authorization: Bearer <token>
```

#### Create User
```http
POST /api/admin/management/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password123",
  "role": "student",
  "permissions": ["permission1", "permission2"]
}
```

#### Update User Role
```http
PUT /api/admin/management/users/:userId/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "instructor",
  "permissions": ["create_course", "manage_students"],
  "isActive": true
}
```

#### Delete User
```http
DELETE /api/admin/management/users/:userId
Authorization: Bearer <token>
```

#### Get Pending Approvals
```http
GET /api/admin/management/enrollments/pending
Authorization: Bearer <token>
```

#### Bulk Approve Enrollments
```http
POST /api/admin/management/enrollments/bulk-approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "enrollmentIds": ["id1", "id2", "id3"]
}
```

#### Manage Course Status
```http
PUT /api/admin/management/courses/:courseId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved|rejected|pending",
  "isPublished": true
}
```

#### Get System Stats
```http
GET /api/admin/management/stats
Authorization: Bearer <token>
```

---

### Categories (`/api/categories`)

#### Get All Categories
```http
GET /api/categories
```

#### Create Category (Admin)
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Category Name",
  "icon": "icon-name"
}
```

---

### Announcements (`/api/announcements`)

#### Get Active Announcements
```http
GET /api/announcements
```

#### Create Announcement (Admin)
```http
POST /api/announcements
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Announcement Title",
  "message": "Announcement message",
  "type": "info|warning|success",
  "isActive": true
}
```

---

## Video Access Control

### Part 1 (Preview)
- Always accessible to all authenticated users
- No payment required
- Used to attract students

### Parts 2+ (Full Content)
- Requires payment OR approved enrollment
- Access checked via middleware
- Returns 403 if not authorized

### Implementation
```javascript
// Frontend check
if (videoIndex === 0) {
  // Show video directly
} else {
  // Check payment/enrollment status
  // Show payment prompt if needed
}
```

---

## Role-Based Dashboard Features

### Super Admin Dashboard
- Total users, courses, revenue
- User management
- System analytics
- All administrative functions

### Admin Dashboard
- User management
- Course approvals
- Enrollment management
- Payment oversight

### Moderator Dashboard
- Pending enrollments
- Course reviews
- Comment moderation

### Content Manager Dashboard
- Course management
- Category management
- Content analytics

### Instructor Dashboard
- My courses
- Student enrollments
- Revenue tracking
- Course analytics
- Student comments

### Student Dashboard
- Enrolled courses
- Progress tracking
- Certificates
- Recommended courses
- Payment history

### Finance Manager Dashboard
- Revenue reports
- Payment management
- Refund processing
- Financial analytics

### Analyst Dashboard
- User growth trends
- Course enrollment trends
- Top courses
- System analytics

### Reviewer Dashboard
- Pending course reviews
- Approval history

### Support Staff Dashboard
- User support
- Enrollment issues
- Payment issues

---

## Error Responses

### 400 Bad Request
```json
{
  "message": "Error description",
  "errors": [...]
}
```

### 401 Unauthorized
```json
{
  "message": "No token, authorization denied"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied: Insufficient permissions",
  "requiresPayment": true,
  "coursePrice": 99.99
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Server Error
```json
{
  "message": "Server error"
}
```

---

## WebSocket Events

### Real-time Notifications
```javascript
socket.on('notification', (data) => {
  // Handle notification
});

socket.on('enrollment_approved', (data) => {
  // Handle enrollment approval
});

socket.on('payment_confirmed', (data) => {
  // Handle payment confirmation
});
```

---

## Best Practices

1. **Always include JWT token** for protected routes
2. **Check video access** before displaying content
3. **Handle payment flow** properly (create → confirm)
4. **Use role-specific dashboards** for better UX
5. **Implement proper error handling**
6. **Cache frequently accessed data**
7. **Use pagination** for large datasets
8. **Validate all inputs** on frontend and backend

---

## Environment Variables

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sesa
JWT_SECRET=your_jwt_secret
CORS_ORIGIN=http://localhost:5173
```

---

## Testing

### Test Credentials
See TEST_CREDENTIALS.md for role-specific test accounts.

### API Testing
Use Postman, Insomnia, or curl to test endpoints.

---

## Support

For issues or questions, contact the development team.
