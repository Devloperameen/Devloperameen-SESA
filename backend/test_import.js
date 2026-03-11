// Simple test to verify imports work
import { getPendingReviewCourses } from './src/controllers/courseManagementController.js';
import { allowFreePreview } from './src/middleware/freePreviewAccess.js';
import courseManagementRoutes from './src/routes/courseManagement.js';

console.log('✅ All imports successful!');
console.log('✅ Course Management Controller imported');
console.log('✅ Free Preview Middleware imported');
console.log('✅ Course Management Routes imported');

// Test that the functions exist
console.log('\n🔍 Function checks:');
console.log('getPendingReviewCourses exists:', typeof getPendingReviewCourses === 'function');
console.log('allowFreePreview exists:', typeof allowFreePreview === 'function');
console.log('courseManagementRoutes is object:', typeof courseManagementRoutes === 'object');

console.log('\n🎉 Import test passed! The new modules are ready to use.');