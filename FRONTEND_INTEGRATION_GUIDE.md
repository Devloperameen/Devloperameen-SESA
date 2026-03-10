# Frontend Integration Guide

## Quick Start for Frontend Developers

This guide helps you integrate the enhanced backend features into your frontend application.

---

## 🔑 Authentication

### Login
```typescript
const login = async (email: string, password: string) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};
```

### Register
```typescript
const register = async (name: string, email: string, password: string) => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role: 'student' })
  });
  
  return await response.json();
};
```

---

## 🎭 Role-Based Routing

### Check User Role
```typescript
const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.role;
};

// Route based on role
const getDashboardRoute = (role: string) => {
  const routes = {
    'super_admin': '/admin/dashboard',
    'admin': '/admin/dashboard',
    'moderator': '/moderator/dashboard',
    'content_manager': '/content/dashboard',
    'support_staff': '/support/dashboard',
    'instructor': '/instructor/dashboard',
    'assistant_instructor': '/instructor/dashboard',
    'guest_instructor': '/instructor/dashboard',
    'student': '/student/dashboard',
    'premium_student': '/student/dashboard',
    'trial_student': '/student/dashboard',
    'reviewer': '/reviewer/dashboard',
    'analyst': '/analyst/dashboard',
    'finance_manager': '/finance/dashboard'
  };
  
  return routes[role] || '/dashboard';
};
```

### Protected Route Component
```typescript
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }
  
  return children;
};

// Usage
<Route path="/admin/*" element={
  <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

---

## 📊 Dashboard Integration

### Fetch Dashboard Data
```typescript
const getDashboard = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return await response.json();
};

// Usage in component
useEffect(() => {
  getDashboard().then(data => {
    setDashboardData(data);
  });
}, []);
```

### Dashboard Component Example
```typescript
const Dashboard = () => {
  const [data, setData] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    getDashboard().then(setData);
  }, []);
  
  if (!data) return <Loading />;
  
  return (
    <div>
      <h1>Welcome, {user.name}</h1>
      <h2>Role: {user.role}</h2>
      
      {/* Stats */}
      <div className="stats">
        {Object.entries(data.stats || {}).map(([key, value]) => (
          <StatCard key={key} label={key} value={value} />
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="quick-actions">
        {data.quickActions?.map(action => (
          <Button key={action.route} onClick={() => navigate(action.route)}>
            {action.label}
          </Button>
        ))}
      </div>
      
      {/* Role-specific content */}
      {data.myCourses && <CourseList courses={data.myCourses} />}
      {data.enrolledCourses && <EnrolledCourses courses={data.enrolledCourses} />}
    </div>
  );
};
```

---

## 🎥 Video Access Control

### Check Video Access
```typescript
const checkVideoAccess = async (courseId: string, videoIndex: number) => {
  // Part 1 (index 0) is always free
  if (videoIndex === 0) {
    return { hasAccess: true, requiresPayment: false };
  }
  
  const token = localStorage.getItem('token');
  
  try {
    const response = await fetch(
      `http://localhost:5000/api/courses/${courseId}/content`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    
    if (response.ok) {
      return { hasAccess: true, requiresPayment: false };
    }
    
    const error = await response.json();
    return {
      hasAccess: false,
      requiresPayment: error.requiresPayment,
      coursePrice: error.coursePrice
    };
  } catch (error) {
    return { hasAccess: false, requiresPayment: true };
  }
};
```

### Video Player Component
```typescript
const VideoPlayer = ({ course, videoIndex }) => {
  const [access, setAccess] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  
  useEffect(() => {
    checkVideoAccess(course._id, videoIndex).then(setAccess);
  }, [course._id, videoIndex]);
  
  if (!access) return <Loading />;
  
  if (!access.hasAccess) {
    return (
      <div className="access-denied">
        <h3>Premium Content</h3>
        <p>This content requires payment or enrollment approval.</p>
        <p>Price: ${course.price}</p>
        <Button onClick={() => setShowPayment(true)}>
          Purchase Course
        </Button>
        {showPayment && <PaymentModal course={course} />}
      </div>
    );
  }
  
  // Get video URL
  const videoUrl = videoIndex === 0 
    ? course.previewVideoUrl 
    : course.enrolledContentUrls[videoIndex - 1];
  
  return <YoutubeVideo url={videoUrl} />;
};
```

---

## 💳 Payment Integration

### Create Payment
```typescript
const createPayment = async (courseId: string, paymentMethod: string) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/payments/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      courseId,
      paymentMethod,
      amount: course.price
    })
  });
  
  return await response.json();
};
```

### Confirm Payment
```typescript
const confirmPayment = async (paymentId: string) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/payments/${paymentId}/confirm`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  return await response.json();
};
```

### Payment Modal Component
```typescript
const PaymentModal = ({ course, onClose }) => {
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [processing, setProcessing] = useState(false);
  
  const handlePayment = async () => {
    setProcessing(true);
    
    try {
      // 1. Create payment
      const payment = await createPayment(course._id, paymentMethod);
      
      // 2. Process with Stripe/PayPal (frontend integration)
      if (paymentMethod === 'stripe') {
        // Stripe payment processing
        const result = await processStripePayment(payment.clientSecret);
        if (result.success) {
          // 3. Confirm payment
          await confirmPayment(payment.payment._id);
          toast.success('Payment successful! You now have access to the course.');
          onClose();
          // Refresh course data
        }
      }
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <Modal>
      <h2>Purchase Course</h2>
      <p>{course.title}</p>
      <p>Price: ${course.price}</p>
      
      <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
        <option value="stripe">Credit Card (Stripe)</option>
        <option value="paypal">PayPal</option>
        <option value="bank_transfer">Bank Transfer</option>
      </select>
      
      <Button onClick={handlePayment} disabled={processing}>
        {processing ? 'Processing...' : 'Pay Now'}
      </Button>
    </Modal>
  );
};
```

---

## 📜 Certificate Display

### Get User Certificates
```typescript
const getCertificates = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    'http://localhost:5000/api/certificates/my-certificates',
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  return await response.json();
};
```

### Generate Certificate
```typescript
const generateCertificate = async (courseId: string) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/certificates/generate/${courseId}`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  return await response.json();
};
```

### Certificate Component
```typescript
const CertificateCard = ({ certificate }) => {
  return (
    <div className="certificate-card">
      <h3>{certificate.course.title}</h3>
      <p>Certificate Number: {certificate.certificateNumber}</p>
      <p>Issued: {new Date(certificate.issuedDate).toLocaleDateString()}</p>
      <Button onClick={() => window.open(certificate.certificateUrl)}>
        Download Certificate
      </Button>
      <Button onClick={() => shareCertificate(certificate)}>
        Share
      </Button>
    </div>
  );
};
```

---

## 📈 Analytics Display

### Get Analytics
```typescript
const getAnalytics = async (type: 'dashboard' | 'course' | 'system', id?: string) => {
  const token = localStorage.getItem('token');
  
  let url = `http://localhost:5000/api/analytics/${type}`;
  if (id) url += `/${id}`;
  
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  return await response.json();
};
```

### Analytics Component
```typescript
const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  
  useEffect(() => {
    getAnalytics('dashboard').then(setAnalytics);
  }, []);
  
  if (!analytics) return <Loading />;
  
  return (
    <div>
      <h1>Analytics</h1>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        {Object.entries(analytics).map(([key, value]) => (
          <StatCard key={key} label={key} value={value} />
        ))}
      </div>
      
      {/* Charts */}
      {analytics.revenueByMonth && (
        <RevenueChart data={analytics.revenueByMonth} />
      )}
      
      {analytics.userGrowth && (
        <UserGrowthChart data={analytics.userGrowth} />
      )}
    </div>
  );
};
```

---

## 🎓 Course Management

### Get Courses
```typescript
const getCourses = async (filters?: {
  category?: string;
  level?: string;
  search?: string;
}) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(filters);
  
  const response = await fetch(
    `http://localhost:5000/api/courses?${params}`,
    {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }
  );
  
  return await response.json();
};
```

### Create Course (Instructor)
```typescript
const createCourse = async (courseData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/courses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(courseData)
  });
  
  return await response.json();
};
```

### Enroll in Course
```typescript
const enrollInCourse = async (courseId: string) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/courses/enroll/${courseId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ watchedPart1: true })
    }
  );
  
  return await response.json();
};
```

---

## 👥 Admin User Management

### Get All Users (Admin)
```typescript
const getUsers = async (filters?: {
  role?: string;
  isActive?: boolean;
  search?: string;
}) => {
  const token = localStorage.getItem('token');
  const params = new URLSearchParams(filters);
  
  const response = await fetch(
    `http://localhost:5000/api/admin/management/users?${params}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );
  
  return await response.json();
};
```

### Update User Role (Admin)
```typescript
const updateUserRole = async (userId: string, role: string, permissions: string[]) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    `http://localhost:5000/api/admin/management/users/${userId}/role`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ role, permissions })
    }
  );
  
  return await response.json();
};
```

---

## 🔔 Real-time Notifications (WebSocket)

### Setup Socket Connection
```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Listen for notifications
socket.on('notification', (data) => {
  toast.info(data.message);
});

socket.on('enrollment_approved', (data) => {
  toast.success(`Your enrollment in ${data.courseTitle} has been approved!`);
  // Refresh course data
});

socket.on('payment_confirmed', (data) => {
  toast.success('Payment confirmed! You now have access to the course.');
  // Refresh course access
});
```

---

## 🎨 UI Components Examples

### Role Badge
```typescript
const RoleBadge = ({ role }) => {
  const colors = {
    'super_admin': 'red',
    'admin': 'orange',
    'moderator': 'yellow',
    'instructor': 'blue',
    'student': 'green',
    // ... other roles
  };
  
  return (
    <span className={`badge badge-${colors[role]}`}>
      {role.replace('_', ' ').toUpperCase()}
    </span>
  );
};
```

### Access Status Indicator
```typescript
const AccessStatus = ({ hasAccess, requiresPayment, price }) => {
  if (hasAccess) {
    return <span className="badge badge-success">Full Access</span>;
  }
  
  if (requiresPayment) {
    return (
      <span className="badge badge-warning">
        Requires Payment (${price})
      </span>
    );
  }
  
  return <span className="badge badge-info">Pending Approval</span>;
};
```

---

## 🧪 Testing

### Test with Different Roles
```typescript
// Login as different roles
const testRoles = [
  { email: 'admin@sesa.com', password: 'password123' },
  { email: 'instructor@sesa.com', password: 'password123' },
  { email: 'student@sesa.com', password: 'password123' }
];

// Test each role's dashboard
testRoles.forEach(async (credentials) => {
  const data = await login(credentials.email, credentials.password);
  console.log(`${data.user.role} dashboard:`, await getDashboard());
});
```

---

## 📱 Responsive Design Tips

### Mobile-First Dashboard
```typescript
const ResponsiveDashboard = () => {
  return (
    <div className="dashboard">
      {/* Mobile: Stack vertically */}
      <div className="md:grid md:grid-cols-3 gap-4">
        <StatsCard />
        <StatsCard />
        <StatsCard />
      </div>
      
      {/* Tablet/Desktop: Side-by-side */}
      <div className="lg:flex gap-4">
        <div className="lg:w-2/3">
          <MainContent />
        </div>
        <div className="lg:w-1/3">
          <Sidebar />
        </div>
      </div>
    </div>
  );
};
```

---

## 🚀 Performance Tips

1. **Cache Dashboard Data**
```typescript
const useDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check cache first
    const cached = sessionStorage.getItem('dashboard');
    if (cached) {
      setData(JSON.parse(cached));
      setLoading(false);
      return;
    }
    
    // Fetch if not cached
    getDashboard().then(data => {
      setData(data);
      sessionStorage.setItem('dashboard', JSON.stringify(data));
      setLoading(false);
    });
  }, []);
  
  return { data, loading };
};
```

2. **Lazy Load Components**
```typescript
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const InstructorDashboard = lazy(() => import('./InstructorDashboard'));
const StudentDashboard = lazy(() => import('./StudentDashboard'));
```

3. **Debounce Search**
```typescript
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
};
```

---

## 📋 Checklist for Integration

- [ ] Update API base URL
- [ ] Implement authentication flow
- [ ] Add role-based routing
- [ ] Create dashboard components for each role
- [ ] Implement video access control
- [ ] Add payment modal/flow
- [ ] Create certificate display
- [ ] Add analytics charts
- [ ] Implement admin user management
- [ ] Setup WebSocket notifications
- [ ] Add error handling
- [ ] Implement loading states
- [ ] Add responsive design
- [ ] Test with all 14 roles
- [ ] Optimize performance

---

## 🆘 Common Issues

### CORS Errors
```typescript
// Backend .env
CORS_ORIGIN=http://localhost:5173

// Or use proxy in vite.config.ts
export default {
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
}
```

### Token Expiration
```typescript
// Add token refresh logic
const refreshToken = async () => {
  // Implement token refresh
};

// Intercept 401 responses
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await refreshToken();
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## 📞 Support

For integration help:
1. Check API_DOCUMENTATION.md
2. Review IMPLEMENTATION_GUIDE.md
3. Test with Postman/curl first
4. Contact backend team

---

**Happy Coding! 🚀**
