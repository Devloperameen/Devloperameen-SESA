import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { sendMessage, getConversation } from '../controllers/messageController.js';

const router = express.Router();

router.post('/send', authenticate, sendMessage);
router.get('/conversation/:otherUserId', authenticate, getConversation);

export default router;
