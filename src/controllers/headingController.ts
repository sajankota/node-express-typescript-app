// src/controllers/headingController.ts

import axios from "axios";
import * as cheerio from "cheerio";
import { Request, Response } from "express";
import HeadingModel from "../models/HeadingModel";
import { AuthRequest } from "../middleware/authMiddleware";

/**
 * Extract all heading tags (h1 to h6) and analyze their structure from a given URL.
 * @param url - The URL to scrape.
 * @returns An object containing heading details: counts, hierarchy, and SEO warnings.
 */
export async function extractHeadings(url: string) {
    // Ensure the URL starts with http:// or https://
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = `https://${url}`;
    }

    try {
        console.log(`[Debug] Fetching URL: ${url}`);

        // Fetch the HTML content of the URL
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        console.log(`[Debug] Successfully fetched HTML content from: ${url}`);

        // Load the HTML into Cheerio
        const $ = cheerio.load(response.data);
        console.log(`[Debug] Successfully loaded HTML into Cheerio`);

        // Initialize data structures
        const headings: { tag: string; text: string; id?: string; class?: string }[] = []; // Sequence of headings
        const counts: Record<string, number> = { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 }; // Count of each heading tag
        const hierarchy: { tag: string; text: string; level: number; parent?: string }[] = []; // Heading hierarchy

        let lastHeadingLevel = 0;

        // Extract heading tags
        $("h1, h2, h3, h4, h5, h6").each((_, element) => {
            const tagName = $(element).prop("tagName"); // Safely get tagName
            if (tagName) {
                const tag = tagName.toLowerCase(); // Convert to lowercase
                const text = $(element).text().trim(); // Get text content and trim it
                const id = $(element).attr("id"); // Get id attribute
                const className = $(element).attr("class"); // Get class attribute

                // Update the counts
                counts[tag] = (counts[tag] || 0) + 1;

                // Determine the level of the current heading
                const currentLevel = parseInt(tag.replace("h", ""), 10);

                // Add to hierarchy
                const parent =
                    currentLevel > lastHeadingLevel
                        ? hierarchy[hierarchy.length - 1]?.text // Set parent as the previous heading if deeper level
                        : undefined;

                hierarchy.push({
                    tag,
                    text,
                    level: currentLevel,
                    parent,
                });

                // Add to the sequence
                headings.push({ tag, text, id, class: className });

                // Update last heading level
                lastHeadingLevel = currentLevel;
            } else {
                console.warn(`[Warning] Element with no valid tagName encountered.`);
            }
        });

        console.log(`[Debug] Extracted headings:`, headings);
        console.log(`[Debug] Counts of headings:`, counts);
        console.log(`[Debug] Hierarchy:`, hierarchy);

        return { headings, counts, hierarchy };
    } catch (error) {
        console.error(`[Error] Failed to fetch or process the URL: ${url}`, error);
        throw new Error(
            "Failed to extract heading tags. The website might be blocking requests or taking too long to load."
        );
    }
}

/**
 * API Endpoint: Extract heading tags for a given URL and save them to the database
 * @param req - Express request object
 * @param res - Express response object
 */
export const getHeadings = async (req: AuthRequest, res: Response): Promise<void> => {
    const { url } = req.body;

    console.log(`[Debug] Received request to extract headings for URL: ${url}`);

    // Validate the input
    if (!url || typeof url !== "string") {
        console.error("[Error] Invalid URL received.");
        res.status(400).json({ message: "A valid URL is required." });
        return;
    }

    try {
        // Extract headings
        const { headings, counts, hierarchy } = await extractHeadings(url);

        // Save the extracted headings to the database
        if (req.user?.userId) {
            const headingRecord = new HeadingModel({
                userId: req.user.userId, // Get userId from the auth middleware
                url,
                headings,
                counts,
                hierarchy,
            });

            await headingRecord.save(); // Save the record to the database
            console.log(`[Debug] Heading details saved to the database for user: ${req.user.userId}`);
        } else {
            console.warn("[Warning] No user ID found in the request.");
        }

        // Send the response
        res.status(200).json({
            message: "Headings extracted successfully",
            headings,
            counts,
            hierarchy,
        });
    } catch (error) {
        console.error("[Error] Failed to extract headings.");
        if (error instanceof Error) {
            console.error(`[Error Details]: ${error.message}`);
        }
        res.status(500).json({
            message:
                "Failed to extract headings. The website might be blocking requests or taking too long to load.",
        });
    }
};
