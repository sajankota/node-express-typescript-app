// src/controllers/contentController.ts

import { Request, Response } from "express";
import { fetchWithAxios, fetchWithPuppeteer, processContent, saveContentToDB } from "../services/contentService";

export const getContent = async (req: Request, res: Response): Promise<void> => {
    console.log("[Debug] Request Body:", req.body); // Debug log for request body

    const { url, userId } = req.body; // Extract URL and userId from the request body

    // Check for missing or invalid URL or userId
    if (!url || typeof url !== "string" || !userId || typeof userId !== "string") {
        res.status(400).json({ error: "Invalid or missing 'url' or 'userId' in request body" });
        return;
    }

    try {
        let htmlContent: string;

        // Step 1: Fetch content
        try {
            htmlContent = await fetchWithAxios(url);
        } catch (axiosError) {
            console.log("[Axios] Failed. Switching to Puppeteer...");
            htmlContent = await fetchWithPuppeteer(url);
        }

        // Step 2: Process HTML content
        const { metadata, textContent, favicon } = processContent(htmlContent, url);

        const finalTextContent = textContent?.trim() || "No content found";
        const dynamic = htmlContent.includes("<script>"); // Check for dynamic content

        // Step 3: Save scraped content to the database (this triggers worker processing)
        await saveContentToDB({
            userId, // Include userId
            url,
            metadata,
            textContent: finalTextContent,
            favicon,
            dynamic,
            htmlContent, // Save the full HTML
        });

        console.log(`[Content] Scraping data saved for URL: ${url}`);

        // Step 4: Respond to the client
        res.status(200).json({
            message: "Content scraped and metrics processing triggered successfully.",
            data: { url, metadata, textContent: finalTextContent, favicon, dynamic },
        });
    } catch (error) {
        console.error("[Get Content] Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({ error: "Failed to fetch content", details: errorMessage });
    }
};
