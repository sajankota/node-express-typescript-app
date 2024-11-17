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
            res.status(400).json({ message: 'URL is required' });
            return;
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Determine report limits based on user role
        const userRole = user.role || 'free_user';
        const reportLimit = reportLimits[userRole] ?? 5;

        // Check monthly report limit
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const reportCount = await Report.countDocuments({ userId, timestamp: { $gte: startOfMonth } });

        if (reportCount >= reportLimit) {
            res.status(403).json({ message: `Monthly report limit of ${reportLimit} reached` });
            return;
        }

        // Helper function to fetch full data from Google API
        const fetchFullReport = async (strategy: 'mobile' | 'desktop') => {
            const apiUrl = `${PAGE_SPEED_API_URL}?url=${encodeURIComponent(url)}&key=${GOOGLE_API_KEY}&strategy=${strategy}`;
            const response = await axios.get(apiUrl);
            return response.data; // Return the entire API response
        };

        // Fetch both mobile and desktop reports concurrently
        const [mobileReport, desktopReport] = await Promise.all([
            fetchFullReport('mobile'),
            fetchFullReport('desktop'),
        ]);

        // Save the complete report data in MongoDB
        const newReport = await Report.create({
            userId,
            url,
            mobileReport,
            desktopReport,
            timestamp: new Date(),
        });

        // Update the user's monthly report count
        user.monthlyReportCount += 1;
        await user.save();

        // Respond with the complete report data
        res.status(201).json({
            message: 'Report generated successfully',
            report: {
                url,
                mobileReport,
                desktopReport,
            },
        });
    } catch (error) {
        console.error('[Report Generation Error]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};