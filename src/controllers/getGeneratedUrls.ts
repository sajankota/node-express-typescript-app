// src/controllers/getGeneratedUrls.ts

import { Request, Response } from "express";
import { Metrics } from "../models/MetricsModel";
import { AuthRequest } from "../middleware/authMiddleware"; // Import AuthRequest type

export const getGeneratedUrls = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        // Extract userId from authMiddleware
        const userId = req.user?.userId;

        if (!userId) {
            res.status(400).json({ message: "Missing userId in request" });
            return;
        }

        console.log("[Debug] UserID from authMiddleware:", userId);

        // Step 1: Parse and validate pagination parameters
        const page = Math.max(Number(req.query.page) || 1, 1); // Ensure page is at least 1
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100); // Limit between 1 and 100
        const skip = (page - 1) * limit;

        console.log("[Debug] Pagination parameters: page =", page, ", limit =", limit);

        // Step 2: Query the database for metrics with pagination
        const [metrics, total] = await Promise.all([
            Metrics.find(
                { userId }, // Match by userId
                { url: 1, createdAt: 1, _id: 1 } // Only fetch `url`, `createdAt`, and `_id` (reportId)
            )
                .sort({ createdAt: -1 }) // Sort by newest first
                .skip(skip) // Skip the appropriate number of records
                .limit(limit) // Limit to the requested number of records
                .lean(), // Use lean() for better performance
            Metrics.countDocuments({ userId }), // Get the total number of documents
        ]);

        if (!metrics.length) {
            res.status(404).json({ message: "No URLs found for the given userId" });
            return;
        }

        console.log(`[Debug] Retrieved ${metrics.length} metrics for userId: ${userId}`);

        // Step 3: Transform data for the response
        const transformedData = metrics.map((metric) => ({
            url: metric.url,
            reportId: metric._id, // Use `_id` as the `reportId`
            generatedAt: metric.createdAt,
        }));

        // Step 4: Send the response
        res.status(200).json({
            message: "URLs retrieved successfully",
            data: transformedData,
            total,
            page,
            limit,
        });
    } catch (error) {
        console.error("[Get Generated URLs] Error:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ message: "Error retrieving URLs", error: errorMessage });
    }
};
