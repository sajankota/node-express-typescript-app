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

        // Step 2: Build the query object
        const query = {
            userId: String(userId), // Ensure userId is a string
            url: String(url), // Ensure URL is a string
        };

        // Step 3: Query the Metrics collection with projection to reduce response size
        const processedMetrics = await Metrics.findOne(query, {
            metrics: 1, // Include only the "metrics" field
            url: 1, // Include the URL
            createdAt: 1, // Include the createdAt timestamp
            _id: 0, // Exclude the MongoDB ID (_id)
        });

        if (!processedMetrics) {
            res.status(404).json({ message: "No processed metrics found for the given criteria" });
            return;
        }

        // Step 4: Send the response
        res.status(200).json({
            message: "Processed metrics retrieved successfully",
            data: processedMetrics,
        });
    } catch (error) {
        console.error("[Get Processed Metrics] Error:", error);

        // Properly handle `error` type
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ message: "Error retrieving processed metrics", error: errorMessage });
    }
};
