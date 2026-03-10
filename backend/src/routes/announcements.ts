import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import Announcement from '../models/Announcement.js';
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

router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const userRole = req.user!.role;
        const scope = req.query.scope;
        const canViewAll = userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN || userRole === UserRole.MODERATOR;

        const query: Record<string, unknown> = {};
        if (!(canViewAll && scope === 'all')) {
            query.isActive = true;
        }

        if (userRole === UserRole.STUDENT || userRole === UserRole.PREMIUM_STUDENT) {
            query.targetRole = { $in: ['student', 'both'] };
        } else if (userRole === UserRole.INSTRUCTOR || userRole === UserRole.ASSISTANT_INSTRUCTOR) {
            query.targetRole = { $in: ['instructor', 'both'] };
        }

        const announcements = await Announcement.find(query)
            .populate('createdBy', 'name role')
            .sort({ createdAt: -1 })
            .limit(30);

        res.json(announcements);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post(
    '/',
    authenticate,
    checkRole([UserRole.ADMIN, UserRole.MODERATOR]),
    [
        body('message', 'Message is required').trim().isLength({ min: 1, max: 500 }),
        body('targetRole', 'targetRole must be student, instructor, or both').isIn(['student', 'instructor', 'both']),
        body('isActive').optional().isBoolean(),
    ],
    validate,
    async (req: AuthRequest, res: Response) => {
        try {
            const { message, targetRole, isActive } = req.body;

            const announcement = await Announcement.create({
                message,
                targetRole,
                isActive: typeof isActive === 'boolean' ? isActive : true,
                createdBy: req.user!.id,
            });

            await announcement.populate('createdBy', 'name role');
            res.status(201).json(announcement);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

router.put(
    '/:id/toggle',
    authenticate,
    checkRole([UserRole.ADMIN, UserRole.MODERATOR]),
    [body('isActive', 'isActive must be boolean').isBoolean()],
    validate,
    async (req: AuthRequest, res: Response) => {
        try {
            const announcement = await Announcement.findById(req.params.id);
            if (!announcement) {
                return res.status(404).json({ message: 'Announcement not found' });
            }

            announcement.isActive = req.body.isActive;
            await announcement.save();

            res.json({ message: 'Announcement updated', announcement });
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Server error' });
        }
    }
);

export default router;
