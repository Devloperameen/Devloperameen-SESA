import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import Message from '../models/Message.js';

/**
 * @desc    Send a message
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { recipientId, text, courseId } = req.body;
        const message = new Message({
            sender: req.user!.id,
            recipient: recipientId,
            text,
            courseId
        });
        await message.save();
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Get conversation between current user and another user
 */
export const getConversation = async (req: AuthRequest, res: Response) => {
    try {
        const { otherUserId } = req.params;
        const messages = await Message.find({
            $or: [
                { sender: req.user!.id, recipient: otherUserId },
                { sender: otherUserId, recipient: req.user!.id }
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
