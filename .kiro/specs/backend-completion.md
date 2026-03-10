---
title: SESA Academy Backend - Complete Implementation
status: requirements
created: 2026-03-04
---

# SESA Academy Backend - Complete Implementation

## Overview
This spec defines the complete backend implementation for SESA (Safe Educational & Skill Academy) platform. The backend is partially implemented with basic authentication and course management. This spec will complete the implementation with all required features for a production-ready educational platform.

## Current State Analysis

### ✅ Already Implemented
- **Tech Stack**: Node.js + Express + TypeScript + MongoDB (Mongoose)
- **Security**: Helmet, CORS, Rate Limiting, JWT Authentication
- **Models**: User (with roles: admin, instructor, student), Course
- **Auth Routes**: Register, Login with role-based access
- **Course Routes**: Create, List, Enroll, Approve enrollment, Get single course
- **Middleware**: Authentication, Authorization (role-based)
- **Validation**: Express-validator for input sanitization

### 🔨 Needs Implementation
- User profile management (update, delete, get profile)
- Course management (update, delete by instructor/admin)
- Student progress tracking
- Certificates generation and management
- Instructor analytics and earnings
- Admin dashboard data (user management, approvals, reports)
- File upload for course resources
- Search and filter functionality
- Notifications system
- Enrollment history and status tracking
- Course categories/tags
- Reviews and ratings
- Error handling middleware
- Logging system
- API documentation

---

# Requirements

## 1. User Management

### 1.1 User Profile Operations
- **GET /api/users/profile** - Get current user profile (authenticated)
- **PUT /api/users/profile** - Update user profile (name, email, password)
- **DELETE /api/users/profile** - Soft delete user account
- **GET /api/users/:id** - Get user by ID (admin only)
- **GET /api/users** - List all users with filters (admin only)
- **PATCH /api/users/:id/role** - Update user role (admin only)
- **DELETE /api/users/:id** - Delete user (admin only)

### 1.2 User Statistics
- **GET /api/users/stats** - Get user statistics (role-specific)
  - Student: enrolled courses, completed, pending, certificates
  - Instructor: total courses, total students, pending enrollments, avg rating
  - Admin: total users, total courses, pending approvals, active sessions

## 2. Course Management (Enhanced)

### 2.1 CRUD Operations
- **PUT /api/courses/:id** - Update course (instructor/admin only)
- **DELETE /api/courses/:id** - Delete course (instructor/admin only)
- **GET /api/courses/my-courses** - Get courses by current user (instructor)
- **GET /api/courses/enrolled** - Get enrolled courses (student)

### 2.2 Course Features
- **POST /api/courses/:id/unenroll** - Unenroll from course (student)
- **GET /api/courses/:id/students** - Get enrolled students (instructor/admin)
- **PATCH /api/courses/:id/reject/:studentId** - Reject enrollment (instructor/admin)
- **POST /api/courses/:id/complete** - Mark course as completed (student)

### 2.3 Course Categories & Search
- **GET /api/courses/categories** - Get all course categories
- **GET /api/courses/search** - Search courses by title, description, category
- **GET /api/courses/filter** - Filter courses by instructor, category, status

## 3. Progress Tracking

### 3.1 Student Progress
- **POST /api/progress/:courseId** - Update progress for a course
- **GET /api/progress/:courseId** - Get progress for a course
- **GET /api/progress/student/:studentId** - Get all progress for a student (admin/instructor)

### 3.2 Progress Model
```typescript
{
  student: ObjectId,
  course: ObjectId,
  progress: Number (0-100),
  completedLessons: [String],
  lastAccessed: Date,
  status: 'in-progress' | 'completed',
  completedAt: Date
}
```

## 4. Certificates

### 4.1 Certificate Operations
- **POST /api/certificates/generate/:courseId** - Generate certificate (auto on completion)
- **GET /api/certificates** - Get all certificates for current user
- **GET /api/certificates/:id** - Get certificate by ID
- **GET /api/certificates/verify/:code** - Verify certificate authenticity

### 4.2 Certificate Model
```typescript
{
  student: ObjectId,
  course: ObjectId,
  certificateCode: String (unique),
  issuedDate: Date,
  expiryDate: Date (optional),
  grade: String (optional),
  pdfUrl: String (optional)
}
```

## 5. Reviews & Ratings

### 5.1 Review Operations
- **POST /api/reviews/:courseId** - Add review (student only, after completion)
- **GET /api/reviews/:courseId** - Get all reviews for a course
- **PUT /api/reviews/:id** - Update own review
- **DELETE /api/reviews/:id** - Delete own review (or admin)

### 5.2 Review Model
```typescript
{
  student: ObjectId,
  course: ObjectId,
  rating: Number (1-5),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

## 6. Notifications

### 6.1 Notification Operations
- **GET /api/notifications** - Get all notifications for current user
- **PATCH /api/notifications/:id/read** - Mark notification as read
- **DELETE /api/notifications/:id** - Delete notification
- **POST /api/notifications/mark-all-read** - Mark all as read

### 6.2 Notification Model
```typescript
{
  user: ObjectId,
  type: 'enrollment' | 'approval' | 'rejection' | 'completion' | 'certificate' | 'system',
  title: String,
  message: String,
  read: Boolean,
  link: String (optional),
  createdAt: Date
}
```

## 7. Analytics & Reports

### 7.1 Instructor Analytics
- **GET /api/analytics/instructor** - Get instructor dashboard data
  - Total courses, students, revenue
  - Course-wise enrollment stats
  - Student progress overview
  - Recent enrollments

### 7.2 Admin Reports
- **GET /api/analytics/admin** - Get admin dashboard data
  - User growth statistics
  - Course statistics
  - Enrollment trends
  - Revenue reports
  - System health metrics

## 8. File Upload

### 8.1 Upload Operations
- **POST /api/upload/course-resource** - Upload course resource file
- **POST /api/upload/profile-picture** - Upload profile picture
- **DELETE /api/upload/:fileId** - Delete uploaded file

### 8.2 Requirements
- Use multer for file handling
- Store files in /uploads directory or cloud storage (AWS S3)
- Validate file types and sizes
- Generate unique filenames

## 9. Error Handling & Logging

### 9.1 Global Error Handler
- Centralized error handling middleware
- Consistent error response format
- Error logging to file/service

### 9.2 Request Logging
- Log all API requests (method, path, status, duration)
- Log errors with stack traces
- Use winston or similar logging library

## 10. API Documentation

### 10.1 Documentation Requirements
- Use Swagger/OpenAPI specification
- Document all endpoints with:
  - Request parameters
  - Request body schemas
  - Response schemas
  - Authentication requirements
  - Example requests/responses

---

# Design

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 18+
- **Framework**: Express.js 5.x
- **Language**: TypeScript 5.x
- **Database**: MongoDB 7.x with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: helmet, cors, express-rate-limit, bcryptjs

### Additional Dependencies
- **File Upload**: multer
- **Logging**: winston
- **API Docs**: swagger-ui-express, swagger-jsdoc
- **Testing**: jest, supertest (optional)
- **Environment**: dotenv

## Database Schema Design

### Enhanced User Model
```typescript
{
  name: String (required),
  email: String (required, unique, indexed),
  password: String (required, hashed),
  role: Enum ['admin', 'instructor', 'student'],
  profilePicture: String (URL),
  bio: String,
  phone: String,
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Enhanced Course Model
```typescript
{
  title: String (required, indexed),
  description: String (required),
  category: String (indexed),
  tags: [String],
  resourceUrl: String (required),
  thumbnailUrl: String,
  instructor: ObjectId (ref: User, required, indexed),
  students: [{
    studentId: ObjectId (ref: User),
    status: Enum ['pending', 'approved', 'rejected'],
    enrolledAt: Date,
    approvedAt: Date
  }],
  price: Number (default: 0),
  duration: String,
  level: Enum ['beginner', 'intermediate', 'advanced'],
  isPublished: Boolean (default: true),
  averageRating: Number (default: 0),
  totalReviews: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Progress Model (New)
```typescript
{
  student: ObjectId (ref: User, required, indexed),
  course: ObjectId (ref: Course, required, indexed),
  progress: Number (0-100, default: 0),
  completedLessons: [String],
  lastAccessed: Date,
  status: Enum ['not-started', 'in-progress', 'completed'],
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
// Compound index on (student, course) for uniqueness
```

### Certificate Model (New)
```typescript
{
  student: ObjectId (ref: User, required, indexed),
  course: ObjectId (ref: Course, required, indexed),
  certificateCode: String (unique, indexed, required),
  issuedDate: Date (required),
  expiryDate: Date,
  grade: String,
  pdfUrl: String,
  isValid: Boolean (default: true),
  createdAt: Date
}
```

### Review Model (New)
```typescript
{
  student: ObjectId (ref: User, required, indexed),
  course: ObjectId (ref: Course, required, indexed),
  rating: Number (1-5, required),
  comment: String (max: 500),
  isApproved: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
// Compound index on (student, course) for uniqueness
```

### Notification Model (New)
```typescript
{
  user: ObjectId (ref: User, required, indexed),
  type: Enum ['enrollment', 'approval', 'rejection', 'completion', 'certificate', 'system'],
  title: String (required),
  message: String (required),
  read: Boolean (default: false, indexed),
  link: String,
  metadata: Mixed,
  createdAt: Date
}
```

## API Architecture

### Directory Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   └── swagger.ts
│   ├── middleware/
│   │   ├── auth.ts (existing)
│   │   ├── errorHandler.ts (new)
│   │   ├── logger.ts (new)
│   │   └── upload.ts (new)
│   ├── models/
│   │   ├── User.ts (existing, enhance)
│   │   ├── Course.ts (existing, enhance)
│   │   ├── Progress.ts (new)
│   │   ├── Certificate.ts (new)
│   │   ├── Review.ts (new)
│   │   └── Notification.ts (new)
│   ├── routes/
│   │   ├── auth.ts (existing)
│   │   ├── courses.ts (existing, enhance)
│   │   ├── users.ts (new)
│   │   ├── progress.ts (new)
│   │   ├── certificates.ts (new)
│   │   ├── reviews.ts (new)
│   │   ├── notifications.ts (new)
│   │   ├── analytics.ts (new)
│   │   └── upload.ts (new)
│   ├── controllers/ (optional, for cleaner code)
│   ├── services/ (optional, for business logic)
│   ├── utils/
│   │   ├── seed.ts (existing)
│   │   ├── generateCertificate.ts (new)
│   │   ├── sendNotification.ts (new)
│   │   └── helpers.ts (new)
│   ├── types/
│   │   └── express.d.ts (type definitions)
│   └── index.ts (existing, enhance)
├── uploads/ (for file storage)
├── logs/ (for log files)
├── .env
├── package.json
└── tsconfig.json
```

### Error Response Format
```typescript
{
  success: false,
  error: {
    message: string,
    code: string (optional),
    details: any (optional, only in development)
  }
}
```

### Success Response Format
```typescript
{
  success: true,
  data: any,
  message: string (optional),
  pagination: { (optional)
    page: number,
    limit: number,
    total: number,
    pages: number
  }
}
```

## Security Considerations

1. **Input Validation**: All inputs validated and sanitized
2. **SQL Injection**: Mongoose provides protection, but validate ObjectIds
3. **XSS Protection**: Helmet middleware, escape user inputs
4. **CSRF**: Not needed for stateless JWT API
5. **Rate Limiting**: Already implemented, consider per-endpoint limits
6. **File Upload**: Validate file types, sizes, scan for malware
7. **Password**: Bcrypt with salt rounds >= 10
8. **JWT**: Short expiry (8h), secure secret, HTTPS only in production
9. **CORS**: Restrict to frontend domain in production
10. **Logging**: Don't log sensitive data (passwords, tokens)

---

# Tasks

## Phase 1: Core Enhancements (Priority: High)

### Task 1.1: Enhance User Model and Routes
- [ ] Update User model with new fields (profilePicture, bio, phone, isActive, lastLogin)
- [ ] Create users.ts route file
- [ ] Implement GET /api/users/profile
- [ ] Implement PUT /api/users/profile
- [ ] Implement DELETE /api/users/profile (soft delete)
- [ ] Implement GET /api/users (admin only, with pagination)
- [ ] Implement GET /api/users/:id (admin only)
- [ ] Implement PATCH /api/users/:id/role (admin only)
- [ ] Implement DELETE /api/users/:id (admin only)
- [ ] Add input validation for all endpoints
- [ ] Add unit tests for user routes

### Task 1.2: Enhance Course Model and Routes
- [ ] Update Course model with new fields (category, tags, thumbnailUrl, price, duration, level, isPublished, averageRating, totalReviews)
- [ ] Implement PUT /api/courses/:id (instructor/admin)
- [ ] Implement DELETE /api/courses/:id (instructor/admin)
- [ ] Implement GET /api/courses/my-courses (instructor)
- [ ] Implement GET /api/courses/enrolled (student)
- [ ] Implement POST /api/courses/:id/unenroll (student)
- [ ] Implement GET /api/courses/:id/students (instructor/admin)
- [ ] Implement PATCH /api/courses/:id/reject/:studentId (instructor/admin)
- [ ] Implement GET /api/courses/categories
- [ ] Implement GET /api/courses/search (with query params)
- [ ] Add pagination to course listing
- [ ] Add unit tests for course routes

### Task 1.3: User Statistics Endpoint
- [ ] Implement GET /api/users/stats
- [ ] Calculate student statistics (enrolled, completed, pending, certificates)
- [ ] Calculate instructor statistics (courses, students, pending, rating)
- [ ] Calculate admin statistics (users, courses, approvals, sessions)
- [ ] Add caching for performance
- [ ] Add unit tests

## Phase 2: Progress & Completion (Priority: High)

### Task 2.1: Progress Tracking System
- [ ] Create Progress model with schema
- [ ] Create progress.ts route file
- [ ] Implement POST /api/progress/:courseId (update progress)
- [ ] Implement GET /api/progress/:courseId (get own progress)
- [ ] Implement GET /api/progress/student/:studentId (admin/instructor)
- [ ] Add validation for progress values (0-100)
- [ ] Auto-update course status based on progress
- [ ] Add unit tests

### Task 2.2: Course Completion
- [ ] Implement POST /api/courses/:id/complete (student)
- [ ] Validate 100% progress before completion
- [ ] Update Progress model status to 'completed'
- [ ] Trigger certificate generation
- [ ] Send completion notification
- [ ] Add unit tests

## Phase 3: Certificates (Priority: High)

### Task 3.1: Certificate System
- [ ] Create Certificate model with schema
- [ ] Create certificates.ts route file
- [ ] Implement POST /api/certificates/generate/:courseId
- [ ] Generate unique certificate code (UUID or custom format)
- [ ] Implement GET /api/certificates (get all for current user)
- [ ] Implement GET /api/certificates/:id
- [ ] Implement GET /api/certificates/verify/:code
- [ ] Add unit tests

### Task 3.2: Certificate Generation Utility
- [ ] Create generateCertificate.ts utility
- [ ] Generate PDF certificate (use pdfkit or similar)
- [ ] Include student name, course name, date, certificate code
- [ ] Store PDF in uploads/certificates/
- [ ] Return certificate URL
- [ ] Add error handling

## Phase 4: Reviews & Ratings (Priority: Medium)

### Task 4.1: Review System
- [ ] Create Review model with schema
- [ ] Create reviews.ts route file
- [ ] Implement POST /api/reviews/:courseId (student only, after completion)
- [ ] Implement GET /api/reviews/:courseId
- [ ] Implement PUT /api/reviews/:id (own review only)
- [ ] Implement DELETE /api/reviews/:id (own review or admin)
- [ ] Add validation (rating 1-5, comment max 500 chars)
- [ ] Add unit tests

### Task 4.2: Rating Aggregation
- [ ] Create utility to calculate average rating
- [ ] Update Course model averageRating and totalReviews on review add/update/delete
- [ ] Add index on course for efficient rating queries
- [ ] Add unit tests

## Phase 5: Notifications (Priority: Medium)

### Task 5.1: Notification System
- [ ] Create Notification model with schema
- [ ] Create notifications.ts route file
- [ ] Implement GET /api/notifications (with pagination)
- [ ] Implement PATCH /api/notifications/:id/read
- [ ] Implement DELETE /api/notifications/:id
- [ ] Implement POST /api/notifications/mark-all-read
- [ ] Add unit tests

### Task 5.2: Notification Triggers
- [ ] Create sendNotification.ts utility
- [ ] Trigger notification on enrollment request
- [ ] Trigger notification on enrollment approval/rejection
- [ ] Trigger notification on course completion
- [ ] Trigger notification on certificate generation
- [ ] Add system notifications for admins
- [ ] Add unit tests

## Phase 6: Analytics & Reports (Priority: Medium)

### Task 6.1: Instructor Analytics
- [ ] Create analytics.ts route file
- [ ] Implement GET /api/analytics/instructor
- [ ] Calculate total courses, students, revenue
- [ ] Calculate course-wise enrollment stats
- [ ] Calculate student progress overview
- [ ] Get recent enrollments
- [ ] Add caching for performance
- [ ] Add unit tests

### Task 6.2: Admin Reports
- [ ] Implement GET /api/analytics/admin
- [ ] Calculate user growth statistics (daily, weekly, monthly)
- [ ] Calculate course statistics
- [ ] Calculate enrollment trends
- [ ] Calculate revenue reports
- [ ] Add system health metrics
- [ ] Add caching for performance
- [ ] Add unit tests

## Phase 7: File Upload (Priority: Medium)

### Task 7.1: File Upload System
- [ ] Install multer and configure
- [ ] Create upload.ts middleware
- [ ] Create uploads/ directory structure
- [ ] Create upload.ts route file
- [ ] Implement POST /api/upload/course-resource
- [ ] Implement POST /api/upload/profile-picture
- [ ] Implement DELETE /api/upload/:fileId
- [ ] Validate file types (images, PDFs, videos)
- [ ] Validate file sizes (max 50MB for videos, 5MB for images)
- [ ] Generate unique filenames
- [ ] Add unit tests

### Task 7.2: Cloud Storage Integration (Optional)
- [ ] Install AWS SDK or similar
- [ ] Configure S3 bucket or alternative
- [ ] Update upload middleware to use cloud storage
- [ ] Update file URLs to use cloud URLs
- [ ] Add error handling for upload failures

## Phase 8: Error Handling & Logging (Priority: High)

### Task 8.1: Global Error Handler
- [ ] Create errorHandler.ts middleware
- [ ] Implement centralized error handling
- [ ] Create consistent error response format
- [ ] Handle different error types (validation, auth, not found, server)
- [ ] Log errors with stack traces
- [ ] Add unit tests

### Task 8.2: Request Logging
- [ ] Install winston
- [ ] Create logger.ts middleware
- [ ] Configure log levels (error, warn, info, debug)
- [ ] Log all API requests (method, path, status, duration)
- [ ] Log errors to error.log
- [ ] Log info to combined.log
- [ ] Rotate log files
- [ ] Add unit tests

### Task 8.3: Update index.ts
- [ ] Import and use errorHandler middleware
- [ ] Import and use logger middleware
- [ ] Add 404 handler for undefined routes
- [ ] Add graceful shutdown handling

## Phase 9: API Documentation (Priority: Medium)

### Task 9.1: Swagger Setup
- [ ] Install swagger-ui-express and swagger-jsdoc
- [ ] Create swagger.ts config file
- [ ] Configure Swagger UI route (/api-docs)
- [ ] Add OpenAPI 3.0 specification
- [ ] Document authentication scheme

### Task 9.2: Document All Endpoints
- [ ] Document auth routes (register, login)
- [ ] Document user routes (profile, list, update, delete)
- [ ] Document course routes (CRUD, enroll, approve)
- [ ] Document progress routes
- [ ] Document certificate routes
- [ ] Document review routes
- [ ] Document notification routes
- [ ] Document analytics routes
- [ ] Document upload routes
- [ ] Add request/response examples
- [ ] Add error response examples

## Phase 10: Testing & Optimization (Priority: Low)

### Task 10.1: Unit Tests
- [ ] Install jest and supertest
- [ ] Configure jest for TypeScript
- [ ] Write tests for auth routes
- [ ] Write tests for user routes
- [ ] Write tests for course routes
- [ ] Write tests for progress routes
- [ ] Write tests for certificate routes
- [ ] Write tests for review routes
- [ ] Write tests for notification routes
- [ ] Write tests for analytics routes
- [ ] Achieve 80%+ code coverage

### Task 10.2: Performance Optimization
- [ ] Add database indexes for frequently queried fields
- [ ] Implement caching for analytics endpoints (Redis optional)
- [ ] Optimize database queries (use lean(), select())
- [ ] Add pagination to all list endpoints
- [ ] Implement query result limiting
- [ ] Profile slow queries and optimize

### Task 10.3: Security Audit
- [ ] Review all authentication flows
- [ ] Review all authorization checks
- [ ] Review input validation
- [ ] Review file upload security
- [ ] Test rate limiting
- [ ] Test for common vulnerabilities (OWASP Top 10)
- [ ] Update dependencies to latest secure versions

## Phase 11: Deployment Preparation (Priority: Low)

### Task 11.1: Environment Configuration
- [ ] Create .env.example file
- [ ] Document all environment variables
- [ ] Add validation for required env vars on startup
- [ ] Configure different settings for dev/prod

### Task 11.2: Production Readiness
- [ ] Add health check endpoint (/health)
- [ ] Add readiness check endpoint (/ready)
- [ ] Configure production logging
- [ ] Configure production CORS
- [ ] Configure production rate limits
- [ ] Add process monitoring (PM2 or similar)
- [ ] Create deployment documentation

### Task 11.3: Database Migration
- [ ] Create seed script for initial data
- [ ] Create migration scripts for schema changes
- [ ] Document database backup/restore procedures
- [ ] Test database connection pooling

---

# Success Criteria

## Functional Requirements
- ✅ All API endpoints implemented and working
- ✅ All CRUD operations functional
- ✅ Role-based access control working correctly
- ✅ File upload and storage working
- ✅ Certificate generation working
- ✅ Notifications sent on appropriate triggers
- ✅ Analytics data accurate and performant

## Non-Functional Requirements
- ✅ API response time < 500ms for 95% of requests
- ✅ Support 100+ concurrent users
- ✅ 99.9% uptime
- ✅ All inputs validated and sanitized
- ✅ All sensitive data encrypted
- ✅ Comprehensive error handling
- ✅ Complete API documentation
- ✅ 80%+ test coverage

## Documentation
- ✅ API documentation (Swagger)
- ✅ README with setup instructions
- ✅ Environment variables documented
- ✅ Database schema documented
- ✅ Deployment guide

---

# Notes

## Frontend Integration Points
The frontend expects these API endpoints based on the Login.tsx and Dashboard.tsx analysis:

1. **Authentication**
   - POST /api/auth/register (✅ implemented)
   - POST /api/auth/login (✅ implemented)

2. **User Profile**
   - GET /api/users/profile (needs implementation)
   - GET /api/users/stats (needs implementation)

3. **Courses**
   - GET /api/courses (✅ implemented)
   - GET /api/courses/:id (✅ implemented)
   - POST /api/courses (✅ implemented)
   - POST /api/courses/:id/enroll (✅ implemented)
   - GET /api/courses/my-courses (needs implementation)
   - GET /api/courses/enrolled (needs implementation)

4. **Dashboard Data**
   - Student: enrolled courses, completed, pending, certificates
   - Instructor: courses, students, pending enrollments, rating
   - Admin: users, courses, approvals, active sessions

## Environment Variables Required
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/sesa
JWT_SECRET=your_secure_secret_key
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=52428800
LOG_LEVEL=info
```

## Dependencies to Add
```json
{
  "multer": "^1.4.5-lts.1",
  "winston": "^3.11.0",
  "swagger-ui-express": "^5.0.0",
  "swagger-jsdoc": "^6.2.8",
  "pdfkit": "^0.14.0",
  "uuid": "^9.0.1"
}
```

## DevDependencies to Add
```json
{
  "@types/multer": "^1.4.11",
  "@types/swagger-ui-express": "^4.1.6",
  "@types/swagger-jsdoc": "^6.0.4",
  "@types/pdfkit": "^0.13.4",
  "@types/uuid": "^9.0.7",
  "jest": "^29.7.0",
  "supertest": "^6.3.3",
  "@types/jest": "^29.5.11",
  "@types/supertest": "^6.0.2",
  "ts-jest": "^29.1.1"
}
```
