import express from 'express';
import {
    getDashboardAnalytics,
    getCourseAnalytics,
    getSystemAnalytics
} from '../controllers/analyticsController.js';
import { authenticate, checkRole } from '../middleware/auth.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

// Dashboard analytics (all authenticated users)
router.get('/dashboard', authenticate, getDashboardAnalytics);

// Course analytics (instructor/admin)
router.get('/course/:courseId', authenticate, getCourseAnalytics);

// System-wide analytics (super admin only)
router.get('/system', authenticate, checkRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.ANALYST]), getSystemAnalytics);

export default router;
