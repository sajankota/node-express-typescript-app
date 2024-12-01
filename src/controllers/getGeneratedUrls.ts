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

        // Step 1: Extract pagination parameters from the query
        const page = parseInt(req.query.page as string) || 1; // Default to page 1
        const limit = parseInt(req.query.limit as string) || 10; // Default to 10 results per page
        const skip = (page - 1) * limit; // Calculate the number of documents to skip

        console.log("[Debug] Pagination parameters:", { page, limit, skip });

        // Step 2: Query the database with pagination
        const urlsWithTimestamps = await Metrics.aggregate([
            { $match: { userId } }, // Match documents by userId
            {
                $group: {
                    _id: "$url", // Group by URL to get distinct URLs
                    createdAt: { $first: "$createdAt" }, // Get the earliest timestamp for each URL
                },
            },
            { $sort: { createdAt: -1 } }, // Sort by creation date (most recent first)
            { $skip: skip }, // Skip the first (page-1)*limit documents
            { $limit: limit }, // Limit the number of documents returned
        ]);

        // Step 3: Get the total count of distinct URLs
        const totalUrls = await Metrics.distinct("url", { userId });

        if (!urlsWithTimestamps || urlsWithTimestamps.length === 0) {
            res.status(404).json({ message: "No URLs found for the given userId" });
            return;
        }

        // Step 4: Send the response
        res.status(200).json({
            message: "URLs retrieved successfully",
            data: urlsWithTimestamps.map((item) => ({
                url: item._id, // Grouped URL
                generatedAt: item.createdAt, // Timestamp for the URL
            })),
            total: totalUrls.length, // Total number of distinct URLs
            page,
            limit,
        });
    } catch (error) {
        console.error("[Get Generated URLs] Error:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ message: "Error retrieving URLs", error: errorMessage });
    }
};
