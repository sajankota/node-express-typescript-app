// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extend the Request interface to include the user property
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.warn('[Authorization Error] No token provided or invalid format.');
        res.status(401).json({ message: 'Access denied. No token provided or invalid format.' });
        return;
    }

    const token = authHeader.split(' ')[1];

    // Ensure JWT_SECRET is defined
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('[Configuration Error] JWT_SECRET is not defined.');
        res.status(500).json({ message: 'Internal server error.' });
        return;
    }

    try {
        // Verify the token and cast it to JwtPayload
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        // Check if the decoded token has userId and role
        if (typeof decoded !== 'object' || !decoded.userId || !decoded.role) {
            console.error('[Token Error] Invalid token payload.');
            res.status(401).json({ message: 'Invalid token payload.' });
            return;
        }

        // Attach user information to the request object
        req.user = { userId: decoded.userId as string, role: decoded.role as string };
        console.log('[Debug] User ID from token:', req.user.userId);

        next();
    } catch (error: any) {
        console.error('[Token Verification Error]', error.message);
        res.status(401).json({ message: 'Invalid token.' });
    }
};
