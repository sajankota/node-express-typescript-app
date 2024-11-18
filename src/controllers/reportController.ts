// src/controllers/reportController.ts

import { AuthRequest } from '../middleware/authMiddleware';
import { Response } from 'express';
import axios from 'axios';
import { Report } from '../models/reportModel';
import { User, IUser } from '../models/userModel';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const PAGE_SPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

// Helper function to fetch full data from Google PageSpeed API
const fetchFullReport = async (strategy: 'mobile' | 'desktop', url: string) => {
    const categories = ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'];
    const categoryParams = categories.map((c) => `category=${c}`).join('&');
    const requestUrl = `${PAGE_SPEED_API_URL}?url=${encodeURIComponent(url)}&key=${GOOGLE_API_KEY}&strategy=${strategy}&${categoryParams}`;

    console.log(`[API Call] Fetching ${strategy} report for URL: ${url}`);
    const response = await axios.get(requestUrl);
    return response.data;
};

// Generate a new report
export const generateReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { url } = req.body;

        if (!url || !userId) {
            res.status(400).json({ message: 'URL and User ID are required.' });
            return;
        }

        const user = await User.findById(userId) as IUser | null;
        if (!user) {
            res.status(404).json({ message: 'User not found.' });
            return;
        }

        const reportLimit = user.reportLimit || 5;
        const currentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const reportCount = await Report.countDocuments({ userId, timestamp: { $gte: currentMonth } });

        if (reportCount >= reportLimit) {
            res.status(403).json({ message: `Monthly report limit of ${reportLimit} reached.` });
            return;
        }

        const [mobileReport, desktopReport] = await Promise.all([
            fetchFullReport('mobile', url),
            fetchFullReport('desktop', url)
        ]);

        const newReport = await Report.create({
            userId: userId, // Store userId as a string
            url,
            mobileReport,
            desktopReport,
            timestamp: new Date(),
        });

        console.log('[MongoDB] Report saved with ID:', newReport._id);

        await User.findByIdAndUpdate(userId, { $inc: { monthlyReportCount: 1 } });
        res.status(201).json({ message: 'Report generated successfully', report: newReport });
    } catch (error) {
        console.error('[Report Generation Error]', error instanceof Error ? error.message : error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get user reports with latest mobile/desktop scores
export const getUserUrls = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized. User ID is required.' });
            return;
        }

        console.log(`[Debug] Fetching reports for user ID: ${userId}`);

        // Use userId as a string in the query
        const urlData = await Report.aggregate([
            { $match: { userId } }, // Match userId as a string
            { $sort: { createdAt: -1 } }, // Sort by createdAt (most recent first)
            {
                $group: {
                    _id: '$url',
                    url: { $first: '$url' }, // Preserve the URL field
                    lastReportDate: { $first: '$createdAt' }, // Use createdAt instead of timestamp
                    mobileReport: { $first: '$mobileReport' },
                    desktopReport: { $first: '$desktopReport' },
                    reportId: { $first: '$_id' } // Add report ID to the response
                }
            },
            {
                $project: {
                    _id: 0, // Exclude the _id field from the result
                    url: 1,
                    lastReportDate: 1,
                    mobileScore: { $multiply: ['$mobileReport.lighthouseResult.categories.performance.score', 100] },
                    desktopScore: { $multiply: ['$desktopReport.lighthouseResult.categories.performance.score', 100] },
                    reportId: 1 // Include the report ID in the response
                }
            }
        ]);

        console.log('[Debug] Aggregation result:', urlData);
        if (!urlData.length) {
            console.warn('[Warning] No reports found for the user.');
        }

        res.status(200).json(urlData);
    } catch (error) {
        console.error('[Get User URLs Error]', error instanceof Error ? error.message : error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Get an individual report by ID
export const getIndividualReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized. User ID is required.' });
            return;
        }

        const report = await Report.findOne({ _id: id, userId });

        if (!report) {
            res.status(404).json({ message: 'Report not found.' });
            return;
        }

        res.status(200).json(report);
    } catch (error) {
        console.error('[Get Individual Report Error]', error instanceof Error ? error.message : error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};
