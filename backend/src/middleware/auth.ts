import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
    };
}

interface JwtPayload {
    user: {
        id: string;
        role: string;
    };
}

const normalizeRole = (role: string): string => {
    if (role === 'instructor') return 'teacher';
    return role;
};

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if no token
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret_not_for_prod';
        const decoded = jwt.verify(token, secret) as JwtPayload;

        // The payload is { user: { id, role } }
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Optional auth: attaches req.user when token is valid, otherwise continues as anonymous.
export const optionalAuthenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return next();
    }

    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret_not_for_prod';
        const decoded = jwt.verify(token, secret) as JwtPayload;
        req.user = decoded.user;
    } catch (_err) {
        // Ignore invalid tokens in optional mode and treat request as anonymous.
    }

    next();
};

export const checkRole = (roles: string[]) => {
    const normalizedAllowed = roles.map(normalizeRole);

    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (req.user.role === 'super_admin') {
            return next();
        }

        const normalizedUserRole = normalizeRole(req.user.role);
        if (!normalizedAllowed.includes(normalizedUserRole)) {
            return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
        }

        next();
    };
};

// Backward-compatible alias for existing route guards.
export const authorize = (roles: string[]) => checkRole(roles);
