// src/controllers/getGeneratedUrls.ts

import { Request, Response } from "express";
import { Metrics } from "../models/MetricsModel"; // Import Metrics model

export const getGeneratedUrls = async (req: Request, res: Response): Promise<void> => {
    const { userId } = req.body; // Extract userId from the request body
    const { page = 1, limit = 10 } = req.body; // Extract pagination parameters from the body

    try {
        // Step 1: Ensure userId is provided
        if (!userId) {
            res.status(400).json({ message: "Missing userId in request body" });
            return;
        }

        // Step 2: Build the query object
        const query = { userId }; // Query only by userId

        // Step 3: Fetch distinct URLs for the given userId
        const allUrls = await Metrics.distinct("url", query); // Get all distinct URLs matching the userId

        if (!allUrls || allUrls.length === 0) {
            res.status(404).json({ message: "No URLs found for the given userId" });
            return;
        }

        // Step 4: Apply pagination manually to the distinct URLs
        const totalUrls = allUrls.length;
        const startIndex = (Number(page) - 1) * Number(limit);
        const paginatedUrls = allUrls.slice(startIndex, startIndex + Number(limit));

        // Step 5: Send the response
        res.status(200).json({
            message: "URLs retrieved successfully",
            data: paginatedUrls,
            total: totalUrls,
            page: Number(page),
            limit: Number(limit),
        });
    } catch (error) {
        console.error("[Get Generated URLs] Error:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ message: "Error retrieving URLs", error: errorMessage });
    }
};
