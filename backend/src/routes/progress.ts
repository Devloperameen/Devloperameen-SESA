import express from 'express';
import type { Response } from 'express';
import Progress from '../models/Progress.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @route   POST api/progress/update
// @desc    Update watch counts and minutes for a course
// @access  Private
router.post('/update', authenticate, async (req: any, res: Response) => {
    try {
        const { courseId, minutesWatched } = req.body;
        const userId = req.user.id;

        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        let progress = await Progress.findOne({ user: userId, course: courseId });

        if (!progress) {
            progress = new Progress({
                user: userId,
                course: courseId,
                watchCount: 1,
                totalMinutesWatched: minutesWatched || 0,
                lastWatchedAt: new Date()
            });
        } else {
            progress.watchCount += 1;
            progress.totalMinutesWatched += minutesWatched || 0;
            progress.lastWatchedAt = new Date();
        }

        await progress.save();
        res.json(progress);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET api/progress/:courseId
// @desc    Get progress for a specific course
// @access  Private
router.get('/:courseId', authenticate, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { courseId } = req.params;

        const progress = await Progress.findOne({ user: userId, course: courseId });
        if (!progress) {
            return res.json({ watchCount: 0, totalMinutesWatched: 0 });
        }

        res.json(progress);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET api/progress
// @desc    Get all progress records for current user
// @access  Private
router.get('/', authenticate, async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const progressRecords = await Progress.find({ user: userId }).populate('course', 'title');
        res.json(progressRecords);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
