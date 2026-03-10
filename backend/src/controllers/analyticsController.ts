import type { Response } from 'express';
import type { AuthRequest } from '../middleware/auth.js';
import Analytics from '../models/Analytics.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Payment from '../models/Payment.js';
import Progress from '../models/Progress.js';
import User, { UserRole } from '../models/User.js';

// Get dashboard analytics
export const getDashboardAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user!.id;
        const userRole = req.user!.role;

        let analytics: any = {};

        if (userRole === UserRole.INSTRUCTOR || userRole === UserRole.ASSISTANT_INSTRUCTOR) {
            // Instructor analytics
            const courses = await Course.find({ instructor: userId });
            const courseIds = courses.map(c => c._id);

            const totalEnrollments = await Enrollment.countDocuments({
                course: { $in: courseIds },
                status: 'approved'
            });

            const totalRevenue = await Payment.aggregate([
                { $match: { course: { $in: courseIds }, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const activeStudents = await Progress.distinct('user', {
                course: { $in: courseIds },
                lastWatchedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
            });

            analytics = {
                totalCourses: courses.length,
                totalEnrollments,
                totalRevenue: totalRevenue[0]?.total || 0,
                activeStudents: activeStudents.length,
                courses: courses.map(c => ({
                    id: c._id,
                    title: c.title,
                    enrollments: c.enrolledStudents.length,
                    pending: c.pendingApprovals.length
                }))
            };
        } else if (userRole === UserRole.STUDENT || userRole === UserRole.PREMIUM_STUDENT) {
            // Student analytics
            const enrollments = await Enrollment.find({ user: userId, status: 'approved' });
            const courseIds = enrollments.map(e => e.course);

            const progress = await Progress.find({ user: userId, course: { $in: courseIds } });
            const completedCourses = progress.filter(p => p.completed).length;
            const totalMinutes = progress.reduce((sum, p) => sum + p.totalMinutesWatched, 0);

            analytics = {
                enrolledCourses: enrollments.length,
                completedCourses,
                inProgressCourses: enrollments.length - completedCourses,
                totalMinutesWatched: totalMinutes,
                totalHoursWatched: Math.round(totalMinutes / 60)
            };
        } else if ([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR].includes(userRole as UserRole)) {
            // Admin analytics
            const totalUsers = await User.countDocuments();
            const totalCourses = await Course.countDocuments();
            const totalEnrollments = await Enrollment.countDocuments({ status: 'approved' });
            const pendingEnrollments = await Enrollment.countDocuments({ status: 'pending' });

            const totalRevenue = await Payment.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]);

            const revenueByMonth = await Payment.aggregate([
                { $match: { status: 'completed' } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$paymentDate' },
                            month: { $month: '$paymentDate' }
                        },
                        revenue: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': -1, '_id.month': -1 } },
                { $limit: 12 }
            ]);

            const usersByRole = await User.aggregate([
                { $group: { _id: '$role', count: { $sum: 1 } } }
            ]);

            analytics = {
                totalUsers,
                totalCourses,
                totalEnrollments,
                pendingEnrollments,
                totalRevenue: totalRevenue[0]?.total || 0,
                revenueByMonth,
                usersByRole
            };
        }

        res.json(analytics);
    } catch (error) {
        console.error('Get dashboard analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get course analytics (instructor/admin)
export const getCourseAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = req.user!.id;
        const userRole = req.user!.role;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check authorization
        const isInstructor = course.instructor.toString() === userId;
        const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR].includes(userRole as UserRole);

        if (!isInstructor && !isAdmin) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const enrollments = await Enrollment.countDocuments({ course: courseId, status: 'approved' });
        const pendingEnrollments = await Enrollment.countDocuments({ course: courseId, status: 'pending' });

        const progress = await Progress.find({ course: courseId });
        const completedCount = progress.filter(p => p.completed).length;
        const averageProgress = progress.length > 0
            ? progress.reduce((sum, p) => sum + (p.completed ? 100 : (p.watchCount * 10)), 0) / progress.length
            : 0;

        const revenue = await Payment.aggregate([
            { $match: { course: course._id, status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const activeStudents = await Progress.countDocuments({
            course: courseId,
            lastWatchedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        });

        const analytics = {
            courseId,
            courseTitle: course.title,
            totalEnrollments: enrollments,
            pendingEnrollments,
            completedStudents: completedCount,
            completionRate: enrollments > 0 ? (completedCount / enrollments) * 100 : 0,
            averageProgress: Math.round(averageProgress),
            totalRevenue: revenue[0]?.total || 0,
            activeStudents,
            commentsCount: course.comments.length
        };

        res.json(analytics);
    } catch (error) {
        console.error('Get course analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get system-wide analytics (super admin only)
export const getSystemAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeUsers = await User.countDocuments({ isActive: true });
        const totalCourses = await Course.countDocuments();
        const publishedCourses = await Course.countDocuments({ isPublished: true });

        const enrollmentStats = await Enrollment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const paymentStats = await Payment.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$amount' } } }
        ]);

        const topCourses = await Enrollment.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: '$course', enrollments: { $sum: 1 } } },
            { $sort: { enrollments: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'courses',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'courseInfo'
                }
            },
            { $unwind: '$courseInfo' },
            {
                $project: {
                    title: '$courseInfo.title',
                    enrollments: 1,
                    price: '$courseInfo.price'
                }
            }
        ]);

        const topInstructors = await Course.aggregate([
            {
                $lookup: {
                    from: 'enrollments',
                    localField: '_id',
                    foreignField: 'course',
                    as: 'enrollments'
                }
            },
            {
                $group: {
                    _id: '$instructor',
                    totalEnrollments: { $sum: { $size: '$enrollments' } },
                    totalCourses: { $sum: 1 }
                }
            },
            { $sort: { totalEnrollments: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'instructorInfo'
                }
            },
            { $unwind: '$instructorInfo' },
            {
                $project: {
                    name: '$instructorInfo.name',
                    email: '$instructorInfo.email',
                    totalEnrollments: 1,
                    totalCourses: 1
                }
            }
        ]);

        res.json({
            users: {
                total: totalUsers,
                active: activeUsers
            },
            courses: {
                total: totalCourses,
                published: publishedCourses
            },
            enrollments: enrollmentStats,
            payments: paymentStats,
            topCourses,
            topInstructors
        });
    } catch (error) {
        console.error('Get system analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
