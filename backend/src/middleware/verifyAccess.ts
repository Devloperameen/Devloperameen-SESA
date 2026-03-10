import type { Response, NextFunction } from 'express';
import type { AuthRequest } from './auth.js';
import mongoose from 'mongoose';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import { UserRole } from '../models/User.js';

/**
 * Middleware to verify if a user has approved access to a course's restricted content.
 * Admins and the Course Instructor are always granted access.
 */
export const verifyAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { courseId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // 1. Check if user is Admin or Super Admin
        if (req.user?.role === UserRole.ADMIN || req.user?.role === UserRole.SUPER_ADMIN) {
            return next();
        }

        // 2. Fetch course to check for Instructor access
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.instructor.toString() === userId) {
            return next();
        }

        // 3. Check for approved Enrollment
        const enrollment = await Enrollment.findOne({
            user: new mongoose.Types.ObjectId(userId),
            course: new mongoose.Types.ObjectId(courseId as string),
            status: 'approved'
        });

        if (!enrollment) {
            return res.status(403).json({
                message: 'Access denied. You must have an approved enrollment to view this content.',
                accessStatus: 'restricted'
            });
        }

        next();
    } catch (error) {
        console.error('VerifyAccess Middleware Error:', error);
        res.status(500).json({ message: 'Internal server error while verifying access' });
    }
};
