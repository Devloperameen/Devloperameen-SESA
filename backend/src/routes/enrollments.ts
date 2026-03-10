import express from 'express';
import {
    requestAccess,
    getPendingRequests,
    updateEnrollmentStatus
} from '../controllers/enrollmentController.js';
import { authenticate, checkRole } from '../middleware/auth.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

// User route (Mounted at /api/enrollments)
router.post('/request/:courseId', authenticate, requestAccess);

// Admin routes (Mounted at /api/admin/enrollments)
router.get('/pending', authenticate, checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]), getPendingRequests);
router.put('/:enrollmentId', authenticate, checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]), updateEnrollmentStatus);

export default router;
