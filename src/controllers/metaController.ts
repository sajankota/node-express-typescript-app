// src/controllers/metaController.ts

import * as cheerio from "cheerio";
import { Response } from "express";
import MetadataModel from "../models/MetaDataModel"; // Metadata model
import { ReportAnalysis } from "../models/AnalysisReportModel"; // Correctly imported as ReportAnalysis
import { AuthRequest } from "../middleware/authMiddleware"; // Auth middleware

/**
 * Helper function to fetch metadata using Cheerio
 * @param url - URL to scrape metadata from
 * @returns Metadata object
 */
export async function getMetadata(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
    }

    try {
        console.log(`[Debug] Fetching URL: ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log(`[Debug] Successfully fetched HTML from: ${url}`);

        const html = await response.text();
        const $ = cheerio.load(html);
        console.log(`[Debug] Loaded HTML into Cheerio for: ${url}`);

        const metadata = {
            title: $("title").first().text().trim() || "",
            description:
                $('meta[name="description"]').attr("content") ||
                $('meta[property="og:description"]').attr("content") ||
                "",
            keywords: $('meta[name="keywords"]').attr("content") || "",
            favicon:
                $('link[rel="icon"]').attr("href") ||
                $('link[rel="shortcut icon"]').attr("href") ||
                "",
            language: $("html").attr("lang") || "",
            author: $('meta[name="author"]').attr("content") || "",
            viewport: $('meta[name="viewport"]').attr("content") || "",
            og: {
                title: $('meta[property="og:title"]').attr("content") || "",
                description: $('meta[property="og:description"]').attr("content") || "",
                image: $('meta[property="og:image"]').attr("content") || "",
                url: $('meta[property="og:url"]').attr("content") || "",
                type: $('meta[property="og:type"]').attr("content") || "",
                site_name: $('meta[property="og:site_name"]').attr("content") || "",
            },
            twitter: {
                title: $('meta[name="twitter:title"]').attr("content") || "",
                description: $('meta[name="twitter:description"]').attr("content") || "",
                image: $('meta[name="twitter:image"]').attr("content") || "",
                card: $('meta[name="twitter:card"]').attr("content") || "",
            },
            custom: {} as Record<string, string>,
        };

        $('meta').each((_, el) => {
            const name = $(el).attr("name") || $(el).attr("property");
            const content = $(el).attr("content");
            if (name && content) {
                metadata.custom[name] = content;
            }
        });

        console.log(`[Debug] Extracted metadata:`, metadata);
        return metadata;
    } catch (error) {
        console.error("[Error] Error fetching metadata:", error);
        throw error;
    }
}

/**
 * Extract meta tags for a URL and save to the database
 */
export const getMetaTags = async (req: AuthRequest, res: Response): Promise<void> => {
    const { url } = req.body;
    const userId = req.user?.userId;

    console.log(`[Debug] Received request to scrape metadata for: ${url}, userId: ${userId}`);

    if (!url || typeof url !== "string") {
        res.status(400).json({ message: "A valid URL is required." });
        return;
    }

    try {
        // Fetch metadata
        const metadata = await getMetadata(url);

        // Save metadata to the database
        const metadataRecord = await MetadataModel.create({
            userId,
            url,
            metadata,
        });

        console.log(`[Debug] Metadata saved with ID: ${metadataRecord._id}`);

        // Update or create a ReportAnalysis linked to this metadata
        const analysisReport = await ReportAnalysis.findOneAndUpdate(
            { userId, url }, // Match by userId and url
            {
                $set: {
                    "analyses.metaData.status": "completed",
                    "analyses.metaData.metaDataId": metadataRecord._id,
                },
            },
            { new: true, upsert: true } // Create if not found
        );


        console.log(`[Debug] ReportAnalysis updated with metadata ID: ${metadataRecord._id}`);

        res.status(200).json({
            message: "Metadata fetched and saved successfully",
            metadata,
        });
    } catch (error) {
        console.error("[Error] Failed to fetch metadata:", error);

        // Update ReportAnalysis with failure status
        await ReportAnalysis.findOneAndUpdate( // Correctly using ReportAnalysis
            { userId, url },
            {
                $set: {
                    "analyses.metaData.status": "failed",
                    "analyses.metaData.error": error instanceof Error ? error.message : "Unknown error",
                },
            },
            { upsert: true } // Create a ReportAnalysis if it doesn't exist
        );

        res.status(500).json({ message: "Failed to fetch metadata." });
    }
};

/**
 * Fetch all metadata saved for the logged-in user
 */
export const getUserMetaTags = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { page = 1, limit = 10 } = req.query;

    console.log(`[Debug] Received request to fetch meta-tags for user: ${userId}`);

    if (!userId) {
        res.status(401).json({ message: "Unauthorized. Please log in to access this resource." });
        return;
    }

    try {
        const pageNumber = parseInt(page as string, 10) || 1;
        const pageSize = parseInt(limit as string, 10) || 10;
        const skip = (pageNumber - 1) * pageSize;

        const metadataRecords = await MetadataModel.find({ userId })
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 });

        const totalRecords = await MetadataModel.countDocuments({ userId });

        console.log(`[Debug] Found ${metadataRecords.length} records for user: ${userId}`);

        res.status(200).json({
            message: "Metadata retrieved successfully",
            metadataRecords,
            pagination: {
                totalRecords,
                currentPage: pageNumber,
                totalPages: Math.ceil(totalRecords / pageSize),
                pageSize,
            },
        });
    } catch (error) {
        console.error("[Error] Failed to fetch metadata records:", error);
        res.status(500).json({ message: "Failed to fetch metadata records. Please try again later." });
    }
};
