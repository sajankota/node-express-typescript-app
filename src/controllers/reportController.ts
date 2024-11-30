// src/controllers/reportController.ts

import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import axios from "axios";
import mongoose from "mongoose";
import { Report } from "../models/reportModel";
import { ReportAnalysis } from "../models/AnalysisReportModel";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const PAGE_SPEED_API_URL = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

// Helper function to fetch full data from Google PageSpeed API
// src/controllers/reportController.ts

// Helper function to fetch full data from Google PageSpeed API
const fetchFullReport = async (strategy: "mobile" | "desktop", url: string) => {
    if (!GOOGLE_API_KEY) {
        throw new Error("Google API key is missing. Please set GOOGLE_API_KEY in your environment.");
    }

    const categories = ["performance", "accessibility", "best-practices", "seo", "pwa"];
    const categoryParams = categories.map((c) => `category=${c}`).join("&");
    const requestUrl = `${PAGE_SPEED_API_URL}?url=${encodeURIComponent(url)}&key=${GOOGLE_API_KEY}&strategy=${strategy}&${categoryParams}`;

    console.log(`[API Call] Fetching ${strategy} report for URL: ${url}`);
    try {
        const response = await axios.get(requestUrl);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error(`[Error] Failed to fetch ${strategy} report:`, error.message);
        } else {
            console.error(`[Error] Failed to fetch ${strategy} report:`, error);
        }
        throw new Error(`Failed to fetch ${strategy} report for URL: ${url}`);
    }
};

// Generate a new PageSpeed report
export const generateReport = async (req: AuthRequest, res: Response): Promise<void> => {
    const { url } = req.body;
    const userId = req.user?.userId;

    console.log(`[Debug] Received request to generate PageSpeed report for URL: ${url}, userId: ${userId}`);

    if (!url || !userId) {
        res.status(400).json({ message: "URL and User ID are required." });
        return;
    }

    try {
        const [mobileReport, desktopReport] = await Promise.all([
            fetchFullReport("mobile", url),
            fetchFullReport("desktop", url),
        ]);

        const pageSpeedRecord = await Report.create({
            userId,
            url,
            mobileReport,
            desktopReport,
        });

        console.log(`[Debug] PageSpeed report saved with ID: ${pageSpeedRecord._id}`);

        const analysisReport = await ReportAnalysis.findOneAndUpdate(
            { userId, url },
            {
                $set: {
                    "analyses.pageSpeed.status": "completed",
                    "analyses.pageSpeed.pageSpeedId": pageSpeedRecord._id,
                },
            },
            { new: true, upsert: true }
        );

        console.log(`[Debug] ReportAnalysis updated with PageSpeed ID: ${pageSpeedRecord._id}`);
        res.status(201).json({ message: "PageSpeed report generated successfully", pageSpeedRecord });
    } catch (error) {
        if (error instanceof Error) {
            console.error("[Error] Failed to generate PageSpeed report:", error.message);

            await ReportAnalysis.findOneAndUpdate(
                { userId, url },
                {
                    $set: {
                        "analyses.pageSpeed.status": "failed",
                        "analyses.pageSpeed.error": error.message,
                    },
                },
                { upsert: true }
            );
        } else {
            console.error("[Error] Failed to generate PageSpeed report:", error);
        }

        res.status(500).json({ message: "Failed to generate PageSpeed report." });
    }
};

// Fetch all user URLs with the latest mobile/desktop scores
export const getUserUrls = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    console.log('[Debug] User ID from auth middleware:', userId);

    if (!userId) {
        res.status(401).json({ message: 'Unauthorized. User ID is required.' });
        return;
    }

    try {
        const urlData = await Report.aggregate([
            { $match: { userId } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$url",
                    url: { $first: "$url" },
                    lastReportDate: { $first: "$createdAt" },
                    mobileReport: { $first: "$mobileReport" },
                    desktopReport: { $first: "$desktopReport" },
                    reportId: { $first: "$_id" },
                },
            },
            {
                $project: {
                    _id: 0,
                    url: 1,
                    reportId: 1,
                    lastReportDate: 1,
                    mobileScore: { $multiply: ["$mobileReport.lighthouseResult.categories.performance.score", 100] },
                    desktopScore: { $multiply: ["$desktopReport.lighthouseResult.categories.performance.score", 100] },
                },
            },
        ]).allowDiskUse(true);

        console.log('[Debug] Aggregation result:', urlData);

        if (!urlData.length) {
            res.status(200).json([]);
            return;
        }

        res.status(200).json(urlData);
    } catch (error) {
        if (error instanceof Error) {
            console.error('[Get User URLs Error]', error.message);
        } else {
            console.error('[Get User URLs Error]', error);
        }
        res.status(500).json({ message: 'Failed to fetch user reports.' });
    }
};

// Fetch an individual PageSpeed report by ID
export const getIndividualReport = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { id } = req.params;

    console.log(`[Debug] Fetching individual report for ID: ${id}, userId: ${userId}`);

    if (!userId) {
        res.status(401).json({ message: "Unauthorized. User ID is required." });
        return;
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ message: "Invalid report ID format." });
        return;
    }

    try {
        const report = await Report.findOne({ _id: id, userId });

        if (!report) {
            res.status(404).json({ message: "Report not found." });
            return;
        }

        res.status(200).json(report);
    } catch (error) {
        if (error instanceof Error) {
            console.error("[Get Individual Report Error]", error.message);
        } else {
            console.error("[Get Individual Report Error]", error);
        }
        res.status(500).json({ message: "Failed to fetch the report." });
    }
};
