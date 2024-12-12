// src/controllers/getProcessedMetrics.ts

import { Request, Response } from "express";
import { Metrics } from "../models/MetricsModel";

export const getProcessedMetrics = async (req: Request, res: Response): Promise<void> => {
    const { userId, url } = req.query; // Filters passed via query parameters

    try {
        // Step 1: Validate input
        if (!userId || !url) {
            res.status(400).json({ message: "Missing userId or url in query parameters" });
            return;
        }

        console.log(`[Debug] Query Params: userId=${userId}, url=${url}`);

        // Step 2: Build and validate the query object
        const query = {
            userId: String(userId).trim(), // Ensure userId is a sanitized string
            url: String(url).trim(), // Ensure URL is a sanitized string
        };

        // Step 3: Use projection to limit the fields retrieved
        const projection = {
            metrics: 1, // Include only the "metrics" field
            url: 1, // Include the URL
            createdAt: 1, // Include the createdAt timestamp
            _id: 0, // Exclude the MongoDB ID (_id)
        };

        // Step 4: Execute the query and measure performance
        console.time("Query Execution Time"); // Start timing
        const processedMetrics = await Metrics.findOne(query, projection).lean(); // Use `lean()` for better performance
        console.timeEnd("Query Execution Time"); // End timing

        if (!processedMetrics) {
            res.status(404).json({ message: "No processed metrics found for the given criteria" });
            return;
        }

        // Step 5: Send the response
        res.status(200).json({
            message: "Processed metrics retrieved successfully",
            data: processedMetrics,
        });
    } catch (error) {
        console.error("[Get Processed Metrics] Error:", error);

        // Handle `error` type and return a meaningful message
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ message: "Error retrieving processed metrics", error: errorMessage });
    }
};
