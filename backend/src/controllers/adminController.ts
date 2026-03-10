import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import User, { UserRole } from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import bcrypt from 'bcryptjs';

// Get all users with filtering
export const getAllUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { role, isActive, search } = req.query;
        
        const filter: any = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(filter)
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user by ID
export const getUserById = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId)
            .select('-password')
            .populate('enrolledCourses', 'title thumbnailUrl')
            .populate('completedCourses', 'title thumbnailUrl');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get additional stats
        const enrollments = await Enrollment.countDocuments({ user: userId, status: 'approved' });
        const payments = await Payment.find({ user: userId, status: 'completed' });
        const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

        res.json({
            ...user.toObject(),
            stats: {
                totalEnrollments: enrollments,
                totalSpent,
                totalPayments: payments.length
            }
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Create new user (admin)
export const createUser = async (req: AuthRequest, res: Response) => {
    try {
        const { name, email, password, role, permissions } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || UserRole.STUDENT,
            permissions: permissions || [],
            isActive: true
        });

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.status(201).json({
            message: 'User created successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user role and permissions
export const updateUserRole = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const { role, permissions, isActive } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent modifying super admin by non-super admin
        if (user.role === UserRole.SUPER_ADMIN && req.user!.role !== UserRole.SUPER_ADMIN) {
            return res.status(403).json({ message: 'Cannot modify super admin' });
        }

        if (role) user.role = role;
        if (permissions) user.permissions = permissions;
        if (isActive !== undefined) user.isActive = isActive;

        await user.save();

        const userResponse = user.toObject();
        delete userResponse.password;

        res.json({
            message: 'User updated successfully',
            user: userResponse
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting super admin
        if (user.role === UserRole.SUPER_ADMIN) {
            return res.status(403).json({ message: 'Cannot delete super admin' });
        }

        await User.findByIdAndDelete(userId);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Bulk approve enrollments
export const bulkApproveEnrollments = async (req: AuthRequest, res: Response) => {
    try {
        const { enrollmentIds } = req.body;

        if (!Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
            return res.status(400).json({ message: 'Invalid enrollment IDs' });
        }

        const result = await Enrollment.updateMany(
            { _id: { $in: enrollmentIds }, status: 'pending' },
            { status: 'approved', updatedAt: new Date() }
        );

        res.json({
            message: 'Enrollments approved successfully',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Bulk approve enrollments error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get pending approvals across all courses
export const getAllPendingApprovals = async (req: AuthRequest, res: Response) => {
    try {
        const pendingEnrollments = await Enrollment.find({ status: 'pending' })
            .populate('user', 'name email')
            .populate('course', 'title instructor')
            .populate({
                path: 'course',
                populate: { path: 'instructor', select: 'name' }
            })
            .sort({ requestedAt: -1 });

        res.json(pendingEnrollments);
    } catch (error) {
        console.error('Get all pending approvals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Manage course status (approve/reject)
export const manageCourseStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const { status, isPublished } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (status) course.status = status;
        if (isPublished !== undefined) course.isPublished = isPublished;

        await course.save();

        res.json({
            message: 'Course status updated successfully',
            course
        });
    } catch (error) {
        console.error('Manage course status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get system statistics
export const getSystemStats = async (req: AuthRequest, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalCourses = await Course.countDocuments();
        const publishedCourses = await Course.countDocuments({ isPublished: true });
        const totalEnrollments = await Enrollment.countDocuments({ status: 'approved' });
        const pendingEnrollments = await Enrollment.countDocuments({ status: 'pending' });

        const totalRevenue = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        res.json({
            users: {
                total: totalUsers,
                active: activeUsers,
                byRole: usersByRole
            },
            courses: {
                total: totalCourses,
                published: publishedCourses
            },
            enrollments: {
                total: totalEnrollments,
                pending: pendingEnrollments
            },
            revenue: {
                total: totalRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        console.error('Get system stats error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
