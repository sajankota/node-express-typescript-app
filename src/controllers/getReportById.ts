// src/controllers/getReportById.ts

import { Request, Response } from "express";
import { Metrics } from "../models/MetricsModel";

export const getReportById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { reportId } = req.params;

        if (!reportId) {
            console.error("[Error] Missing reportId in request parameters");
            res.status(400).json({ message: "Missing reportId in request parameters" });
            return;
        }

        console.log("[Debug] Fetching processed metric report with ID:", reportId);

        // Query the Metrics collection for the specific report using `lean` for better performance
        const report = await Metrics.findById(reportId)
            .lean() // Use lean() to return a plain JavaScript object, avoiding Mongoose overhead
            .exec(); // Ensures the query is executed immediately

        if (!report) {
            console.error(`[Error] No report found with ID: ${reportId}`);
            res.status(404).json({ message: "Report not found" });
            return;
        }

        // Send the formatted response
        res.status(200).json({
            message: "Report retrieved successfully",
            data: {
                userId: report.userId,
                url: report.url,
                metrics: report.metrics,
                screenshotPath: report.screenshotPath,
                createdAt: report.createdAt,
            },
        });
    } catch (error) {
        console.error("[Get Report By ID] Error:", error);

        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ message: "Error retrieving report", error: errorMessage });
    }
};
