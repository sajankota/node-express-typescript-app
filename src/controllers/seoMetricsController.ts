// src/controllers/seoMetricsController.ts

import { Request, Response } from "express";
import mongoose from "mongoose";
import { Report } from "../models/reportModel";

// List of all metrics to extract
const SEO_METRICS = [
    "is-crawlable",
    "document-title",
    "meta-description",
    "http-status-code",
    "link-text",
    "crawlable-anchors",
    "robots-txt",
    "image-alt",
    "hreflang",
    "canonical",
    "structured-data",
];

// Controller to fetch multiple SEO metrics by report ID
export const getSEOMetrics = async (req: Request, res: Response): Promise<void> => {
    const { reportId } = req.params;

    console.log(`[Debug] Fetching SEO metrics for reportId: ${reportId}`);

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

        // Initialize the response object for metrics
        const metrics: Record<string, any> = {};

        // Loop through all the metrics and dynamically extract them
        SEO_METRICS.forEach((metricId) => {
            const audit = mobileReport?.lighthouseResult?.audits?.[metricId];

            if (audit) {
                metrics[metricId] = {
                    id: metricId,
                    title: audit.title,
                    description: audit.description,
                    score: audit.score,
                };
            } else {
                // If the metric is not found, set it to `null`
                metrics[metricId] = null;
                console.warn(`[Warning] Metric ${metricId} not found for reportId: ${reportId}`);
            }
        });

        // Format the final response
        const responseData = {
            url: report.url,
            metrics,
            createdAt: report.createdAt,
        };

        console.log(`[Debug] Successfully fetched SEO metrics for reportId: ${reportId}`);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("[Get SEO Metrics Error]", error instanceof Error ? error.message : "Unknown error");
        res.status(500).json({ message: "Failed to fetch the SEO metrics." });
    }
};
