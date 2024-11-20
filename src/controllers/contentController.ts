// src/controllers/contentController.ts

import { Request, Response } from "express";
import { scrapeContent } from "../services/scraper";
import ContentModel from "../models/ContentModel";

export const getContent = async (req: Request, res: Response): Promise<void> => {
    const { url } = req.body;

    if (!url || typeof url !== "string") {
        res.status(400).json({ message: "A valid URL is required." });
        return;
    }

    try {
        const { tags, counts, analysis, content } = await scrapeContent(url);

        // Save to the database
        const contentRecord = new ContentModel({ url, tags, counts, analysis, content });
        await contentRecord.save();

        // Response
        res.status(200).json({
            message: "Content extracted successfully",
            data: { tags, counts, analysis, content },
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to scrape and analyze content." });
    }
};
