// src/controllers/reportController.ts

import { AuthRequest } from '../middleware/authMiddleware';
import { Response } from 'express';
import { exec } from 'child_process';
import { Report } from '../models/reportModel';
import { User } from '../models/userModel';
import { generateReportCommand } from '../utils/reportGenerator';
import { reportLimits } from '../config/reportLimits';

interface LighthouseReport {
    categories: {
        performance: {
            score: number;
        };
    };
}

export const generateLighthouseReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        console.log('[Debug] Entering generateLighthouseReport');
        const userId = req.user?.userId;
        const { url } = req.body;

        if (!url) {
            res.status(400).json({ message: 'URL is required' });
            return;
        }

        console.log('[Debug] User ID:', userId);
        console.log('[Debug] URL:', url);

        // Fetch the user document
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        console.log('[Debug] User:', user);

        // Determine the user role and set the report limit
        const userRole = user.role || 'free_user';
        const reportLimit = reportLimits[userRole] ?? 5;
        console.log('[Debug] User Role:', userRole);
        console.log('[Debug] Report Limit:', reportLimit);

        // Check user's monthly usage limit
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const reportCount = await Report.countDocuments({ userId, timestamp: { $gte: startOfMonth } });
        console.log('[Debug] Monthly Report Count from Reports Collection:', reportCount);

        if (reportCount >= reportLimit) {
            res.status(403).json({ message: `Monthly report limit of ${reportLimit} reached` });
            return;
        }

        // Generate reports
        console.log('[Debug] Generating Mobile Report');
        const mobileReport = await generateReportCommand(url, 'mobile');
        console.log('[Debug] Mobile Report Generated');

        console.log('[Debug] Generating Desktop Report');
        const desktopReport = await generateReportCommand(url, 'desktop');
        console.log('[Debug] Desktop Report Generated');

        // Save the new report in the Reports collection
        const newReport = await Report.create({
            userId,
            url,
            mobilePerformanceScore: mobileReport.categories.performance.score * 100,
            desktopPerformanceScore: desktopReport.categories.performance.score * 100,
            mobileReport,
            desktopReport,
        });

        console.log('[Debug] Report Saved to Database');

        // Update the user's monthly report count
        user.monthlyReportCount += 1;
        await user.save();
        console.log('[Debug] User Monthly Report Count Updated:', user.monthlyReportCount);

        // Respond with the generated report
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
