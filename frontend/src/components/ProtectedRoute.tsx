import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import AppLayout from './AppLayout';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: UserRole[];
    wrapLayout?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, wrapLayout }) => {
    const { user, isAuthenticated, isLoading } = useAuth();

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to home if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Check role-based access
    if (allowedRoles && user && user.role !== UserRole.SUPER_ADMIN && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    if (wrapLayout) {
        return <AppLayout>{children}</AppLayout>;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
