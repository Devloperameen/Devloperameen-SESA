---
title: SESA Academy - Full System Alignment
status: in-progress
created: 2026-03-04
priority: critical
---

# Full System Alignment - SESA Academy

## Problem Statement

The MERN application has the following critical issues:
1. ❌ Students can see Admin/Instructor actions (RBAC broken)
2. ❌ Quick Actions buttons do nothing (no functionality)
3. ❌ App loses state after login (auth persistence broken)
4. ❌ No YouTube URL validation/parsing
5. ❌ No Category system
6. ❌ No toast notifications
7. ❌ No loading states

## Solution Overview

This spec will fix all issues through systematic implementation of:
1. Proper RBAC with frontend guards
2. Auth persistence with localStorage
3. Complete Quick Actions functionality
4. YouTube URL parsing
5. Category management system
6. Toast notifications
7. Loading states

---

# Phase 1: Auth Persistence & RBAC Foundation

## Task 1.1: Fix AuthContext with Persistence

**File:** `frontend/src/context/AuthContext.tsx`

**Changes:**
- Add `useEffect` to load user/token from localStorage on mount
- Update login to save to localStorage
- Update logout to clear localStorage
- Add `isLoading` state for initial auth check

**Implementation:**
```typescript
const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
});
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
    // Load from localStorage on mount
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            setAuthState({ user, token });
        } catch (err) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }
    setIsLoading(false);
}, []);
```

## Task 1.2: Create Protected Route Component

**File:** `frontend/src/components/ProtectedRoute.tsx` (NEW)

**Purpose:** Wrap routes that require authentication

**Implementation:**
```typescript
interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    
    if (isLoading) return <LoadingSpinner />;
    if (!isAuthenticated) return <Navigate to="/" />;
    if (allowedRoles && !allowedRoles.includes(user!.role)) {
        return <Navigate to="/dashboard" />;
    }
    
    return <>{children}</>;
};
```

## Task 1.3: Update App.tsx with Protected Routes

**File:** `frontend/src/App.tsx`

**Changes:**
- Wrap Dashboard with ProtectedRoute
- Add role-specific routes
- Add 404 page

---

# Phase 2: Backend - Category System

## Task 2.1: Create Category Model

**File:** `backend/src/models/Category.ts` (NEW)

**Schema:**
```typescript
{
    name: String (required, unique),
    description: String,
    icon: String (emoji or icon class),
    isActive: Boolean (default: true),
    createdAt: Date,
    updatedAt: Date
}
```

## Task 2.2: Create Category Routes

**File:** `backend/src/routes/categories.ts` (NEW)

**Endpoints:**
- `POST /api/categories` - Create category (admin only)
- `GET /api/categories` - Get all active categories (public)
- `GET /api/categories/:id` - Get category by ID
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)

## Task 2.3: Update Course Model

**File:** `backend/src/models/Course.ts`

**Add Fields:**
```typescript
{
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    youtubeVideoId: String (extracted from URL),
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    tags: [String],
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    duration: String,
    thumbnailUrl: String
}
```

## Task 2.4: YouTube URL Parser Utility

**File:** `backend/src/utils/youtubeParser.ts` (NEW)

**Function:**
```typescript
export const extractYouTubeId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
};

export const validateYouTubeUrl = (url: string): boolean => {
    return extractYouTubeId(url) !== null;
};
```

## Task 2.5: Update Course Creation with YouTube Parsing

**File:** `backend/src/routes/courses.ts`

**Changes:**
- Add YouTube URL validation
- Extract videoId before saving
- Add category validation

---

# Phase 3: Backend - Admin & Instructor Endpoints

## Task 3.1: Admin Analytics Endpoint

**File:** `backend/src/routes/admin.ts` (NEW)

**Endpoints:**
- `GET /api/admin/stats` - Platform-wide statistics
- `GET /api/admin/pending-approvals` - All pending enrollments
- `PATCH /api/admin/approve-course/:id` - Approve course
- `PATCH /api/admin/reject-course/:id` - Reject course

## Task 3.2: Instructor Analytics Endpoint

**File:** `backend/src/routes/instructor.ts` (NEW)

**Endpoints:**
- `GET /api/instructor/stats` - Instructor statistics
- `GET /api/instructor/students` - All students across courses
- `GET /api/instructor/pending-enrollments` - Pending enrollments

## Task 3.3: Student Enrolled Courses (Approved Only)

**File:** `backend/src/routes/courses.ts`

**Update:** `/my/enrolled` endpoint to filter by status

```typescript
router.get('/my/enrolled', authenticate, authorize([UserRole.STUDENT]), async (req: any, res: Response) => {
    const approvedOnly = req.query.approved === 'true';
    const query: any = { 'students.studentId': req.user.id };
    
    if (approvedOnly) {
        query['students.status'] = 'approved';
    }
    
    const courses = await Course.find(query)
        .populate('instructor', 'name')
        .populate('category', 'name icon');
    
    // Filter and add enrollment status
    const coursesWithStatus = courses.map(course => {
        const enrollment = course.students.find(s => s.studentId.toString() === req.user.id);
        if (approvedOnly && enrollment?.status !== 'approved') return null;
        return {
            ...course.toObject(),
            enrollmentStatus: enrollment?.status || 'unknown'
        };
    }).filter(Boolean);
    
    res.json(coursesWithStatus);
});
```

---

# Phase 4: Frontend - Toast Notifications

## Task 4.1: Install React-Toastify

**Command:**
```bash
cd frontend
npm install react-toastify
```

## Task 4.2: Setup Toast Container

**File:** `frontend/src/App.tsx`

**Add:**
```typescript
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// In return:
<ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
/>
```

## Task 4.3: Create Toast Utility

**File:** `frontend/src/utils/toast.ts` (NEW)

```typescript
import { toast } from 'react-toastify';

export const showSuccess = (message: string) => {
    toast.success(message);
};

export const showError = (message: string) => {
    toast.error(message);
};

export const showInfo = (message: string) => {
    toast.info(message);
};

export const showWarning = (message: string) => {
    toast.warn(message);
};
```

---

# Phase 5: Frontend - Dashboard Quick Actions

## Task 5.1: Create Admin Quick Actions Component

**File:** `frontend/src/components/dashboard/AdminQuickActions.tsx` (NEW)

**Features:**
- Manage Users → Navigate to `/admin/users`
- Approve Enrollments → Navigate to `/admin/approvals`
- System Settings → Navigate to `/admin/settings`
- Loading states
- Toast notifications

## Task 5.2: Create Instructor Quick Actions Component

**File:** `frontend/src/components/dashboard/InstructorQuickActions.tsx` (NEW)

**Features:**
- Create Course → Navigate to `/instructor/create-course`
- View Students → Navigate to `/instructor/students`
- Course Analytics → Navigate to `/instructor/analytics`
- Loading states
- Toast notifications

## Task 5.3: Create Student Quick Actions Component

**File:** `frontend/src/components/dashboard/StudentQuickActions.tsx` (NEW)

**Features:**
- Browse Courses → Navigate to `/student/browse`
- My Certificates → Navigate to `/student/certificates`
- Study Resources → Navigate to `/student/resources`
- Loading states
- Toast notifications

## Task 5.4: Update Dashboard with Role-Based Quick Actions

**File:** `frontend/src/pages/Dashboard.tsx`

**Changes:**
```typescript
import AdminQuickActions from '../components/dashboard/AdminQuickActions';
import InstructorQuickActions from '../components/dashboard/InstructorQuickActions';
import StudentQuickActions from '../components/dashboard/StudentQuickActions';

// In render:
{isAdmin && <AdminQuickActions />}
{isInstructor && <InstructorQuickActions />}
{isStudent && <StudentQuickActions />}
```

---

# Phase 6: Frontend - Admin Pages

## Task 6.1: Create Admin Users Management Page

**File:** `frontend/src/pages/admin/ManageUsers.tsx` (NEW)

**Features:**
- List all users with pagination
- Filter by role
- Delete user (with confirmation)
- Change user role
- Search by name/email

## Task 6.2: Create Admin Approvals Page

**File:** `frontend/src/pages/admin/Approvals.tsx` (NEW)

**Features:**
- List all pending enrollments
- Approve/Reject with one click
- Filter by course
- Bulk actions

## Task 6.3: Create Admin Settings Page

**File:** `frontend/src/pages/admin/Settings.tsx` (NEW)

**Features:**
- Manage categories
- Platform settings
- System health

---

# Phase 7: Frontend - Instructor Pages

## Task 7.1: Create Course Creation Page

**File:** `frontend/src/pages/instructor/CreateCourse.tsx` (NEW)

**Features:**
- Form with all course fields
- YouTube URL input with validation
- Category selection (dropdown)
- Real-time preview
- Submit with loading state
- Success/Error toasts

## Task 7.2: Create Students Management Page

**File:** `frontend/src/pages/instructor/Students.tsx` (NEW)

**Features:**
- List all students across courses
- Filter by course
- View student progress
- Approve/Reject enrollments

## Task 7.3: Create Instructor Analytics Page

**File:** `frontend/src/pages/instructor/Analytics.tsx` (NEW)

**Features:**
- Course-wise statistics
- Student engagement metrics
- Revenue tracking (if applicable)
- Charts and graphs

---

# Phase 8: Frontend - Student Pages

## Task 8.1: Update Browse Courses Page

**File:** `frontend/src/pages/student/BrowseCourses.tsx`

**Features:**
- Show only approved courses
- Filter by category
- Search functionality
- Enroll button with loading state
- Toast on successful enrollment

## Task 8.2: Create My Certificates Page

**File:** `frontend/src/pages/student/Certificates.tsx` (NEW)

**Features:**
- List all earned certificates
- Download certificate
- Share certificate
- Verify certificate

## Task 8.3: Create Study Resources Page

**File:** `frontend/src/pages/student/Resources.tsx` (NEW)

**Features:**
- List all resources from enrolled courses
- Filter by course
- Download materials

---

# Phase 9: Frontend - Routing Updates

## Task 9.1: Update App.tsx with All Routes

**File:** `frontend/src/App.tsx`

**Add Routes:**
```typescript
// Admin Routes
<Route path="/admin/users" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><ManageUsers /></ProtectedRoute>} />
<Route path="/admin/approvals" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><Approvals /></ProtectedRoute>} />
<Route path="/admin/settings" element={<ProtectedRoute allowedRoles={[UserRole.ADMIN]}><Settings /></ProtectedRoute>} />

// Instructor Routes
<Route path="/instructor/create-course" element={<ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}><CreateCourse /></ProtectedRoute>} />
<Route path="/instructor/students" element={<ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}><Students /></ProtectedRoute>} />
<Route path="/instructor/analytics" element={<ProtectedRoute allowedRoles={[UserRole.INSTRUCTOR, UserRole.ADMIN]}><Analytics /></ProtectedRoute>} />

// Student Routes
<Route path="/student/browse" element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]}><BrowseCourses /></ProtectedRoute>} />
<Route path="/student/certificates" element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]}><Certificates /></ProtectedRoute>} />
<Route path="/student/resources" element={<ProtectedRoute allowedRoles={[UserRole.STUDENT]}><Resources /></ProtectedRoute>} />
```

---

# Phase 10: Backend - Seed Categories

## Task 10.1: Create Category Seed Script

**File:** `backend/src/utils/seedCategories.ts` (NEW)

**Categories:**
- Web Development 💻
- Mobile Development 📱
- Data Science 📊
- Machine Learning 🤖
- DevOps ⚙️
- Cybersecurity 🔒
- UI/UX Design 🎨
- Business 💼
- Marketing 📈
- Languages 🌍

---

# Phase 11: Testing & Validation

## Task 11.1: Test RBAC

**Tests:**
- ✅ Student cannot access admin routes
- ✅ Student cannot see admin quick actions
- ✅ Instructor cannot access admin-only endpoints
- ✅ Admin can access all routes

## Task 11.2: Test Auth Persistence

**Tests:**
- ✅ Login → Refresh page → Still logged in
- ✅ Logout → Refresh page → Still logged out
- ✅ Token expiry → Auto logout

## Task 11.3: Test Quick Actions

**Tests:**
- ✅ All buttons navigate correctly
- ✅ Loading states work
- ✅ Toasts appear on success/error
- ✅ API calls succeed

## Task 11.4: Test YouTube Integration

**Tests:**
- ✅ Valid YouTube URL → Extracts ID
- ✅ Invalid URL → Shows error
- ✅ Video ID saved correctly

## Task 11.5: Test Category System

**Tests:**
- ✅ Admin can create categories
- ✅ Instructor can select category
- ✅ Courses filtered by category

---

# Success Criteria

## Functional Requirements
- ✅ Students NEVER see admin/instructor actions
- ✅ All Quick Actions buttons work
- ✅ Auth persists after page refresh
- ✅ YouTube URLs validated and parsed
- ✅ Categories system functional
- ✅ Toast notifications on all actions
- ✅ Loading states prevent double-clicks

## Non-Functional Requirements
- ✅ Clean, professional UI
- ✅ Fast response times
- ✅ No console errors
- ✅ Mobile responsive
- ✅ Accessible (ARIA labels)

---

# Implementation Order

1. ✅ Phase 1: Auth Persistence & RBAC (CRITICAL)
2. ✅ Phase 4: Toast Notifications (FOUNDATION)
3. ✅ Phase 2: Category System (BACKEND)
4. ✅ Phase 3: Admin/Instructor Endpoints (BACKEND)
5. ✅ Phase 5: Dashboard Quick Actions (FRONTEND)
6. ✅ Phase 6-8: Role-Specific Pages (FRONTEND)
7. ✅ Phase 9: Routing Updates (FRONTEND)
8. ✅ Phase 10: Seed Data (BACKEND)
9. ✅ Phase 11: Testing (VALIDATION)

---

# Files to Create/Modify

## Backend (NEW)
- `backend/src/models/Category.ts`
- `backend/src/routes/categories.ts`
- `backend/src/routes/admin.ts`
- `backend/src/routes/instructor.ts`
- `backend/src/utils/youtubeParser.ts`
- `backend/src/utils/seedCategories.ts`

## Backend (MODIFY)
- `backend/src/models/Course.ts`
- `backend/src/routes/courses.ts`
- `backend/src/index.ts`

## Frontend (NEW)
- `frontend/src/components/ProtectedRoute.tsx`
- `frontend/src/components/dashboard/AdminQuickActions.tsx`
- `frontend/src/components/dashboard/InstructorQuickActions.tsx`
- `frontend/src/components/dashboard/StudentQuickActions.tsx`
- `frontend/src/utils/toast.ts`
- `frontend/src/pages/admin/ManageUsers.tsx`
- `frontend/src/pages/admin/Approvals.tsx`
- `frontend/src/pages/admin/Settings.tsx`
- `frontend/src/pages/instructor/CreateCourse.tsx`
- `frontend/src/pages/instructor/Students.tsx`
- `frontend/src/pages/instructor/Analytics.tsx`
- `frontend/src/pages/student/Certificates.tsx`
- `frontend/src/pages/student/Resources.tsx`

## Frontend (MODIFY)
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/App.tsx`
- `frontend/src/pages/Dashboard.tsx`
- `frontend/src/pages/student/BrowseCourses.tsx`

---

**Total Files:** 13 new backend, 13 new frontend, 5 modified backend, 4 modified frontend
**Estimated Time:** 4-6 hours
**Priority:** CRITICAL - Fixes core functionality

