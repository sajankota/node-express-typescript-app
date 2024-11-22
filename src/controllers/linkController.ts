// src/controllers/linkController.ts

import axios from "axios";
import * as cheerio from "cheerio";
import { Request, Response } from "express";
import LinkAnalysisModel from "../models/LinkAnalysisModel";
import { ReportAnalysis } from "../models/AnalysisReportModel";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * Analyze links in the provided URL.
 */
export const analyzeLinksController = async (req: AuthRequest, res: Response): Promise<void> => {
    const { url } = req.body;
    const userId = req.user?.userId;

    console.log(`[Debug] Received request to analyze links for URL: ${url}, userId: ${userId}`);

    // Validate the input
    if (!url || typeof url !== "string") {
        console.error("[Error] Invalid URL received.");
        res.status(400).json({ message: "A valid URL is required." });
        return;
    }

    if (!userId) {
        console.warn("[Warning] No user ID found in the request.");
        res.status(401).json({ message: "Unauthorized request." });
        return;
    }

    try {
        console.log(`[Debug] Fetching URL: ${url}`);
        const response = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        const $ = cheerio.load(response.data);
        console.log(`[Debug] Successfully loaded HTML for ${url}`);

        const links: {
            href: string;
            anchorText: string;
            isInternal: boolean;
        }[] = [];

        // Extract links and analyze
        $("a").each((_, el) => {
            const href = $(el).attr("href")?.trim(); // Extract href attribute
            const anchorText = $(el).text().trim() || "No anchor text"; // Extract anchor text or default

            if (href) {
                const isInternal =
                    href.startsWith("/") || href.startsWith(url); // Determine if the link is internal

                links.push({
                    href,
                    anchorText,
                    isInternal,
                });
            }
        });

        // Count internal and external links
        const internalLinks = links.filter((link) => link.isInternal);
        const externalLinks = links.filter((link) => !link.isInternal);

        // Save the analysis to the database
        const linkAnalysisRecord = await LinkAnalysisModel.create({
            userId,
            url,
            internalLinks,
            externalLinks,
        });

        console.log(`[Debug] Link analysis saved with ID: ${linkAnalysisRecord._id}`);

        // Update or create an entry in the `ReportAnalysis` model
        const analysisReport = await ReportAnalysis.findOneAndUpdate(
            { userId, url }, // Match by userId and url
            {
                $set: {
                    "analyses.linkAnalysis.status": "completed", // Update only `linkAnalysis` field
                    "analyses.linkAnalysis.linkAnalysisId": linkAnalysisRecord._id, // Add `linkAnalysisId`
                },
            },
            { new: true, upsert: true } // Create if not found, and return the updated document
        );


        console.log(`[Debug] ReportAnalysis updated with LinkAnalysis ID: ${linkAnalysisRecord._id}`);

        // Respond with the analysis
        res.status(200).json({
            message: "Link analysis completed successfully",
            data: {
                internalLinks,
                externalLinks,
            },
        });
    } catch (error) {
        console.error(`[Error] Failed to analyze links:`, error);

        // Update `AnalysisReport` with failure status
        await ReportAnalysis.findOneAndUpdate(
            { userId, url },
            {
                $set: {
                    "analyses.linkAnalysis.status": "failed",
                    "analyses.linkAnalysis.error": error instanceof Error ? error.message : "Unknown error",
                },
            },
            { upsert: true } // Create if not found
        );

        // Properly handle the error type
        if (error instanceof Error) {
            res.status(500).json({
                message: "Failed to analyze links.",
                error: error.message, // Use error.message safely
            });
        } else {
            res.status(500).json({
                message: "Failed to analyze links due to an unknown error.",
                error: String(error),
            });
        }
    }
};
