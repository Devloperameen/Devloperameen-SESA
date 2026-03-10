import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';

const Resources: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-dark-bg dark:text-white">Study Resources</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Access materials from your enrolled courses</p>
                        </div>
                    </div>

                    {/* Empty State */}
                    <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
                        <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="w-10 h-10 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-dark-bg dark:text-white mb-2">No Resources Available</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">
                            Enroll in courses to access study materials, videos, and downloadable resources
                        </p>
                        <button
                            onClick={() => navigate('/student/browse')}
                            className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            Browse Courses
                        </button>
                    </div>

                    {/* Info Message */}
                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                            📚 Resource management and file uploads will be implemented soon. Stay tuned!
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Resources;
