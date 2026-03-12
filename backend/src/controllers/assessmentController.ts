import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import Quiz from '../models/Quiz.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Course from '../models/Course.js';

// ─── QUIZ CONTROLLERS ────────────────────────────────────────────────────────

/**
 * @desc    Create a new quiz for a course
 */
export const createQuiz = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const { title, description, questions, timeLimit, passingScore, attemptsAllowed } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Only instructor or admin can add quiz
        if (course.instructor.toString() !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const quiz = new Quiz({
            course: courseId,
            title,
            description,
            questions,
            timeLimit,
            passingScore,
            attemptsAllowed
        });

        await quiz.save();

        // Add reference to course
        course.quizzes.push(quiz._id as any);
        await course.save();

        res.status(201).json(quiz);
    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Get all quizzes for a course
 */
export const getCourseQuizzes = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const quizzes = await Quiz.find({ course: courseId });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── ASSIGNMENT CONTROLLERS ──────────────────────────────────────────────────

/**
 * @desc    Create a new assignment
 */
export const createAssignment = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const { title, description, resourceUrls, deadline, maxScore, instructions } = req.body;

        const course = await Course.findById(courseId);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.instructor.toString() !== req.user!.id && req.user!.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const assignment = new Assignment({
            course: courseId,
            title,
            description,
            resourceUrls,
            deadline,
            maxScore,
            instructions
        });

        await assignment.save();

        course.assignments.push(assignment._id as any);
        await course.save();

        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// ─── SUBMISSION CONTROLLERS ──────────────────────────────────────────────────

/**
 * @desc    Submit a quiz or assignment
 */
export const submitAssessment = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId, assessmentType, assessmentId } = req.body;
        const { answers, fileUrl, textResponse } = req.body;

        const submission = new Submission({
            user: req.user!.id,
            course: courseId,
            assessmentType,
            quizId: assessmentType === 'quiz' ? assessmentId : undefined,
            assignmentId: assessmentType === 'assignment' ? assessmentId : undefined,
            answers,
            fileUrl,
            textResponse,
            status: assessmentType === 'quiz' ? 'graded' : 'pending' // Quizzes auto-graded later
        });

        if (assessmentType === 'quiz') {
            const quiz = await Quiz.findById(assessmentId);
            if (quiz) {
                let correctCount = 0;
                answers.forEach((ans: any, idx: number) => {
                    if (ans === quiz.questions[idx].correctAnswer) correctCount++;
                });
                submission.score = (correctCount / quiz.questions[idx].options.length) * 100; // Need proper scoring logic
                // Simple score for now
                submission.score = Math.round((correctCount / quiz.questions.length) * 100);
            }
        }

        await submission.save();
        res.status(201).json(submission);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
