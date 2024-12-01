// src/controllers/getProcessedMetrics.ts

import { Request, Response } from "express";
import { Metrics } from "../models/MetricsModel";

export const getProcessedMetrics = async (req: Request, res: Response): Promise<void> => {
    const { userId, url } = req.query; // Filters passed via query parameters

    try {
        // Step 1: Build the query object
        const query: any = {};
        if (userId) query.userId = userId;
        if (url) query.url = url;

        // Step 2: Query the Metrics collection
        const processedMetrics = await Metrics.find(query);

        if (!processedMetrics || processedMetrics.length === 0) {
            res.status(404).json({ message: "No processed metrics found for the given criteria" });
            return;
        }

        // Step 3: Send the response
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
