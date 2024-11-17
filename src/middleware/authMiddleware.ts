// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend the Request interface to include the user property
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
        username: string;
    };
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            userId: string;
            role: string;
            username: string;
        };

        // Attach user information to the request object
        req.user = {
            userId: decoded.userId,
            role: decoded.role,
            username: decoded.username,
        };

        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token. Access denied.' });
    }
};
