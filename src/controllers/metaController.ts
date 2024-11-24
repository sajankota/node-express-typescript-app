// src/controllers/metaController.ts

import got from "got"; // HTTP client
import metascraper from "metascraper";
import metascraperAudio from "metascraper-audio";
import metascraperAuthor from "metascraper-author";
import metascraperDate from "metascraper-date";
import metascraperDescription from "metascraper-description";
import metascraperFeed from "metascraper-feed";
import metascraperImage from "metascraper-image";
import metascraperIframe from "metascraper-iframe";
import metascraperLang from "metascraper-lang";
import metascraperLogo from "metascraper-logo";
import metascraperLogoFavicon from "metascraper-logo-favicon";
import metascraperMediaProvider from "metascraper-media-provider";
import metascraperPublisher from "metascraper-publisher";
import metascraperReadability from "metascraper-readability";
import metascraperTitle from "metascraper-title";
import metascraperUrl from "metascraper-url";
import metascraperVideo from "metascraper-video";
import metadataScraper from "metadata-scraper";
import puppeteer from "puppeteer";
import { Response } from "express";
import MetadataModel from "../models/MetadataModel";
import { ReportAnalysis } from "../models/AnalysisReportModel";
import { AuthRequest } from "../middleware/authMiddleware";

// Initialize metascraper plugins
const scraper = metascraper([
    metascraperAudio(),
    metascraperAuthor(),
    metascraperDate(),
    metascraperDescription(),
    metascraperFeed(),
    metascraperImage(),
    metascraperIframe(),
    metascraperLang(),
    metascraperLogo(),
    metascraperLogoFavicon(),
    metascraperMediaProvider(),
    metascraperPublisher(),
    metascraperReadability(),
    metascraperTitle(),
    metascraperUrl(),
    metascraperVideo(),
]);

// Common headers for requests to mimic browser behavior
const commonHeaders = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.google.com",
};

/**
 * Helper function to fetch metadata using metascraper
 */
async function getMetadataWithMetascraper(url: string) {
    const { body: html, url: finalUrl } = await got(url, { headers: commonHeaders });
    return await scraper({ html, url: finalUrl });
}

/**
 * Helper function to fetch metadata using metadata-scraper
 */
async function getMetadataWithMetadataScraper(url: string) {
    return await metadataScraper(url);
}

/**
 * Helper function to fetch metadata using Puppeteer
 */
async function getMetadataWithPuppeteer(url: string) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Add headers to the Puppeteer request
    await page.setExtraHTTPHeaders(commonHeaders);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const metadata = await page.evaluate(() => {
        const title = document.querySelector("title")?.innerText || "";
        const description = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
        const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute("content") || "";

        return {
            title,
            description,
            keywords,
        };
    });

    await browser.close();
    return metadata;
}

/**
 * Main function to fetch metadata using fallback mechanism
 */
async function fetchMetadata(url: string) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
    }

    try {
        console.log("[Debug] Trying metascraper...");
        return await getMetadataWithMetascraper(url);
    } catch (error) {
        console.warn("[Warning] Metascraper failed. Trying metadata-scraper...");
        try {
            return await getMetadataWithMetadataScraper(url);
        } catch (error) {
            console.warn("[Warning] Metadata-scraper failed. Trying Puppeteer...");
            return await getMetadataWithPuppeteer(url);
        }
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
        // Fetch metadata with fallback mechanism
        const metadata = await fetchMetadata(url);

        // Save metadata to the database
        const metadataRecord = await MetadataModel.create({
            userId,
            url,
            metadata,
        });

        console.log(`[Debug] Metadata saved with ID: ${metadataRecord._id}`);

        // Update or create a ReportAnalysis linked to this metadata
        const analysisReport = await ReportAnalysis.findOneAndUpdate(
            { userId, url },
            {
                $set: {
                    "analyses.metaData.status": "completed",
                    "analyses.metaData.metaDataId": metadataRecord._id,
                },
            },
            { new: true, upsert: true }
        );

        console.log(`[Debug] ReportAnalysis updated with metadata ID: ${metadataRecord._id}`);

        res.status(200).json({
            message: "Metadata fetched and saved successfully",
            metadata,
        });
    } catch (error) {
        console.error("[Error] Failed to fetch metadata:", error);

        // Update ReportAnalysis with failure status
        await ReportAnalysis.findOneAndUpdate(
            { userId, url },
            {
                $set: {
                    "analyses.metaData.status": "failed",
                    "analyses.metaData.error": error instanceof Error ? error.message : "Unknown error",
                },
            },
            { upsert: true }
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
