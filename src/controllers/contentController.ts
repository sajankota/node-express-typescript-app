// src/controllers/contentController.ts

import { Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio"; // Updated import

/**
 * Controller to fetch and extract content & metadata from a URL
 */
export const getContent = async (req: Request, res: Response): Promise<void> => {
    const { url } = req.query;

    if (!url || typeof url !== "string") {
        res.status(400).json({ error: "Invalid or missing 'url' query parameter" });
        return;
    }

    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        if (!response.headers['content-type']?.includes("text/html")) {
            throw new Error("The provided URL did not return an HTML response.");
        }

        const htmlContent = response.data;
        const $ = cheerio.load(htmlContent);

        // Extract metadata
        const metadata = {
            title: $("title").text() || null,
            description: $('meta[name="description"]').attr("content") || null,
            keywords: $('meta[name="keywords"]').attr("content") || null,
            ogTitle: $('meta[property="og:title"]').attr("content") || null,
            ogDescription: $('meta[property="og:description"]').attr("content") || null,
            ogImage: $('meta[property="og:image"]').attr("content") || null,
        };

        // Extract text content
        const textContent = $("body").text().trim();

        // Check for favicon
        let favicon = $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href") || null;

        // Resolve relative favicon URLs to absolute URLs
        if (favicon && !favicon.startsWith("http") && !favicon.startsWith("//")) {
            const urlObj = new URL(url);
            favicon = new URL(favicon, urlObj.origin).href;
        }

        res.status(200).json({
            url,
            metadata,
            favicon, // Add favicon to the response
            textContent,
        });
    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error("Axios Error Details:", {
                message: error.message,
                responseData: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers,
            });

            if (error.response?.status === 503) {
                res.status(503).json({
                    error: "Service Unavailable",
                    details: "The requested website is temporarily unavailable (503).",
                });
                return;
            }
        }

        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

        res.status(500).json({
            error: "Failed to fetch content from the provided URL",
            details: errorMessage,
        });
    }
};
