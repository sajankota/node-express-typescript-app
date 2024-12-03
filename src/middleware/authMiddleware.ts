// src/middleware/authMiddleware.ts

import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// Extend the Request interface to include the user property
export interface AuthRequest extends Request {
    user?: {
        userId: string;
        role: string;
    };
}

// Helper function to verify a JWT
export const verifyToken = (token: string): { userId: string; role: string } => {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error("[Configuration Error] JWT_SECRET is not defined in the environment variables.");
    }


    try {
        // Verify the token and decode it
        const decoded = jwt.verify(token, jwtSecret) as JwtPayload;

        // Validate the payload structure
        if (typeof decoded !== "object" || !decoded.userId || !decoded.role) {
            throw new Error("[Token Error] Invalid token payload. Missing userId or role.");
        }

        // Return the user details
        return {
            userId: decoded.userId as string,
            role: decoded.role as string,
        };
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            console.error("[Token Verification Error] JWT error:", error.message);
            throw new Error("Unauthorized. Invalid or expired token.");
        }
        console.error("[Token Verification Error] Unexpected error:", error);
        throw new Error("Internal server error during token verification.");
    }
};

// Middleware to verify the JWT and attach user details to the request
export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        // Extract the Authorization header
        const authHeader = req.headers.authorization;
        console.log("[Debug] Authorization header received:", authHeader); // Log the Authorization header for debugging

        // Validate the Authorization header format
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.error("[Auth Middleware] Missing or invalid Authorization header.");
            res.status(401).json({
                message: "Unauthorized. Authorization header is required and must follow the format 'Bearer <token>'.",
            });
            return; // Ensure execution stops after sending the response
        }

        // Extract the token from the header
        const token = authHeader.split(" ")[1];
        console.log("[Debug] Extracted token:", token);

        // Use the verifyToken helper to decode and validate the token
        const user = verifyToken(token);

        // Attach user information to the request object
        req.user = user;
        console.log(`[Debug] User authenticated: UserID=${req.user.userId}, Role=${req.user.role}`);

        // Continue to the next middleware or route handler
        next();
    } catch (error: unknown) {
        console.error("[Auth Middleware] Error:", error instanceof Error ? error.message : error);

        // Handle token errors and other unexpected errors
        res.status(401).json({ message: error instanceof Error ? error.message : "Unauthorized." });
    }
};
