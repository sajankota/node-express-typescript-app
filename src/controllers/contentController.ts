// src/controllers/contentController.ts

import { Request, Response } from "express";
import { io } from "../index";
import { fetchWithAxios, fetchWithPuppeteer, processContent, saveContentToDB } from "../services/contentService";
import { Metrics } from "../models/MetricsModel";

export const getContent = async (req: Request, res: Response): Promise<void> => {
    const { url, userId } = req.body;

    if (!url || !userId) {
        res.status(400).json({ error: "Missing 'url' or 'userId' in request body" });
        return;
    }

    try {
        // Step 1: Fetch the raw HTML content
        let htmlContent: string;
        try {
            htmlContent = await fetchWithAxios(url);
        } catch {
            htmlContent = await fetchWithPuppeteer(url);
        }

        // Step 2: Process the raw HTML content
        const { metadata, textContent, favicon } = processContent(htmlContent, url);

        // Step 3: Save the processed data into the contentModel database
        const savedContent = await saveContentToDB({
            userId,
            url,
            metadata,
            textContent,
            favicon,
            dynamic: htmlContent.includes("<script>"),
            htmlContent,
        }, io);

        // Step 4: Update or create an entry in the metricModel database
        let metricsEntry = await Metrics.findOne({ userId, url });
        if (!metricsEntry) {
            metricsEntry = await Metrics.create({
                userId,
                url,
                status: "processing", // Initial status
                metrics: {}, // Default values for metrics
            });
        } else {
            metricsEntry.status = "processing";
            metricsEntry.createdAt = new Date();
            await metricsEntry.save();
        }

        // Step 5: Emit WebSocket event for real-time updates
        io.to(userId).emit("project_update", {
            url: metricsEntry.url,
            reportId: metricsEntry._id,
            status: metricsEntry.status,
            metadata: savedContent.metadata,
            favicon,
            generatedAt: metricsEntry.createdAt,
        });

        // Step 6: Send a success response
        res.status(200).json({
            message: "Processing started.",
            reportId: metricsEntry._id,
            favicon,
        });
    } catch (error) {
        console.error("[Get Content] Error:", error);

        const errorMessage = error instanceof Error ? error.message : "Failed to generate report.";
        res.status(500).json({ error: errorMessage });
    }
};
