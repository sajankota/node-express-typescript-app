// src/controllers/accessibilityMetricsController.ts

import { Request, Response } from "express";
import mongoose from "mongoose";
import { Report } from "../models/reportModel";
import { accessibilityMetricsConstants } from "../constants/accessibilityMetricsConstants"; // Import Accessibility metrics constants

// Helper function to process Accessibility metrics
const processAccessibilityMetrics = (reportData: any, reportId: string) => {
    return accessibilityMetricsConstants.map((metric) => {
        const audit = reportData?.lighthouseResult?.audits?.[metric.id];

        if (audit) {
            return {
                id: metric.id,
                name: metric.name,
                tooltip: metric.tooltip, // Include the tooltip from the constants
                feedback:
                    audit.score === 1
                        ? metric.positiveText
                        : metric.negativeText, // Use positiveText if score is 1, otherwise negativeText
                score: audit.score ?? null, // Use the score from the database or set to `null`
            };
        } else {
            console.warn(`[Warning] Metric ${metric.id} not found for reportId: ${reportId}`);
            return {
                id: metric.id,
                name: metric.name,
                tooltip: metric.tooltip, // Include the tooltip even if data is not available
                feedback: "Metric data is not available.",
                score: null,
            };
        }
    });
};

// Controller to fetch mobile Accessibility metrics by report ID
export const getMobileAccessibilityMetrics = async (req: Request, res: Response): Promise<void> => {
    const { reportId } = req.params;

    console.log(`[Debug] Fetching Mobile Accessibility metrics for reportId: ${reportId}`);

    // Validate if the `reportId` is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
        console.error(`[Error] Invalid reportId format: ${reportId}`);
        res.status(400).json({ message: "Invalid report ID format." });
        return;
    }

    try {
        // Query the `reports` collection for the specified `reportId`
        const report = await Report.findById(reportId).select("url mobileReport createdAt");

        // Check if the report exists
        if (!report) {
            console.warn(`[Warning] Report not found for reportId: ${reportId}`);
            res.status(404).json({ message: "Report not found." });
            return;
        }

        // Cast `mobileReport` to `any` to avoid TypeScript errors
        const mobileReport: any = report.mobileReport;

        // Process the metrics
        const metrics = processAccessibilityMetrics(mobileReport, reportId);

        // Format the final response
        const responseData = {
            url: report.url,
            metrics,
            createdAt: report.createdAt,
        };

        console.log(`[Debug] Successfully fetched Mobile Accessibility metrics for reportId: ${reportId}`);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("[Get Mobile Accessibility Metrics Error]", error instanceof Error ? error.message : "Unknown error");
        res.status(500).json({ message: "Failed to fetch the Mobile Accessibility metrics." });
    }
};

// Controller to fetch desktop Accessibility metrics by report ID
export const getDesktopAccessibilityMetrics = async (req: Request, res: Response): Promise<void> => {
    const { reportId } = req.params;

    console.log(`[Debug] Fetching Desktop Accessibility metrics for reportId: ${reportId}`);

    // Validate if the `reportId` is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(reportId)) {
        console.error(`[Error] Invalid reportId format: ${reportId}`);
        res.status(400).json({ message: "Invalid report ID format." });
        return;
    }

    try {
        // Query the `reports` collection for the specified `reportId`
        const report = await Report.findById(reportId).select("url desktopReport createdAt");

        // Check if the report exists
        if (!report) {
            console.warn(`[Warning] Report not found for reportId: ${reportId}`);
            res.status(404).json({ message: "Report not found." });
            return;
        }

        // Cast `desktopReport` to `any` to avoid TypeScript errors
        const desktopReport: any = report.desktopReport;

        // Process the metrics
        const metrics = processAccessibilityMetrics(desktopReport, reportId);

        // Format the final response
        const responseData = {
            url: report.url,
            metrics,
            createdAt: report.createdAt,
        };

        console.log(`[Debug] Successfully fetched Desktop Accessibility metrics for reportId: ${reportId}`);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("[Get Desktop Accessibility Metrics Error]", error instanceof Error ? error.message : "Unknown error");
        res.status(500).json({ message: "Failed to fetch the Desktop Accessibility metrics." });
    }
};
