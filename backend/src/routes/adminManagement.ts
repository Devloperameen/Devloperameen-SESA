import express from 'express';
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUserRole,
    deleteUser,
    bulkApproveEnrollments,
    getAllPendingApprovals,
    manageCourseStatus,
    getSystemStats
} from '../controllers/adminController.js';
import { authenticate, checkRole } from '../middleware/auth.js';
import { UserRole } from '../models/User.js';
import { body, validationResult } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';

const router = express.Router();

const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// User management routes
router.get('/users', authenticate, checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR, UserRole.SUPPORT_STAFF]), getAllUsers);
router.get('/users/:userId', authenticate, checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR, UserRole.SUPPORT_STAFF]), getUserById);

router.post('/users', 
    authenticate, 
    checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]),
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('role').optional().isIn(Object.values(UserRole)).withMessage('Invalid role')
    ],
    validate,
    createUser
);

router.put('/users/:userId/role', authenticate, checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), updateUserRole);
router.delete('/users/:userId', authenticate, checkRole([UserRole.SUPER_ADMIN]), deleteUser);

// Enrollment management
router.get('/enrollments/pending', authenticate, checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]), getAllPendingApprovals);
router.post('/enrollments/bulk-approve', authenticate, checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]), bulkApproveEnrollments);

// Course management
router.put('/courses/:courseId/status', authenticate, checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.CONTENT_MANAGER]), manageCourseStatus);

// System statistics
router.get('/stats', authenticate, checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ANALYST]), getSystemStats);

export default router;
