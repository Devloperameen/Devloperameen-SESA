import express from 'express';
import type { Response } from 'express';
import Notification from '../models/Notification.js';
import { authenticate, type AuthRequest } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get current user's notifications (paginated)
// @access  Private
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
        const skip = (page - 1) * limit;
        const unreadOnly = req.query.unread === 'true';

        const filter: Record<string, any> = { userId: req.user!.id };
        if (unreadOnly) filter.isRead = false;

        const [notifications, total, unreadCount] = await Promise.all([
            Notification.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Notification.countDocuments(filter),
            Notification.countDocuments({ userId: req.user!.id, isRead: false }),
        ]);

        res.json({
            notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread count only (lightweight poll endpoint)
// @access  Private
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.user!.id,
            isRead: false,
        });
        res.json({ unreadCount: count });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a single notification as read
// @access  Private
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, userId: req.user!.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json(notification);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PATCH /api/notifications/read-all
// @desc    Mark all notifications as read for current user
// @access  Private
router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const result = await Notification.updateMany(
            { userId: req.user!.id, isRead: false },
            { isRead: true }
        );

        res.json({
            message: 'All notifications marked as read',
            modifiedCount: result.modifiedCount,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user!.id,
        });

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/notifications
// @desc    Clear all read notifications for current user
// @access  Private
router.delete('/', authenticate, async (req: AuthRequest, res: Response) => {
    try {
        const result = await Notification.deleteMany({
            userId: req.user!.id,
            isRead: true,
        });

        res.json({
            message: 'Cleared read notifications',
            deletedCount: result.deletedCount,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
