import express from 'express';
import { authenticate, checkRole } from '../middleware/auth.js';
import { UserRole } from '../models/User.js';
import {
    createQuiz,
    getCourseQuizzes,
    createAssignment,
    submitAssessment
} from '../controllers/assessmentController.js';

const router = express.Router();

// Instructor/Admin routes
router.post('/course/:courseId/quiz', 
    authenticate, 
    checkRole([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]), 
    createQuiz
);

router.post('/course/:courseId/assignment', 
    authenticate, 
    checkRole([UserRole.INSTRUCTOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]), 
    createAssignment
);

// Public/Student routes
router.get('/course/:courseId/quizzes', authenticate, getCourseQuizzes);
router.post('/submit', authenticate, submitAssessment);

export default router;
