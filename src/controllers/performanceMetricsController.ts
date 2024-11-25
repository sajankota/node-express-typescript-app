// src/controllers/performanceMetricsController.ts



import { Request, Response } from "express";
import mongoose from "mongoose";
import { Report } from "../models/reportModel";
import { performanceMetricsConstants } from "../constants/performanceMetricsConstants";

// Helper function to process SEO metrics
const processPerformanceMetrics = (reportData: any, reportId: string) => {
    const failedMetrics: any[] = [];
    const passedMetrics: any[] = [];
    const manualCheckMetrics: any[] = [];

    performanceMetricsConstants.forEach((metric) => {
        const audit = reportData?.lighthouseResult?.audits?.[metric.id];

        if (audit) {
            // Include all fields from the audit while filtering for required ones
            const metricData = {
                id: metric.id,
                name: metric.name,
                tooltip: metric.tooltip,
                feedback:
                    audit.score === 1
                        ? metric.positiveText
                        : metric.negativeText,
                score: audit.score ?? null,
                priority: metric.priority,
                displayValue: audit.displayValue || null, // Include additional fields as needed
                description: audit.description || null,
                numericValue: audit.numericValue || null,
                details: audit.details || null,
            };

            if (audit.score === 1) {
                passedMetrics.push(metricData);
            } else if (audit.score === 0) {
                failedMetrics.push(metricData);
            } else {
                manualCheckMetrics.push(metricData);
            }
        } else {
            // Handle missing metrics with fallback data
            const fallbackMetricData = {
                id: metric.id,
                name: metric.name,
                tooltip: metric.tooltip,
                feedback: "Metric data is not available.",
                score: null,
                priority: metric.priority,
                displayValue: null,
                description: null,
                numericValue: null,
                details: null,
            };
            manualCheckMetrics.push(fallbackMetricData);
        }
    });

    return { failedMetrics, passedMetrics, manualCheckMetrics };
};

// Controller to fetch mobile SEO metrics by report ID
export const getMobilePerformanceMetrics = async (req: Request, res: Response): Promise<void> => {
    const { reportId } = req.params;

    console.log(`[Debug] Fetching Mobile SEO metrics for reportId: ${reportId}`);

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
        console.error(`[Error] Invalid reportId format: ${reportId}`);
        res.status(400).json({ message: "Invalid report ID format." });
        return;
    }

    try {
        const report = await Report.findById(reportId).select("url mobileReport createdAt");

        if (!report) {
            console.warn(`[Warning] Report not found for reportId: ${reportId}`);
            res.status(404).json({ message: "Report not found." });
            return;
        }

        const mobileReport: any = report.mobileReport;
        const { failedMetrics, passedMetrics, manualCheckMetrics } = processPerformanceMetrics(mobileReport, reportId);
        const performanceScore = mobileReport?.lighthouseResult?.categories?.performance?.score || null;

        const responseData = {
            url: report.url,
            seoScore: performanceScore,
            metrics: {
                failedMetrics,
                passedMetrics,
                manualCheckMetrics,
            },
            createdAt: report.createdAt,
        };

        console.log(`[Debug] Successfully fetched Mobile SEO metrics for reportId: ${reportId}`);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("[Get Mobile SEO Metrics Error]", error instanceof Error ? error.message : "Unknown error");
        res.status(500).json({ message: "Failed to fetch the Mobile SEO metrics." });
    }
};

// Controller to fetch desktop SEO metrics by report ID
export const getDesktopPerformanceMetrics = async (req: Request, res: Response): Promise<void> => {
    const { reportId } = req.params;

    console.log(`[Debug] Fetching Desktop SEO metrics for reportId: ${reportId}`);

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
        console.error(`[Error] Invalid reportId format: ${reportId}`);
        res.status(400).json({ message: "Invalid report ID format." });
        return;
    }

    try {
        const report = await Report.findById(reportId).select("url desktopReport createdAt");

        if (!report) {
            console.warn(`[Warning] Report not found for reportId: ${reportId}`);
            res.status(404).json({ message: "Report not found." });
            return;
        }

        const desktopReport: any = report.desktopReport;
        const { failedMetrics, passedMetrics, manualCheckMetrics } = processPerformanceMetrics(desktopReport, reportId);
        const performanceScore = desktopReport?.lighthouseResult?.categories?.performance?.score || null;

        const responseData = {
            url: report.url,
            seoScore: performanceScore,
            metrics: {
                failedMetrics,
                passedMetrics,
                manualCheckMetrics,
            },
            createdAt: report.createdAt,
        };

        console.log(`[Debug] Successfully fetched Desktop SEO metrics for reportId: ${reportId}`);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("[Get Desktop SEO Metrics Error]", error instanceof Error ? error.message : "Unknown error");
        res.status(500).json({ message: "Failed to fetch the Desktop SEO metrics." });
    }
};
