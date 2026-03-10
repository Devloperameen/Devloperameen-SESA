import express from 'express';
import {
    generateCertificate,
    getUserCertificates,
    getCertificateByNumber,
    getAllCertificates,
    revokeCertificate
} from '../controllers/certificateController.js';
import { authenticate, checkRole } from '../middleware/auth.js';
import { UserRole } from '../models/User.js';

const router = express.Router();

// Student routes
router.post('/generate/:courseId', authenticate, generateCertificate);
router.get('/my-certificates', authenticate, getUserCertificates);

// Public route
router.get('/verify/:certificateNumber', getCertificateByNumber);

// Admin routes
router.get('/all', authenticate, checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR]), getAllCertificates);
router.delete('/:certificateId', authenticate, checkRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), revokeCertificate);

export default router;
