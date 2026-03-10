# SESA Academy - Testing Guide

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

### 2. Start Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on: http://localhost:5173

---

## 🧪 Test Credentials

### Student Account
- Email: `student@sesa.com`
- Password: `student123_Secure!`
- Portal: http://localhost:5173/login/student

### Instructor Account
- Email: `instructor@sesa.com`
- Password: `instructor123_Secure!`
- Portal: http://localhost:5173/login/instructor

### Admin Account
- Email: `admin@sesa.com`
- Password: `admin123_Secure!`
- Portal: http://localhost:5173/login/admin

---

## ✅ Testing Checklist

### Authentication & Authorization Tests

#### Test 1: Auth Persistence
1. Login as student
2. Refresh the page (F5)
3. ✅ Should still be logged in
4. ✅ Dashboard should show student actions only

#### Test 2: RBAC - Student Cannot Access Admin Routes
1. Login as student
2. Try to navigate to `/admin/users`
3. ✅ Should redirect to `/dashboard`
4. ✅ Dashboard should NOT show admin actions

#### Test 3: RBAC - Instructor Cannot Access Admin Routes
1. Login as instructor
2. Try to navigate to `/admin/users`
3. ✅ Should redirect to `/dashboard`
4. ✅ Dashboard should show instructor actions only

#### Test 4: RBAC - Admin Can Access All Routes
1. Login as admin
2. Navigate to `/admin/users`
3. ✅ Should load successfully
4. Navigate to `/instructor/students`
5. ✅ Should load successfully (admin has instructor permissions)

---

### Student Flow Tests

#### Test 5: Browse Courses
1. Login as student
2. Click "Browse Courses" from dashboard
3. ✅ Should see list of approved courses
4. ✅ Should see category filter chips
5. ✅ Should see search bar

#### Test 6: Filter Courses by Category
1. On Browse Courses page
2. Click a category chip (e.g., "Web Development")
3. ✅ Should filter courses to show only that category
4. Click "All" chip
5. ✅ Should show all courses again

#### Test 7: Search Courses
1. On Browse Courses page
2. Type "React" in search bar
3. ✅ Should filter courses containing "React"
4. Clear search
5. ✅ Should show all courses again

#### Test 8: Enroll in Course
1. On Browse Courses page
2. Click "Enroll Now" on a course
3. ✅ Should see loading state on button
4. ✅ Should see success toast notification
5. ✅ Button should change to "Enrollment Pending"

#### Test 9: View Certificates Page
1. From dashboard, click "My Certificates"
2. ✅ Should see empty state with message
3. ✅ Should have "Browse Courses" button

#### Test 10: View Resources Page
1. From dashboard, click "Study Resources"
2. ✅ Should see empty state with message
3. ✅ Should have "Browse Courses" button

---

### Instructor Flow Tests

#### Test 11: Create Course
1. Login as instructor
2. Click "Create Course" from dashboard
3. Fill in form:
   - Title: "Test Course"
   - Description: "Test description"
   - YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Category: Select any
   - Level: Beginner
   - Duration: "2 weeks"
   - Tags: "test, demo"
4. Click "Create Course"
5. ✅ Should see loading state
6. ✅ Should see success toast
7. ✅ Should redirect to dashboard

#### Test 12: View Students
1. From dashboard, click "View Students"
2. ✅ Should see list of enrolled students
3. ✅ Should see stats (Total, Approved, Pending, Rejected)
4. ✅ Should see filter options

#### Test 13: Approve Student Enrollment
1. On View Students page
2. Find a student with "Pending" status
3. Click the green checkmark (Approve)
4. ✅ Should see success toast
5. ✅ Student status should change to "Approved"

#### Test 14: Reject Student Enrollment
1. On View Students page
2. Find a student with "Pending" status
3. Click the red X (Reject)
4. ✅ Should see success toast
5. ✅ Student status should change to "Rejected"

#### Test 15: Filter Students by Course
1. On View Students page
2. Select a course from dropdown
3. ✅ Should show only students from that course

#### Test 16: Search Students
1. On View Students page
2. Type student name in search bar
3. ✅ Should filter students by name/email

#### Test 17: View Analytics
1. From dashboard, click "Course Analytics"
2. ✅ Should see statistics cards
3. ✅ Should see engagement metrics
4. ✅ Should see recent activity

---

### Admin Flow Tests

#### Test 18: Manage Users
1. Login as admin
2. Click "Manage Users" from dashboard
3. ✅ Should see list of all users
4. ✅ Should see pagination controls
5. ✅ Should see search and filter options

#### Test 19: Search Users
1. On Manage Users page
2. Type "student" in search bar
3. ✅ Should filter users by name/email

#### Test 20: Filter Users by Role
1. On Manage Users page
2. Select "Students" from role filter
3. ✅ Should show only students
4. Select "Instructors"
5. ✅ Should show only instructors

#### Test 21: Delete User
1. On Manage Users page
2. Click delete button (trash icon) on a user
3. ✅ Should see confirmation dialog
4. Click "OK"
5. ✅ Should see success toast
6. ✅ User should be removed from list

#### Test 22: Approve Enrollments
1. From dashboard, click "Approve Enrollments"
2. ✅ Should see list of all enrollments
3. ✅ Should see stats (Total, Pending, Approved, Rejected)
4. ✅ Default filter should be "Pending Only"

#### Test 23: Approve Enrollment (Admin)
1. On Approve Enrollments page
2. Find a pending enrollment
3. Click green checkmark
4. ✅ Should see success toast
5. ✅ Status should change to "Approved"

#### Test 24: Filter Enrollments by Status
1. On Approve Enrollments page
2. Select "All Status" from filter
3. ✅ Should show all enrollments
4. Select "Approved"
5. ✅ Should show only approved enrollments

#### Test 25: System Settings - View Categories
1. From dashboard, click "System Settings"
2. ✅ Should see list of all categories
3. ✅ Each category should show icon, name, description, status

#### Test 26: Create New Category
1. On System Settings page
2. Click "Add Category" button
3. Fill in form:
   - Name: "Test Category"
   - Icon: "🧪"
   - Description: "Test description"
4. Click "Create"
5. ✅ Should see success toast
6. ✅ New category should appear in list

#### Test 27: Delete Category
1. On System Settings page
2. Click delete button (trash icon) on a category
3. ✅ Should see confirmation dialog
4. Click "OK"
5. ✅ Should see success toast
6. ✅ Category should be removed from list

---

### Dashboard Tests

#### Test 28: Student Dashboard Stats
1. Login as student
2. View dashboard
3. ✅ Should see 4 stat cards:
   - Enrolled Courses
   - Approved
   - Pending Approval
   - Certificates
4. ✅ Should see "My Courses" section
5. ✅ Should see 3 Quick Actions (Browse, Certificates, Resources)

#### Test 29: Instructor Dashboard Stats
1. Login as instructor
2. View dashboard
3. ✅ Should see 4 stat cards:
   - My Courses
   - Total Students
   - Pending Enrollments
   - Avg. Rating
4. ✅ Should see "My Courses" section
5. ✅ Should see 3 Quick Actions (Create, Students, Analytics)

#### Test 30: Admin Dashboard Stats
1. Login as admin
2. View dashboard
3. ✅ Should see 4 stat cards:
   - Total Users
   - Total Courses
   - Pending Approvals
   - Active Sessions
4. ✅ Should see "Recent Activity" section
5. ✅ Should see 3 Quick Actions (Users, Approvals, Settings)

---

### Navigation Tests

#### Test 31: Quick Actions Navigation - Student
1. Login as student
2. Click "Browse Courses" → ✅ Should navigate to `/student/browse`
3. Go back to dashboard
4. Click "My Certificates" → ✅ Should navigate to `/student/certificates`
5. Go back to dashboard
6. Click "Study Resources" → ✅ Should navigate to `/student/resources`

#### Test 32: Quick Actions Navigation - Instructor
1. Login as instructor
2. Click "Create Course" → ✅ Should navigate to `/instructor/create-course`
3. Go back to dashboard
4. Click "View Students" → ✅ Should navigate to `/instructor/students`
5. Go back to dashboard
6. Click "Course Analytics" → ✅ Should navigate to `/instructor/analytics`

#### Test 33: Quick Actions Navigation - Admin
1. Login as admin
2. Click "Manage Users" → ✅ Should navigate to `/admin/users`
3. Go back to dashboard
4. Click "Approve Enrollments" → ✅ Should navigate to `/admin/approvals`
5. Go back to dashboard
6. Click "System Settings" → ✅ Should navigate to `/admin/settings`

#### Test 34: Back to Dashboard Navigation
1. Navigate to any role-specific page
2. Click "Back to Dashboard" button
3. ✅ Should navigate back to `/dashboard`

---

### Toast Notification Tests

#### Test 35: Success Toast
1. Perform any successful action (e.g., enroll in course)
2. ✅ Should see green success toast
3. ✅ Toast should auto-close after 3 seconds

#### Test 36: Error Toast
1. Try to create course with invalid YouTube URL
2. ✅ Should see red error toast
3. ✅ Toast should show error message

#### Test 37: Loading Toast
1. Click "Enroll Now" on a course
2. ✅ Should see loading toast while processing
3. ✅ Should update to success/error toast when complete

---

### YouTube Integration Tests

#### Test 38: Valid YouTube URL
1. Login as instructor
2. Go to Create Course
3. Enter valid YouTube URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
4. Submit form
5. ✅ Should create course successfully
6. ✅ Course should have thumbnail

#### Test 39: Invalid YouTube URL
1. Login as instructor
2. Go to Create Course
3. Enter invalid URL: `https://example.com/video`
4. Submit form
5. ✅ Should see error toast
6. ✅ Course should NOT be created

#### Test 40: YouTube Thumbnail Display
1. Login as student
2. Go to Browse Courses
3. ✅ Each course should show YouTube thumbnail
4. ✅ Thumbnails should load correctly

---

### Category System Tests

#### Test 41: Category Filter
1. Login as student
2. Go to Browse Courses
3. ✅ Should see category chips at top
4. ✅ Should see "All" chip selected by default
5. Click different category
6. ✅ Should filter courses

#### Test 42: Category Icons
1. On Browse Courses page
2. ✅ Each category chip should show icon (emoji)
3. ✅ Icons should be visible and correct

#### Test 43: Course Category Display
1. On Browse Courses page
2. ✅ Each course card should show category name
3. ✅ Category should have icon

---

### Loading States Tests

#### Test 44: Button Loading State
1. Click any action button (e.g., "Enroll Now")
2. ✅ Button should show "Loading..." or spinner
3. ✅ Button should be disabled during loading
4. ✅ Button should return to normal after completion

#### Test 45: Page Loading State
1. Navigate to any page with data fetching
2. ✅ Should see "Loading..." message
3. ✅ Should show data after loading completes

---

### Responsive Design Tests

#### Test 46: Mobile View - Dashboard
1. Resize browser to mobile width (< 768px)
2. ✅ Stats should stack vertically
3. ✅ Quick Actions should be full width
4. ✅ All content should be readable

#### Test 47: Mobile View - Browse Courses
1. Resize browser to mobile width
2. ✅ Course cards should stack vertically
3. ✅ Category chips should wrap
4. ✅ Search bar should be full width

#### Test 48: Tablet View
1. Resize browser to tablet width (768px - 1024px)
2. ✅ Layout should adapt appropriately
3. ✅ All features should be accessible

---

## 🐛 Known Issues / Future Enhancements

### Placeholder Features (Not Yet Implemented)
- Certificate generation (shows empty state)
- Study resources (shows empty state)
- Progress tracking
- File uploads for course materials
- Email notifications
- Payment integration
- Reviews and ratings system

### Future Improvements
- Bulk actions for admin
- Advanced search filters
- Course preview before enrollment
- Student progress dashboard
- Instructor revenue tracking
- Real-time notifications
- Chat/messaging system

---

## 📊 Test Results Summary

After completing all tests, you should have:
- ✅ All authentication flows working
- ✅ All RBAC rules enforced
- ✅ All navigation working correctly
- ✅ All CRUD operations functional
- ✅ All toast notifications appearing
- ✅ All loading states working
- ✅ YouTube integration working
- ✅ Category system working
- ✅ Responsive design working

---

## 🎯 Priority Testing Order

1. **Critical** (Must Work):
   - Authentication & Authorization (Tests 1-4)
   - Student Browse & Enroll (Tests 5-8)
   - Instructor Create Course (Test 11)
   - Admin Manage Users (Tests 18-21)

2. **High Priority**:
   - All Quick Actions Navigation (Tests 31-34)
   - Approve/Reject Enrollments (Tests 13-14, 23)
   - Category Management (Tests 26-27)

3. **Medium Priority**:
   - Dashboard Stats (Tests 28-30)
   - Filter & Search (Tests 6-7, 15-16, 19-20)
   - Toast Notifications (Tests 35-37)

4. **Low Priority**:
   - Responsive Design (Tests 46-48)
   - Empty States (Tests 9-10)

---

**Last Updated:** 2026-03-04
**Total Tests:** 48
**Status:** All Core Features Ready for Testing
