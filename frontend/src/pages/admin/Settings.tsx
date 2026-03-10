import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { showSuccess, showError } from '../../utils/toast';
import axios from 'axios';
import { ArrowLeft, Settings as SettingsIcon, Plus, Trash2 } from 'lucide-react';

interface Category {
    _id: string;
    name: string;
    description: string;
    icon: string;
    isActive: boolean;
}

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '', icon: '' });

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/categories`);
            setCategories(res.data);
        } catch (err) {
            console.error('Error fetching categories:', err);
            showError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!newCategory.name || !newCategory.icon) {
            showError('Name and icon are required');
            return;
        }

        try {
            await axios.post(
                `${API_URL}/categories`,
                newCategory,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showSuccess('Category created successfully');
            setShowAddModal(false);
            setNewCategory({ name: '', description: '', icon: '' });
            fetchCategories();
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to create category');
        }
    };

    const handleDeleteCategory = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showSuccess('Category deleted successfully');
            fetchCategories();
        } catch (err: any) {
            showError(err.response?.data?.message || 'Failed to delete category');
        }
    };

    return (
        <div className="min-h-[85vh] bg-gray-50 dark:bg-dark-bg p-4 md:p-8">
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
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                <SettingsIcon className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-dark-bg dark:text-white">System Settings</h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Manage categories and platform settings</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Add Category
                        </button>
                    </div>

                    {/* Categories Section */}
                    <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                        <h2 className="text-lg font-bold text-dark-bg dark:text-white mb-4">Course Categories</h2>
                        
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading categories...</div>
                        ) : categories.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No categories found</div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map((category) => (
                                    <div
                                        key={category._id}
                                        className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-primary transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{category.icon}</span>
                                                <h3 className="font-bold text-dark-bg dark:text-white">{category.name}</h3>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteCategory(category._id, category.name)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                                        <div className="mt-3">
                                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${category.isActive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Platform Info */}
                    <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                            ⚙️ Additional system settings (email configuration, payment settings, etc.) will be available in future updates.
                        </p>
                    </div>
                </motion.div>

                {/* Add Category Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white dark:bg-dark-card rounded-2xl p-6 max-w-md w-full"
                        >
                            <h2 className="text-xl font-bold text-dark-bg dark:text-white mb-4">Add New Category</h2>
                            <form onSubmit={handleAddCategory} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-dark-bg dark:text-white mb-2">
                                        Category Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                        placeholder="e.g., Web Development"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-dark-bg dark:text-white focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-dark-bg dark:text-white mb-2">
                                        Icon (Emoji) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newCategory.icon}
                                        onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                                        placeholder="e.g., 💻"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-dark-bg dark:text-white focus:outline-none focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-dark-bg dark:text-white mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={newCategory.description}
                                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                                        placeholder="Brief description..."
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-bg text-dark-bg dark:text-white focus:outline-none focus:border-primary resize-none"
                                    />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddModal(false);
                                            setNewCategory({ name: '', description: '', icon: '' });
                                        }}
                                        className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-accent text-white font-bold hover:shadow-lg transition-all"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
