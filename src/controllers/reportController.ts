// src/controllers/reportController.ts
import { AuthRequest } from '../middleware/authMiddleware';
import { Response } from 'express';
import { exec } from 'child_process';
import { Report } from '../models/reportModel';
import { User } from '../models/userModel'; // Import the User model
import { generateReportCommand } from '../utils/reportGenerator';
import { reportLimits } from '../config/reportLimits';

interface LighthouseReport {
    categories: {
        performance: {
            score: number;
        };
    };
}

// Define the type for reportLimits
type UserRole = 'free_user' | 'paid_user' | 'admin' | 'super_admin';

export const generateLighthouseReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { url } = req.body;

        if (!url) {
            res.status(400).json({ message: 'URL is required' });
            return;
        }

        // Retrieve the user’s role
        const user = await User.findById(userId);
        const userRole: UserRole = (user?.role as UserRole) || 'free_user';
        const reportLimit = reportLimits[userRole] ?? 5; // Default limit for unknown roles

        // Check user's monthly usage limit
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const reportCount = await Report.countDocuments({ userId, timestamp: { $gte: startOfMonth } });

        if (reportCount >= reportLimit) {
            res.status(403).json({ message: `Monthly report limit of ${reportLimit} reached` });
            return;
        }

        // Generate reports
        const mobileReport = await generateReportCommand(url, 'mobile') as LighthouseReport;
        const desktopReport = await generateReportCommand(url, 'desktop') as LighthouseReport;

        // Save the report to the database
        const newReport = await Report.create({
            userId,
            url,
            mobilePerformanceScore: mobileReport.categories.performance.score * 100,
            desktopPerformanceScore: desktopReport.categories.performance.score * 100,
            mobileReport,
            desktopReport,
        });

        res.status(201).json({ message: 'Report generated successfully', report: newReport });
    } catch (error) {
        console.error('[Report Generation Error]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getReportHistory = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const reports = await Report.find({ userId }).sort({ timestamp: -1 });
        res.status(200).json(reports);
    } catch (error) {
        console.error('[Get Report History Error]', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
