// src/middleware/analyticsMiddleware.ts

import { Request, Response, NextFunction } from 'express';
import ReactGA from 'react-ga4'; // Google Analytics library

// Initialize Google Analytics
ReactGA.initialize('G-3QWX5DEJ3D'); // Replace with your Measurement ID

// Middleware to track API calls
export const trackApiCall = (action: string, label: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            // Track the event in Google Analytics
            ReactGA.event({
                category: 'API Call',
                action,
                label,
            });
            console.log(`[Analytics] Tracked API Call - Action: ${action}, Label: ${label}`);
        } catch (error) {
            console.error('[Analytics] Error tracking API call:', error);
        }
        next();
    };
};
