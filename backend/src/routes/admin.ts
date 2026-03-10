import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { body, validationResult } from 'express-validator';
import Course from '../models/Course.js';
import { authenticate, checkRole, type AuthRequest } from '../middleware/auth.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const hasPendingEnrollment = (course: any, studentId: string): boolean => {
    const inPendingApprovals = course.pendingApprovals.some((id: mongoose.Types.ObjectId) => id.toString() === studentId);
    if (inPendingApprovals) return true;

    return course.students.some((entry: any) => entry.studentId.toString() === studentId && entry.status === 'pending');
};

router.put(
    '/approve-enrollment',
    authenticate,
    checkRole([UserRole.ADMIN, UserRole.MODERATOR]),
    [
        body('courseId', 'Valid courseId is required').isMongoId(),
        body('studentId', 'Valid studentId is required').isMongoId(),
    ],
    validate,
    async (req: AuthRequest, res: Response) => {
        try {
            const { courseId, studentId } = req.body;

            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            if (!hasPendingEnrollment(course, studentId)) {
                return res.status(400).json({ message: 'Student is not pending approval for this course' });
            }

            course.pendingApprovals = course.pendingApprovals.filter(
                (id: mongoose.Types.ObjectId) => id.toString() !== studentId
            );

            const alreadyEnrolled = course.enrolledStudents.some(
                (id: mongoose.Types.ObjectId) => id.toString() === studentId
            );
            if (!alreadyEnrolled) {
                course.enrolledStudents.push(new mongoose.Types.ObjectId(studentId));
            }

            const existing = course.students.find((entry) => entry.studentId.toString() === studentId);
            if (existing) {
                existing.status = 'approved';
                existing.approvedAt = new Date();
            } else {
                course.students.push({
                    studentId: new mongoose.Types.ObjectId(studentId),
                    status: 'approved',
                    enrolledAt: new Date(),
                    approvedAt: new Date(),
                });
            }

            await course.save();

            res.json({
                message: 'Enrollment approved successfully',
                courseId,
                studentId,
            });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

export default router;
