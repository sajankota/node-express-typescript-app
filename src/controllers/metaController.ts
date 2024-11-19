// src/controllers/metaController.ts

import * as cheerio from "cheerio";
import { Request, Response } from "express";
import MetadataModel from "../models/MetaDataModel"; // Import the Metadata model
import { AuthRequest } from "../middleware/authMiddleware"; // Use the extended request type for user info

/**
 * Helper function to fetch metadata using Cheerio
 * @param url - URL to scrape metadata from
 * @returns Metadata object
 */
export async function getMetadata(url: string) {
    // Ensure the URL starts with http:// or https://
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
    }

    try {
        console.log(`[Debug] Fetching URL: ${url}`);

        // Fetch the HTML content of the URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log(`[Debug] Successfully fetched HTML from: ${url}`);

        const html = await response.text();

        // Load the HTML content into Cheerio
        const $ = cheerio.load(html);
        console.log(`[Debug] Loaded HTML into Cheerio for: ${url}`);

        // Extract metadata
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
            language: $("html").attr("lang") || "", // Extract language attribute
            author: $('meta[name="author"]').attr("content") || "", // Extract author
            viewport: $('meta[name="viewport"]').attr("content") || "", // Extract viewport
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
            custom: {} as Record<string, string>, // Explicit type to allow dynamic indexing
        };

        // Extract all custom meta tags
        $('meta').each((_, el) => {
            const name = $(el).attr("name") || $(el).attr("property");
            const content = $(el).attr("content");
            if (name && content) {
                metadata.custom[name] = content; // Dynamically add to the custom object
            }
        });

        console.log(`[Debug] Extracted metadata:`, metadata);
        return metadata;
    } catch (error) {
        console.error("[Error] Error fetching metadata:", error);
        return {
            title: "",
            description: "",
            keywords: "",
            favicon: "",
            language: "",
            author: "",
            viewport: "",
            og: {
                title: "",
                description: "",
                image: "",
                url: "",
                type: "",
                site_name: "",
            },
            twitter: {
                title: "",
                description: "",
                image: "",
                card: "",
            },
            custom: {},
        };
    }
}

/**
 * API Endpoint: Extract meta tags for a given URL and save it to the database
 * @param req - Express request object
 * @param res - Express response object
 */
export const getMetaTags = async (req: AuthRequest, res: Response): Promise<void> => {
    const { url } = req.body;

    console.log(`[Debug] Received request to scrape metadata for: ${url}`);

    // Validate the input
    if (!url || typeof url !== "string") {
        console.error("[Error] Invalid URL received.");
        res.status(400).json({ message: "A valid URL is required." });
        return;
    }

    try {
        // Fetch metadata
        const metadata = await getMetadata(url);

        // Save metadata to the database with user info
        if (req.user?.userId) {
            const metadataRecord = new MetadataModel({
                userId: req.user.userId,
                url,
                metadata,
            });

            await metadataRecord.save(); // Save the metadata in the database
            console.log(`[Debug] Metadata saved to the database for user: ${req.user.userId}`);
        } else {
            console.warn("[Warning] No user ID found in the request.");
        }

        // Send the response
        res.status(200).json({
            message: "Metadata fetched and saved successfully",
            metadata,
        });
    } catch (error) {
        console.error("[Error] Failed to fetch metadata.");
        if (error instanceof Error) {
            console.error(`[Error Details]: ${error.message}`);
        }
        res.status(500).json({
            message: "Failed to fetch metadata. The website might be blocking requests or taking too long to load.",
        });
    }
};

/**
 * API Endpoint: Fetch all meta-tags saved in the database for the logged-in user
 * @param req - Express request object (with user info from Auth middleware)
 * @param res - Express response object
 */
export const getUserMetaTags = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId; // Extract userId from the authenticated request
    const { page = 1, limit = 10 } = req.query; // Optional pagination query params

    console.log(`[Debug] Received request to fetch meta-tags for user: ${userId}`);

    // Validate if the user is authenticated
    if (!userId) {
        console.error("[Error] No user ID found in the request.");
        res.status(401).json({ message: "Unauthorized. Please log in to access this resource." });
        return;
    }

    try {
        // Pagination setup
        const pageNumber = parseInt(page as string, 10) || 1; // Default to page 1
        const pageSize = parseInt(limit as string, 10) || 10; // Default to 10 items per page
        const skip = (pageNumber - 1) * pageSize; // Calculate how many records to skip

        // Query the database for metadata records belonging to the user
        const metadataRecords = await MetadataModel.find({ userId })
            .skip(skip) // Skip records for pagination
            .limit(pageSize) // Limit the number of records returned
            .sort({ createdAt: -1 }); // Sort by newest first

        // Count total records for the user
        const totalRecords = await MetadataModel.countDocuments({ userId });

        console.log(`[Debug] Found ${metadataRecords.length} records for user: ${userId}`);

        // Send the response with pagination details
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
        console.error("[Error] Failed to fetch metadata records.", error);
        res.status(500).json({
            message: "Failed to fetch metadata records. Please try again later.",
        });
    }
};

