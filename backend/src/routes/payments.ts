import express from 'express';
import {
    createPayment,
    confirmPayment,
    getUserPayments,
    getAllPayments,
    refundPayment
} from '../controllers/paymentController.js';
import { authenticate, checkRole } from '../middleware/auth.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

// Student routes
router.post('/create', authenticate, createPayment);
router.post('/:paymentId/confirm', authenticate, confirmPayment);
router.get('/my-payments', authenticate, getUserPayments);

// Admin routes
router.get('/all', authenticate, checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_MANAGER]), getAllPayments);
router.post('/:paymentId/refund', authenticate, checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.FINANCE_MANAGER]), refundPayment);

export default router;
