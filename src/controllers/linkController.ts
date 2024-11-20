// src/controllers/linkController.ts

import axios from "axios";
import * as cheerio from "cheerio";
import { Request, Response } from "express";
import LinkAnalysisModel from "../models/LinkAnalysisModel";

/**
 * Analyze links in the provided URL.
 */
export const analyzeLinksController = async (req: Request, res: Response): Promise<void> => {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
        res.status(400).json({ message: "A valid URL is required." });
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
        const linkAnalysisRecord = new LinkAnalysisModel({
            url,
            internalLinks,
            externalLinks,
        });

        await linkAnalysisRecord.save();

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
