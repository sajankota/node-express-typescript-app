// src/controllers/getGeneratedUrls.ts

import { Request, Response } from "express";
import { Metrics } from "../models/MetricsModel";
import { AuthRequest } from "../middleware/authMiddleware";

export const getGeneratedUrls = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(400).json({ message: "Missing userId in request" });
            return;
        }

        console.log("[Debug] UserID from authMiddleware:", userId);

        // Parse and validate pagination parameters
        const page = Math.max(Number(req.query.page) || 1, 1); // Ensure page is at least 1
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100); // Limit between 1 and 100
        const skip = (page - 1) * limit;

        console.log("[Debug] Pagination parameters: page =", page, ", limit =", limit);

        // Query the database for metrics with pagination
        const [metrics, total] = await Promise.all([
            Metrics.find(
                { userId }, // Match by userId
                {
                    url: 1,
                    createdAt: 1,
                    _id: 1,
                    status: 1,
                    "metrics.seo.title": 1,
                    "metrics.seo.faviconUrl": 1, // Correct field name
                }
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

        // Transform data for the response
        const transformedData = metrics.map((metric) => ({
            url: metric.url,
            reportId: metric._id.toString(),
            status: metric.status, // Include the status field here
            generatedAt: metric.createdAt,
            seoTitle: metric.metrics?.seo?.title || "No Title",
            favicon: metric.metrics?.seo?.faviconUrl || null, // Correct field name
        }));

        console.log("[Debug] Transformed Data:", transformedData);

        // Emit WebSocket event for real-time updates
        const io = req.app.get("io"); // Get the WebSocket server instance
        if (io) {
            const latestMetric = transformedData[0]; // Send only the latest project
            io.to(userId).emit("project_update", latestMetric);
            console.log(`[Debug] project_update event emitted for userId: ${userId}`, latestMetric);

            // Emit a simple message
            const simpleMessage = `New project added: ${latestMetric.url}`;
            io.to(userId).emit("simple_message", simpleMessage);
            console.log(`[Debug] simple_message event emitted for userId: ${userId}`, simpleMessage);
        } else {
            console.warn("[Warning] WebSocket server not found in app.");
        }

        // Send the response
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
