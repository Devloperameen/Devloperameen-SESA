# SESA Academy - Test Login Credentials

## Backend Status
✅ Backend is running on: http://localhost:5000
✅ API Base URL: http://localhost:5000/api

## Test User Credentials

### 🛡️ Admin Account
- **Email**: `admin@sesa.com`
- **Password**: `admin123_Secure!`
- **Role**: Admin
- **Access**: Full platform control, user management, approvals, reports

### 👨‍🏫 Instructor Account
- **Email**: `instructor@sesa.com`
- **Password**: `instructor123_Secure!`
- **Role**: Instructor
- **Access**: Create courses, manage students, view analytics

### 🎓 Student Account
- **Email**: `student@sesa.com`
- **Password**: `student123_Secure!`
- **Role**: Student
- **Access**: Enroll in courses, view lessons, earn certificates

---

## How to Login

1. **Start Frontend** (if not running):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Access the Application**:
   - Open: http://localhost:5173
   - Click on the appropriate portal (Student/Instructor/Admin)

3. **Login**:
   - Use the credentials above
   - Each portal validates that you're using the correct role

---

## API Endpoints Available

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get current user profile
- `GET /api/users/stats` - Get user statistics (role-specific)
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get user by ID (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

### Courses
- `GET /api/courses` - Get all courses (public)
- `POST /api/courses` - Create course (instructor/admin)
- `GET /api/courses/my/created` - Get instructor's courses
- `GET /api/courses/my/enrolled` - Get student's enrolled courses
- `GET /api/courses/:id` - Get single course (authenticated)
- `PUT /api/courses/:id` - Update course (instructor/admin)
- `DELETE /api/courses/:id` - Delete course (instructor/admin)
- `POST /api/courses/:id/enroll` - Enroll in course (student)
- `PATCH /api/courses/:id/approve/:studentId` - Approve enrollment (instructor/admin)
- `PATCH /api/courses/:id/reject/:studentId` - Reject enrollment (instructor/admin)
- `GET /api/courses/:id/students` - Get enrolled students (instructor/admin)

---

## Testing the API

### Example: Login as Student
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@sesa.com",
    "password": "student123_Secure!"
  }'
```

### Example: Get All Courses
```bash
curl http://localhost:5000/api/courses
```

### Example: Create Course (as Instructor)
```bash
# First login to get token
TOKEN="your_jwt_token_here"

curl -X POST http://localhost:5000/api/courses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Introduction to React",
    "description": "Learn React from scratch",
    "resourceUrl": "https://example.com/react-course"
  }'
```

---

## Environment Variables

Make sure your `.env` files are configured:

### Backend (.env)
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/sesa
JWT_SECRET=your_secure_secret_key
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

---

## Troubleshooting

### Backend not connecting to MongoDB?
- Make sure MongoDB is running
- Check MONGO_URI in backend/.env

### Frontend can't reach backend?
- Check VITE_API_URL in frontend/.env
- Make sure backend is running on port 5000
- Check CORS settings

### Login not working?
- Make sure you're using the correct portal for your role
- Check browser console for errors
- Verify credentials are correct

---

## Next Steps

1. ✅ Backend is running with test users
2. ✅ You can now login with any of the three roles
3. 📝 Check the spec file: `.kiro/specs/backend-completion.md` for planned enhancements
4. 🚀 Start implementing additional features from the spec

---

**Note**: These are test credentials for development only. Never use these in production!
