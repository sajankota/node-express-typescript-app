// src/controllers/performanceMetricsController.ts

import { Request, Response } from "express";
import mongoose from "mongoose";
import { Report } from "../models/reportModel";
import { performanceMetricsConstants } from "../constants/performanceMetricsConstants";

// Helper function to process performance metrics
const processPerformanceMetrics = (reportData: any, reportId: string) => {
    return performanceMetricsConstants.map((metric) => {
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

// Controller to fetch mobile performance metrics by report ID
export const getMobilePerformanceMetrics = async (req: Request, res: Response): Promise<void> => {
    const { reportId } = req.params;

    console.log(`[Debug] Fetching Mobile Performance metrics for reportId: ${reportId}`);

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
        const metrics = processPerformanceMetrics(mobileReport, reportId);

        // Format the final response
        const responseData = {
            url: report.url,
            metrics,
            createdAt: report.createdAt,
        };

        console.log(`[Debug] Successfully fetched Mobile Performance metrics for reportId: ${reportId}`);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("[Get Mobile Performance Metrics Error]", error instanceof Error ? error.message : "Unknown error");
        res.status(500).json({ message: "Failed to fetch the Mobile Performance metrics." });
    }
};

// Controller to fetch desktop performance metrics by report ID
export const getDesktopPerformanceMetrics = async (req: Request, res: Response): Promise<void> => {
    const { reportId } = req.params;

    console.log(`[Debug] Fetching Desktop Performance metrics for reportId: ${reportId}`);

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
        const metrics = processPerformanceMetrics(desktopReport, reportId);

        // Format the final response
        const responseData = {
            url: report.url,
            metrics,
            createdAt: report.createdAt,
        };

        console.log(`[Debug] Successfully fetched Desktop Performance metrics for reportId: ${reportId}`);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("[Get Desktop Performance Metrics Error]", error instanceof Error ? error.message : "Unknown error");
        res.status(500).json({ message: "Failed to fetch the Desktop Performance metrics." });
    }
};
