import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import Certificate from '../models/Certificate.js';
import Progress from '../models/Progress.js';
import Course from '../models/Course.js';
import { UserRole } from '../models/User.js';

// Generate certificate for completed course
export const generateCertificate = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = req.user!.id;

        // Check if course is completed
        const progress = await Progress.findOne({ user: userId, course: courseId });
        if (!progress || !progress.completed) {
            return res.status(400).json({ message: 'Course must be completed to generate certificate' });
        }

        // Check if certificate already exists
        const existingCert = await Certificate.findOne({ user: userId, course: courseId });
        if (existingCert) {
            return res.status(400).json({ message: 'Certificate already generated', certificate: existingCert });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Generate unique certificate number
        const certNumber = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const certificate = new Certificate({
            user: userId,
            course: courseId,
            certificateNumber: certNumber,
            issuedDate: new Date(),
            certificateUrl: `/certificates/${certNumber}.pdf` // In real app, generate actual PDF
        });

        await certificate.save();
        await certificate.populate('course', 'title instructor');
        await certificate.populate('user', 'name email');

        res.status(201).json({
            message: 'Certificate generated successfully',
            certificate
        });
    } catch (error) {
        console.error('Generate certificate error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user certificates
export const getUserCertificates = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;

        const certificates = await Certificate.find({ user: userId })
            .populate('course', 'title instructor thumbnailUrl')
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' }
            })
            .sort({ issuedDate: -1 });

        res.json(certificates);
    } catch (error) {
        console.error('Get user certificates error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get certificate by number (public)
export const getCertificateByNumber = async (req: AuthRequest, res: Response) => {
    try {
        const { certificateNumber } = req.params;

        const certificate = await Certificate.findOne({ certificateNumber })
            .populate('user', 'name')
            .populate('course', 'title instructor')
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' }
            });

        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        res.json(certificate);
    } catch (error) {
        console.error('Get certificate by number error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all certificates (admin)
export const getAllCertificates = async (req: AuthRequest, res: Response) => {
    try {
        const certificates = await Certificate.find()
            .populate('user', 'name email')
            .populate('course', 'title')
            .sort({ issuedDate: -1 });

        res.json(certificates);
    } catch (error) {
        console.error('Get all certificates error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Revoke certificate (admin)
export const revokeCertificate = async (req: AuthRequest, res: Response) => {
    try {
        const { certificateId } = req.params;

        const certificate = await Certificate.findByIdAndDelete(certificateId);
        if (!certificate) {
            return res.status(404).json({ message: 'Certificate not found' });
        }

        res.json({ message: 'Certificate revoked successfully' });
    } catch (error) {
        console.error('Revoke certificate error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
