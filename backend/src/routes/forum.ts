import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { createThread, getCourseThreads, addPost } from '../controllers/forumController.js';

const router = express.Router();

router.post('/thread', authenticate, createThread);
router.get('/course/:courseId', authenticate, getCourseThreads);
router.post('/thread/:threadId/post', authenticate, addPost);

export default router;
