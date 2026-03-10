import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import { UserRole } from '../models/User.js';

/**
 * Middleware to control video access:
 * - Part 1 (preview) is always accessible
 * - Other parts require payment/enrollment approval
 */
export const checkVideoAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { courseId } = req.params;
        const { videoIndex } = req.query;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Admin and instructor always have access
        if (
            req.user?.role === UserRole.ADMIN ||
            req.user?.role === UserRole.SUPER_ADMIN ||
            course.instructor.toString() === userId
        ) {
            return next();
        }

        // Part 1 (index 0) is always free
        if (videoIndex === '0' || videoIndex === undefined) {
            return next();
        }

        // Check if user has paid or has approved enrollment
        const hasPayment = await Payment.findOne({
            user: userId,
            course: courseId,
            status: 'completed'
        });

        const hasEnrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
            status: 'approved'
        });

        if (!hasPayment && !hasEnrollment) {
            return res.status(403).json({
                message: 'Payment or enrollment approval required to access this content',
                requiresPayment: true,
                coursePrice: course.price
            });
        }

        next();
    } catch (error) {
        console.error('Video access check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * Check if user can access full course content
 */
export const checkFullCourseAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Admin and instructor always have access
        if (
            req.user?.role === UserRole.ADMIN ||
            req.user?.role === UserRole.SUPER_ADMIN ||
            course.instructor.toString() === userId
        ) {
            return next();
        }

        // Check payment or enrollment
        const hasPayment = await Payment.findOne({
            user: userId,
            course: courseId,
            status: 'completed'
        });

        const hasEnrollment = await Enrollment.findOne({
            user: userId,
            course: courseId,
            status: 'approved'
        });

        if (!hasPayment && !hasEnrollment) {
            return res.status(403).json({
                message: 'Payment or enrollment approval required',
                requiresPayment: true,
                coursePrice: course.price,
                previewOnly: true
            });
        }

        next();
    } catch (error) {
        console.error('Full course access check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
