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
const fetchFullReport = async (strategy: "mobile" | "desktop", url: string) => {
    const categories = ["performance", "accessibility", "best-practices", "seo", "pwa"];
    const categoryParams = categories.map((c) => `category=${c}`).join("&");
    const requestUrl = `${PAGE_SPEED_API_URL}?url=${encodeURIComponent(url)}&key=${GOOGLE_API_KEY}&strategy=${strategy}&${categoryParams}`;

    console.log(`[API Call] Fetching ${strategy} report for URL: ${url}`);
    const response = await axios.get(requestUrl);
    return response.data;
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
        // Fetch PageSpeed data
        const [mobileReport, desktopReport] = await Promise.all([
            fetchFullReport("mobile", url),
            fetchFullReport("desktop", url),
        ]);

        // Save the PageSpeed report in the `Report` model
        const pageSpeedRecord = await Report.create({
            userId,
            url,
            mobileReport,
            desktopReport,
        });

        console.log(`[Debug] PageSpeed report saved with ID: ${pageSpeedRecord._id}`);

        // Update or create an entry in the `ReportAnalysis` model for this user and URL
        const analysisReport = await ReportAnalysis.findOneAndUpdate(
            { userId, url }, // Match by userId and url
            {
                $set: {
                    "analyses.pageSpeed.status": "completed",
                    "analyses.pageSpeed.pageSpeedId": pageSpeedRecord._id,
                },
            },
            { new: true, upsert: true } // Create if not found
        );

        console.log(`[Debug] ReportAnalysis updated with PageSpeed ID: ${pageSpeedRecord._id}`);

        res.status(201).json({ message: "PageSpeed report generated successfully", pageSpeedRecord });
    } catch (error) {
        console.error("[Error] Failed to generate PageSpeed report:", error);

        // Update `ReportAnalysis` to reflect the error
        await ReportAnalysis.findOneAndUpdate(
            { userId, url },
            {
                $set: {
                    "analyses.pageSpeed.status": "failed",
                    "analyses.pageSpeed.error": error instanceof Error ? error.message : "Unknown error",
                },
            },
            { upsert: true } // Create if not found
        );

        res.status(500).json({ message: "Failed to generate PageSpeed report." });
    }
};

// Fetch all user URLs with the latest mobile/desktop scores
export const getUserUrls = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;

    console.log('[Debug] User ID from auth middleware:', userId); // Log the userId extracted from the token

    if (!userId) {
        console.error('[Error] User ID is undefined in the request.');
        res.status(401).json({ message: 'Unauthorized. User ID is required.' });
        return;
    }

    try {
        const urlData = await Report.aggregate([
            { $match: { userId } }, // Match reports for the current user
            { $sort: { createdAt: -1 } }, // Sort reports by creation date (most recent first)
            {
                $group: {
                    _id: "$url", // Group by `url`
                    url: { $first: "$url" }, // Include `url` field
                    lastReportDate: { $first: "$createdAt" }, // Include the date of the most recent report for the URL
                    mobileReport: { $first: "$mobileReport" }, // Include the mobile report data
                    desktopReport: { $first: "$desktopReport" }, // Include the desktop report data
                    reportId: { $first: "$_id" }, // Include the `_id` of the report as `reportId`
                },
            },
            {
                $project: {
                    _id: 0, // Exclude the default `_id` field from the response
                    url: 1,
                    reportId: 1, // Add `reportId` to the response
                    lastReportDate: 1,
                    mobileScore: { $multiply: ["$mobileReport.lighthouseResult.categories.performance.score", 100] },
                    desktopScore: { $multiply: ["$desktopReport.lighthouseResult.categories.performance.score", 100] },
                },
            },
        ]);

        console.log('[Debug] Aggregation result:', urlData);

        if (!urlData.length) {
            console.warn('[Warning] No reports found for the user.');
            res.status(200).json([]);
            return;
        }

        res.status(200).json(urlData); // Send the updated response
    } catch (error) {
        console.error('[Get User URLs Error]', error instanceof Error ? error.message : error);
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

    // Validate if the `id` is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.error(`[Error] Invalid ID format: ${id}`);
        res.status(400).json({ message: "Invalid report ID format." });
        return;
    }

    try {
        const report = await Report.findOne({ _id: id, userId });

        if (!report) {
            console.warn(`[Warning] Report not found for ID: ${id}, userId: ${userId}`);
            res.status(404).json({ message: "Report not found." });
            return;
        }

        res.status(200).json(report);
    } catch (error) {
        console.error("[Get Individual Report Error]", error instanceof Error ? error.message : error);
        res.status(500).json({ message: "Failed to fetch the report." });
    }
};
