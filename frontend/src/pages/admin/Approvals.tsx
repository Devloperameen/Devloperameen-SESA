import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError } from '../../utils/toast';
import axios from 'axios';
import { CheckCircle, XCircle, Filter, BookOpen, Users } from 'lucide-react';

interface StudentData {
    _id: string;
    name: string;
    email: string;
}

interface Enrollment {
    _id: string;
    studentId: StudentData;
    status: 'pending' | 'approved' | 'rejected';
    enrolledAt: string;
    courseId: string;
    courseTitle: string;
    paymentProofUrl?: string;
    adminComment?: string;
}

interface CourseApproval {
    _id: string;
    title: string;
    instructor: {
        _id: string;
        name: string;
    };
    category?: {
        name: string;
    };
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

type TabType = 'enrollments' | 'courses';

const Approvals: React.FC = () => {
    const { token } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('enrollments');
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [courses, setCourses] = useState<CourseApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('pending');

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const coursesRes = await axios.get(`${API_URL}/courses`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (activeTab === 'courses') {
                setCourses(coursesRes.data);
            } else {
                const allEnrollments: Enrollment[] = [];
                for (const course of coursesRes.data) {
                    try {
                        const studentsRes = await axios.get(
                            `${API_URL}/courses/${course._id}/students`,
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        
                        studentsRes.data.forEach((student: any) => {
                            allEnrollments.push({
                                ...student,
                                courseId: course._id,
                                courseTitle: course.title
                            });
                        });
                    } catch (err) {
                        console.error(`Error fetching students for course ${course._id}:`, err);
                    }
                }
                setEnrollments(allEnrollments);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            showError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleApproveEnrollment = async (courseId: string, enrollmentId: string) => {
        try {
            await axios.put(
                `${API_URL}/admin/enrollments/${enrollmentId}`,
                { status: 'approved' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Also need to push to course enrollments list for backward compatibility
            await axios.patch(
                `${API_URL}/courses/${courseId}/approve/${enrollmentId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            ).catch(() => {}); // Ignore errors here as we already approved it above
            
            showSuccess('Enrollment approved successfully');
            fetchData();
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to approve enrollment');
        }
    };

    const handleRejectEnrollment = async (enrollmentId: string) => {
        const comment = window.prompt("Enter a reason for rejection (optional):");
        if (comment === null) return; // User cancelled

        try {
            await axios.put(
                `${API_URL}/admin/enrollments/${enrollmentId}`,
                { status: 'rejected', adminComment: comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showSuccess('Enrollment rejected');
            fetchData();
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to reject enrollment');
        }
    };

    const handleCourseStatusUpdate = async (courseId: string, status: 'approved' | 'rejected') => {
        let comment = undefined;
        if (status === 'rejected') {
            const promptComment = window.prompt("Enter a reason for course rejection (optional):");
            if (promptComment === null) return; // User cancelled
            comment = promptComment;
        }

        try {
            await axios.patch(
                `${API_URL}/courses/${courseId}/status`,
                { status, adminComment: comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showSuccess(`Course ${status} successfully`);
            fetchData();
        } catch (err: any) {
            showError(err.response?.data?.message || `Failed to update course status`);
        }
    };

    const filteredItems = activeTab === 'enrollments' 
        ? enrollments.filter(e => statusFilter === 'all' || e.status === statusFilter)
        : courses.filter(c => statusFilter === 'all' || c.status === statusFilter);

    const stats = {
        total: activeTab === 'enrollments' ? enrollments.length : courses.length,
        pending: (activeTab === 'enrollments' ? enrollments : courses).filter(i => i.status === 'pending').length,
        approved: (activeTab === 'enrollments' ? enrollments : courses).filter(i => i.status === 'approved').length,
        rejected: (activeTab === 'enrollments' ? enrollments : courses).filter(i => i.status === 'rejected').length
    };

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-3xl font-bold tracking-tight text-white">Approvals</h1>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-slate-800/50 border border-slate-700 rounded-xl w-fit">
                    <button
                        onClick={() => setActiveTab('enrollments')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === 'enrollments' 
                            ? 'bg-cyan-600 text-white shadow-sm' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        Student Enrollments
                    </button>
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeTab === 'courses' 
                            ? 'bg-cyan-600 text-white shadow-sm' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        Course Submissions
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Requests', value: stats.total, color: 'text-white' },
                    { label: 'Pending', value: stats.pending, color: 'text-amber-400' },
                    { label: 'Approved', value: stats.approved, color: 'text-emerald-400' },
                    { label: 'Rejected', value: stats.rejected, color: 'text-rose-400' },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
                        <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-sm text-slate-400 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex items-center gap-3 bg-slate-800/40 border border-slate-700 rounded-xl p-4 w-fit">
                <Filter className="w-5 h-5 text-slate-400" />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-transparent text-slate-300 text-sm font-medium focus:outline-none focus:ring-0 cursor-pointer"
                >
                    <option value="pending" className="bg-slate-800">Pending Only</option>
                    <option value="all" className="bg-slate-800">All Status</option>
                    <option value="approved" className="bg-slate-800">Approved</option>
                    <option value="rejected" className="bg-slate-800">Rejected</option>
                </select>
            </div>

            {/* Table Area */}
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="text-center py-12 text-slate-400">Loading records...</div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 border border-slate-700 border-dashed m-4 rounded-xl relative">
                        {statusFilter === 'pending' ? 'No pending requests currently.' : 'No records found.'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        {activeTab === 'enrollments' ? 'Student' : 'Course Details'}
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        {activeTab === 'enrollments' ? 'Target Course' : 'Instructor'}
                                    </th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {filteredItems.map((item: any, index: number) => {
                                    const isEnrollment = activeTab === 'enrollments';
                                    const title1 = isEnrollment ? item.studentId.name : item.title;
                                    const subtitle1 = isEnrollment ? item.studentId.email : (item.category?.name || 'Uncategorized');
                                    const title2 = isEnrollment ? item.courseTitle : item.instructor.name;
                                    const dateField = isEnrollment ? item.enrolledAt : item.createdAt;

                                    return (
                                        <tr key={index} className="hover:bg-slate-800/60 transition-colors group">
                                            <td className="px-6 py-4 min-w-[200px]">
                                                <p className="font-semibold text-slate-200">{title1}</p>
                                                <p className="text-sm text-slate-400 mt-0.5">{subtitle1}</p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300">
                                                {title2}
                                            </td>
                                            <td className="px-6 py-4">
                                                {item.status === 'approved' && (
                                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-medium rounded-full">Approved</span>
                                                )}
                                                {item.status === 'pending' && (
                                                    <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-medium rounded-full">Pending</span>
                                                )}
                                                {item.status === 'rejected' && (
                                                    <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-medium rounded-full">Rejected</span>
                                                )}
                                                {isEnrollment && item.paymentProofUrl && (
                                                    <div className="mt-2">
                                                        <a href={item.paymentProofUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline">
                                                            View Receipt
                                                        </a>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                                                {new Date(dateField).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {item.status === 'pending' && (
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => 
                                                                isEnrollment 
                                                                ? handleApproveEnrollment(item.courseId, item._id)
                                                                : handleCourseStatusUpdate(item._id, 'approved')
                                                            }
                                                            className="p-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors border border-emerald-500/20"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => 
                                                                isEnrollment 
                                                                ? handleRejectEnrollment(item._id)
                                                                : handleCourseStatusUpdate(item._id, 'rejected')
                                                            }
                                                            className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors border border-rose-500/20"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Approvals;
