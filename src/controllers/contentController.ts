// src/controllers/contentController.ts

import { Request, Response } from "express";
import { scrapeContent } from "../services/scraper";
import ContentModel from "../models/ContentModel";
import { ReportAnalysis } from "../models/AnalysisReportModel";
import { AuthRequest } from "../middleware/authMiddleware";

export const getContent = async (req: AuthRequest, res: Response): Promise<void> => {
    const { url } = req.body;

    console.log(`[Debug] Received request to extract content for URL: ${url}`);

    // Validate the URL
    if (!url || typeof url !== "string") {
        console.error("[Error] Invalid URL received.");
        res.status(400).json({ message: "A valid URL is required." });
        return;
    }

    // Extract `userId` from `req.user`
    const userId = req.user?.userId;

    // Validate the userId
    if (!userId) {
        console.warn("[Warning] No user ID found in the request.");
        res.status(401).json({ message: "Unauthorized request." });
        return;
    }

    try {
        // Extract content using the `scrapeContent` service
        const { tags, counts, analysis, content } = await scrapeContent(url);

        // Save the content analysis to the database
        const contentRecord = new ContentModel({
            userId, // Use the extracted userId
            url,
            tags,
            counts,
            analysis,
            content,
        });

        await contentRecord.save();
        console.log(`[Debug] Content details saved to the database for user: ${userId}`);

        // Save the `_id` of the content record to the `AnalysisReport` model
        const analysisReport = await ReportAnalysis.findOneAndUpdate(
            { userId, url }, // Match by userId and url
            {
                $set: {
                    "analyses.contentAnalysis.status": "completed",
                    "analyses.contentAnalysis.contentAnalysisId": contentRecord._id,
                },
            },
            { new: true, upsert: true } // Create if not found
        );

        console.log(`[Debug] ReportAnalysis updated with ContentAnalysis ID: ${contentRecord._id}`);

        // Send the response
        res.status(200).json({
            message: "Content extracted successfully",
            data: { tags, counts, analysis, content },
        });
    } catch (error) {
        console.error("[Error] Failed to extract content.", error);

        // Update `AnalysisReport` with failure status
        await ReportAnalysis.findOneAndUpdate(
            { userId, url },
            {
                $set: {
                    "analyses.contentAnalysis.status": "failed",
                    "analyses.contentAnalysis.error": error instanceof Error ? error.message : "Unknown error",
                },
            },
            { upsert: true } // Create a new `AnalysisReport` if one doesn't exist
        );

        res.status(500).json({
            message: "Failed to scrape and analyze content.",
        });
    }
};
