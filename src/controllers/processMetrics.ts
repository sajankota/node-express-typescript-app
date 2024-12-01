// src/controllers/processMetrics.ts

import { Request, Response } from "express";
import { Content, IContent } from "../models/ContentModel";
import { Metrics } from "../models/MetricsModel";
import { calculateMetrics } from "../services/metricsService";
import { FilterQuery } from "mongoose";

export const processMetrics = async (req: Request, res: Response): Promise<void> => {
    const { userId, url } = req.body;

    try {
        // Step 1: Build the query
        const query: FilterQuery<IContent> = {};
        if (userId) query.userId = userId;
        if (url) query.url = url;

        const scrapedData = await Content.find(query);

        if (!scrapedData || scrapedData.length === 0) {
            res.status(404).json({ message: "No scraped data found for the given criteria" });
            return;
        }

        let processedCount = 0;

        // Step 2: Process each URL and calculate metrics
        for (const data of scrapedData) {
            // Convert Mongoose document to plain object
            const plainData = data.toObject();

            // Pass the plain object to the metrics calculation service
            const metrics = calculateMetrics(plainData);

            // Step 3: Save the processed metrics to the new collection
            await Metrics.create({
                userId: plainData.userId,
                url: plainData.url,
                metrics,
                createdAt: new Date(),
            });

            processedCount++;
        }

        // Step 4: Send response
        res.status(200).json({
            message: "Metrics processed successfully",
            processedCount,
        });
    } catch (error) {
        console.error("[Process Metrics] Error:", error);

        // Handle error type properly
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ message: "Error processing metrics", error: errorMessage });
    }
};
