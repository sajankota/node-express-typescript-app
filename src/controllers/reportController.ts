// src/controllers/reportController.ts

import { AuthRequest } from '../middleware/authMiddleware';
import { Response } from 'express';
import axios from 'axios';
import { Report } from '../models/reportModel';
import { User } from '../models/userModel';
import { reportLimits } from '../config/reportLimits';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const PAGE_SPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

export const generateReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { url } = req.body;

        if (!url) {
            console.warn('[Input Error] URL is missing');
            res.status(400).json({ message: 'URL is required' });
            return;
        }

        // Fetch user and report count concurrently
        const [user, reportCount] = await Promise.all([
            User.findById(userId),
            Report.countDocuments({ userId, timestamp: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } })
        ]);

        if (!user) {
            console.warn('[User Not Found] User ID:', userId);
            res.status(404).json({ message: 'User not found' });
            return;
        }

        const userRole = user.role || 'free_user';
        const reportLimit = reportLimits[userRole] ?? 5;
        console.log('[User Role and Limits] Role:', userRole, 'Report Limit:', reportLimit, 'Current Count:', reportCount);

        if (reportCount >= reportLimit) {
            console.warn('[Limit Reached] User ID:', userId);
            res.status(403).json({ message: `Monthly report limit of ${reportLimit} reached` });
            return;
        }

        // Helper function to fetch full data from Google API
        const fetchFullReport = async (strategy: 'mobile' | 'desktop') => {
            try {
                const apiUrl = `${PAGE_SPEED_API_URL}?url=${encodeURIComponent(url)}&key=${GOOGLE_API_KEY}&strategy=${strategy}`;
                console.log(`[API Call] Fetching ${strategy} report for URL: ${url}`);
                const response = await axios.get(apiUrl);
                console.log(`[API Success] ${strategy} report fetched`);
                return response.data;
            } catch (apiError: any) {
                console.error(`[API Error] Failed to fetch ${strategy} report:`, apiError.message || apiError);
                throw new Error(`Failed to fetch ${strategy} report`);
            }
        };

        // Fetch both mobile and desktop reports concurrently
        const [mobileReport, desktopReport] = await Promise.all([
            fetchFullReport('mobile'),
            fetchFullReport('desktop')
        ]);
        console.log('[API Success] Both reports fetched successfully');

        // Save the complete report data in MongoDB
        const newReport = await Report.create({
            userId,
            url,
            mobileReport,
            desktopReport,
            timestamp: new Date(),
        });
        console.log('[MongoDB] Report saved successfully with ID:', newReport._id);

        // Update the user's monthly report count and save
        await User.findByIdAndUpdate(userId, { $inc: { monthlyReportCount: 1 } });
        console.log('[MongoDB] User report count updated for User ID:', userId);

        // Respond with the complete report data
        res.status(201).json({
            message: 'Report generated successfully',
            report: {
                url,
                mobileReport,
                desktopReport,
            },
        });
    } catch (error: any) {
        console.error('[Report Generation Error]', error.message || error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
