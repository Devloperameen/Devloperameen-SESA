/**
 * Course Management System Test Script
 * 
 * This script tests the enhanced course management system with:
 * 1. Teacher course creation (auto pending)
 * 2. Admin review workflow
 * 3. Free preview system
 * 4. Enrollment verification
 * 5. Role-based access control
 */

const axios = require('axios');
const mongoose = require('mongoose');

// Configuration
const API_BASE = 'http://localhost:5000/api';
const MONGO_URI = 'mongodb://localhost:27017/sesa';

// Test data
const testUsers = {
    admin: { email: 'admin@test.com', password: 'admin123', role: 'admin' },
    teacher: { email: 'teacher@test.com', password: 'teacher123', role: 'instructor' },
    student: { email: 'student@test.com', password: 'student123', role: 'student' }
};

let tokens = {};
let testCourseId = null;
let testEnrollmentId = null;

// Helper functions
async function loginUser(userData) {
    try {
        const response = await axios.post(`${API_BASE}/auth/login`, {
            email: userData.email,
            password: userData.password
        });
        return response.data.token;
    } catch (error) {
        console.error(`Login failed for ${userData.email}:`, error.response?.data || error.message);
        return null;
    }
}

async function createTestCourse(teacherToken) {
    try {
        const response = await axios.post(`${API_BASE}/courses`, {
            title: 'Test Course - Advanced Mathematics',
            description: 'A comprehensive mathematics course covering advanced topics',
            resourceUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            previewVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            lessons: [
                { title: 'Part 1: Introduction to Calculus', videoUrl: 'https://www.youtube.com/watch?v=video1', order: 0 },
                { title: 'Part 2: Differential Equations', videoUrl: 'https://www.youtube.com/watch?v=video2', order: 1 },
                { title: 'Part 3: Integral Calculus', videoUrl: 'https://www.youtube.com/watch?v=video3', order: 2 }
            ],
            price: 49.99,
            level: 'advanced',
            duration: '8 weeks',
            tags: ['mathematics', 'calculus', 'advanced']
        }, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });

        console.log('✅ Course created successfully');
        console.log('   Status:', response.data.status);
        console.log('   Message:', response.data.message);
        return response.data._id;
    } catch (error) {
        console.error('Course creation failed:', error.response?.data || error.message);
        return null;
    }
}

async function testAdminReviewWorkflow(adminToken, courseId) {
    console.log('\n🔍 Testing Admin Review Workflow');
    
    // 1. Get pending courses
    try {
        const response = await axios.get(`${API_BASE}/course-management/admin/courses/pending-review`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Pending courses retrieved:', response.data.length);
    } catch (error) {
        console.error('Failed to get pending courses:', error.response?.data || error.message);
    }

    // 2. Preview course
    try {
        const response = await axios.get(`${API_BASE}/course-management/admin/courses/${courseId}/preview`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Course preview successful');
        console.log('   Instructor:', response.data.course.instructor.name);
    } catch (error) {
        console.error('Failed to preview course:', error.response?.data || error.message);
    }

    // 3. Accept course
    try {
        const response = await axios.put(`${API_BASE}/course-management/admin/courses/${courseId}/review`, {
            decision: 'accept',
            adminComment: 'Course looks great! Approved for publishing.'
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Course accepted successfully');
        console.log('   New status:', response.data.course.status);
        console.log('   Published:', response.data.course.isPublished);
    } catch (error) {
        console.error('Failed to accept course:', error.response?.data || error.message);
    }
}

async function testFreePreviewSystem(courseId) {
    console.log('\n🎬 Testing Free Preview System');
    
    // 1. Get free preview (no auth required)
    try {
        const response = await axios.get(`${API_BASE}/course-management/courses/${courseId}/free-preview`);
        console.log('✅ Free preview accessible without authentication');
        console.log('   Course title:', response.data.course.title);
        console.log('   Preview lesson:', response.data.freePreview.lesson?.title || 'None');
    } catch (error) {
        console.error('Failed to get free preview:', error.response?.data || error.message);
    }

    // 2. Get specific lessons with access control
    console.log('\nTesting lesson access:');
    
    // Lesson 0 (Part 1) - should be accessible
    try {
        const response = await axios.get(`${API_BASE}/course-management/courses/${courseId}/lesson/0`, {
            headers: { Authorization: `Bearer ${tokens.student}` }
        });
        console.log('✅ Lesson 0 (Part 1) accessible to student');
        console.log('   Access level:', response.data.accessInfo.accessLevel);
    } catch (error) {
        console.error('Failed to access lesson 0:', error.response?.data || error.message);
    }

    // Lesson 1 - should be restricted (not enrolled)
    try {
        await axios.get(`${API_BASE}/course-management/courses/${courseId}/lesson/1`, {
            headers: { Authorization: `Bearer ${tokens.student}` }
        });
        console.log('❌ Lesson 1 should be restricted but was accessible');
    } catch (error) {
        if (error.response?.status === 403) {
            console.log('✅ Lesson 1 correctly restricted (enrollment required)');
        } else {
            console.error('Unexpected error for lesson 1:', error.response?.data || error.message);
        }
    }
}

async function testEnrollmentVerification(adminToken, studentToken, courseId) {
    console.log('\n📝 Testing Enrollment & Verification');
    
    // 1. Student requests enrollment
    let enrollmentId = null;
    try {
        const response = await axios.post(`${API_BASE}/enrollments/request/${courseId}`, {
            paymentProofUrl: 'https://example.com/payment-proof.pdf',
            watchedPart1: true
        }, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.log('✅ Enrollment request submitted');
        enrollmentId = response.data.enrollment._id;
    } catch (error) {
        console.error('Failed to request enrollment:', error.response?.data || error.message);
        return;
    }

    // 2. Admin views pending verifications
    try {
        const response = await axios.get(`${API_BASE}/course-management/admin/enrollments/verification`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Pending verifications retrieved:', response.data.length);
    } catch (error) {
        console.error('Failed to get pending verifications:', error.response?.data || error.message);
    }

    // 3. Admin verifies enrollment (simplified - in real app would check payment first)
    if (enrollmentId) {
        try {
            const response = await axios.put(`${API_BASE}/course-management/admin/enrollments/${enrollmentId}/verify`, {
                adminComment: 'Payment verified via bank transfer'
            }, {
                headers: { Authorization: `Bearer ${adminToken}` }
            });
            console.log('✅ Enrollment verified successfully');
            console.log('   Status:', response.data.enrollment.status);
        } catch (error) {
            console.error('Failed to verify enrollment:', error.response?.data || error.message);
        }
    }

    // 4. Student tries to access full content
    try {
        const response = await axios.get(`${API_BASE}/course-management/courses/${courseId}/full-content`, {
            headers: { Authorization: `Bearer ${studentToken}` }
        });
        console.log('✅ Full content accessible after verification');
        console.log('   Access level:', response.data.accessLevel);
    } catch (error) {
        console.error('Failed to access full content:', error.response?.data || error.message);
    }
}

async function testTeacherDashboard(teacherToken) {
    console.log('\n👨‍🏫 Testing Teacher Dashboard');
    
    // 1. Get pending courses
    try {
        const response = await axios.get(`${API_BASE}/course-management/teacher/courses/my-pending`, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        console.log('✅ Teacher pending courses:', response.data.length);
    } catch (error) {
        console.error('Failed to get teacher pending courses:', error.response?.data || error.message);
    }

    // 2. Get published courses
    try {
        const response = await axios.get(`${API_BASE}/course-management/teacher/courses/my-published`, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        console.log('✅ Teacher published courses:', response.data.length);
    } catch (error) {
        console.error('Failed to get teacher published courses:', error.response?.data || error.message);
    }

    // 3. Get teacher stats
    try {
        const response = await axios.get(`${API_BASE}/course-management/teacher/courses/my-stats`, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        console.log('✅ Teacher statistics retrieved');
        console.log('   Total courses:', response.data.stats.totalCourses);
        console.log('   Published:', response.data.stats.publishedCourses);
        console.log('   Approval rate:', response.data.stats.approvalRate + '%');
    } catch (error) {
        console.error('Failed to get teacher stats:', error.response?.data || error.message);
    }
}

async function testCourseManagement(adminToken, teacherToken, courseId) {
    console.log('\n⚙️ Testing Course Management Features');
    
    // 1. Lock course
    try {
        const response = await axios.patch(`${API_BASE}/course-management/courses/${courseId}/toggle-lock`, {
            locked: true
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Course locked successfully');
        console.log('   Status:', response.data.course.status);
    } catch (error) {
        console.error('Failed to lock course:', error.response?.data || error.message);
    }

    // 2. Unlock course
    try {
        const response = await axios.patch(`${API_BASE}/course-management/courses/${courseId}/toggle-lock`, {
            locked: false
        }, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('✅ Course unlocked successfully');
        console.log('   Status:', response.data.course.status);
    } catch (error) {
        console.error('Failed to unlock course:', error.response?.data || error.message);
    }

    // 3. Hide course
    try {
        const response = await axios.patch(`${API_BASE}/course-management/courses/${courseId}/toggle-visibility`, {
            visible: false
        }, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        console.log('✅ Course hidden successfully');
        console.log('   Hidden:', response.data.course.isHidden);
    } catch (error) {
        console.error('Failed to hide course:', error.response?.data || error.message);
    }

    // 4. Show course
    try {
        const response = await axios.patch(`${API_BASE}/course-management/courses/${courseId}/toggle-visibility`, {
            visible: true
        }, {
            headers: { Authorization: `Bearer ${teacherToken}` }
        });
        console.log('✅ Course made visible successfully');
        console.log('   Published:', response.data.course.isPublished);
    } catch (error) {
        console.error('Failed to show course:', error.response?.data || error.message);
    }
}

async function runAllTests() {
    console.log('🚀 Starting Course Management System Tests\n');
    
    // Connect to database
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        return;
    }

    // Login all users
    console.log('\n🔐 Logging in users...');
    for (const [role, userData] of Object.entries(testUsers)) {
        tokens[role] = await loginUser(userData);
        if (tokens[role]) {
            console.log(`✅ ${role} logged in`);
        } else {
            console.log(`❌ ${role} login failed`);
        }
    }

    // Run tests if we have all tokens
    if (tokens.teacher && tokens.admin && tokens.student) {
        // 1. Teacher creates course
        console.log('\n📚 Test 1: Teacher Course Creation');
        testCourseId = await createTestCourse(tokens.teacher);
        
        if (testCourseId) {
            // 2. Admin review workflow
            await testAdminReviewWorkflow(tokens.admin, testCourseId);
            
            // 3. Free preview system
            await testFreePreviewSystem(testCourseId);
            
            // 4. Enrollment verification
            await testEnrollmentVerification(tokens.admin, tokens.student, testCourseId);
            
            // 5. Teacher dashboard
            await testTeacherDashboard(tokens.teacher);
            
            // 6. Course management
            await testCourseManagement(tokens.admin, tokens.teacher, testCourseId);
            
            console.log('\n🎉 All tests completed!');
        } else {
            console.log('\n❌ Test failed: Could not create test course');
        }
    } else {
        console.log('\n❌ Test failed: Could not login all users');
        console.log('   Make sure test users exist in the database');
    }

    // Cleanup
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
}

// Run tests
runAllTests().catch(console.error);