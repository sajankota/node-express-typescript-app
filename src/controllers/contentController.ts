// src/controllers/contentController.ts

import { Request, Response } from "express";
import {
    fetchWithAxios,
    fetchWithPuppeteer,
    processContent,
    saveContentToDB,
} from "../services/contentService";
import { AuthRequest } from "../middleware/authMiddleware"; // Import the extended AuthRequest interface

export const getContent = async (req: AuthRequest, res: Response): Promise<void> => {
    const { url } = req.body;

    // Ensure userId is present, otherwise throw an error
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized: userId is missing." });
        return;
    }

    if (!url || typeof url !== "string") {
        res.status(400).json({ error: "Invalid or missing 'url' in request body" });
        return;
    }

    try {
        let htmlContent: string;

        // Step 1: Attempt to fetch content with Axios
        try {
            htmlContent = await fetchWithAxios(url);
        } catch (axiosError) {
            console.log("[Axios] Failed. Switching to Puppeteer...");
            htmlContent = await fetchWithPuppeteer(url);
        }

        // Step 2: Process the HTML content
        const { metadata, textContent, favicon } = processContent(htmlContent, url);

        const finalTextContent = textContent?.trim() || "No content found";

        if (!finalTextContent || finalTextContent === "No content found") {
            console.warn(`[Warning] No meaningful content found for URL: ${url}.`);
        }

        // Step 3: Save to the database (with userId and optional full HTML)
        const dynamic = htmlContent.includes("<script>");
        await saveContentToDB({
            userId, // Save userId
            url,
            metadata,
            textContent: finalTextContent,
            favicon,
            dynamic,
            htmlContent, // Save full HTML
        });

        // Step 4: Send response back to the client
        res.status(200).json({
            message: "Content fetched and saved successfully.",
            data: {
                userId, // Include userId in the response
                url,
                metadata,
                textContent: finalTextContent,
                favicon,
                dynamic,
                htmlContent, // Include full HTML in the response
            },
        });
    } catch (error) {
        console.error("Error while fetching content:", error);

        const errorMessage =
            error instanceof Error ? error.message : "An unknown error occurred";

        res.status(500).json({
            error: "Failed to fetch content from the provided URL",
            details: errorMessage,
        });
    }
};

