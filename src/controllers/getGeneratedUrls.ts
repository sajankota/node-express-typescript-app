// src/controllers/getGeneratedUrls.ts

import { Request, Response } from "express";
import { Metrics } from "../models/MetricsModel"; // Import Metrics model
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

        // Step 1: Query the database for metrics
        const metrics = await Metrics.find(
            { userId }, // Match by userId
            { url: 1, createdAt: 1, _id: 1 } // Only fetch `url`, `createdAt`, and `_id` (reportId)
        ).sort({ createdAt: -1 }); // Sort by newest first

        if (!metrics || metrics.length === 0) {
            res.status(404).json({ message: "No URLs found for the given userId" });
            return;
        }

        // Step 2: Transform data for the response
        const transformedData = metrics.map((metric) => ({
            url: metric.url,
            reportId: metric._id, // Use `_id` as the `reportId`
            generatedAt: metric.createdAt,
        }));

        // Step 3: Paginate the response
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const startIndex = (page - 1) * limit;
        const paginatedData = transformedData.slice(startIndex, startIndex + limit);

        // Step 4: Send the response
        res.status(200).json({
            message: "URLs retrieved successfully",
            data: paginatedData,
            total: transformedData.length,
            page,
            limit,
        });
    } catch (error) {
        console.error("[Get Generated URLs] Error:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ message: "Error retrieving URLs", error: errorMessage });
    }
};
