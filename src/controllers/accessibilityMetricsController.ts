// src/controllers/accessibilityMetricsController.ts

import { Request, Response } from "express";
import mongoose from "mongoose";
import { Report } from "../models/reportModel";
import { accessibilityMetricsConstants } from "../constants/accessibilityMetricsConstants"; // Import Accessibility metrics constants

interface Metric {
    id: string;
    name: string;
    tooltip: string;
    feedback: string;
    score: number | null;
}

// Helper function to process Accessibility metrics
const processAccessibilityMetrics = (reportData: any, reportId: string): {
    failedMetrics: Metric[];
    passedMetrics: Metric[];
    manualCheckMetrics: Metric[];
    accessibilityScore: number | null;
} => {
    const failedMetrics: Metric[] = [];
    const passedMetrics: Metric[] = [];
    const manualCheckMetrics: Metric[] = [];
    let totalScore = 0;
    let validScoresCount = 0;

    accessibilityMetricsConstants.forEach((metric) => {
        const audit = reportData?.lighthouseResult?.audits?.[metric.id];

        if (audit) {
            const metricData: Metric = {
                id: metric.id,
                name: metric.name,
                tooltip: metric.tooltip,
                feedback: audit.score === 1 ? metric.positiveText : metric.negativeText,
                score: audit.score ?? null,
            };

            if (audit.score === 1) {
                passedMetrics.push(metricData);
            } else if (audit.score === null) {
                manualCheckMetrics.push(metricData);
            } else {
                failedMetrics.push(metricData);
            }

            // Calculate Accessibility Score
            if (audit.score !== null) {
                totalScore += audit.score;
                validScoresCount++;
            }
        } else {
            console.warn(`[Warning] Metric ${metric.id} not found for reportId: ${reportId}`);
            manualCheckMetrics.push({
                id: metric.id,
                name: metric.name,
                tooltip: metric.tooltip,
                feedback: "Metric data is not available.",
                score: null,
            });
        }
    });

    // Calculate the average score (Accessibility Score)
    const accessibilityScore = validScoresCount > 0 ? Math.round((totalScore / validScoresCount) * 100) : null;

    return { failedMetrics, passedMetrics, manualCheckMetrics, accessibilityScore };
};

// Controller to fetch mobile Accessibility metrics by report ID
export const getMobileAccessibilityMetrics = async (req: Request, res: Response): Promise<void> => {
    const { reportId } = req.params;

    console.log(`[Debug] Fetching Mobile Accessibility metrics for reportId: ${reportId}`);

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

        const { failedMetrics, passedMetrics, manualCheckMetrics, accessibilityScore } =
            processAccessibilityMetrics(mobileReport, reportId);

        const responseData = {
            url: report.url,
            accessibilityScore,
            failedMetrics,
            passedMetrics,
            manualCheckMetrics,
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

        const { failedMetrics, passedMetrics, manualCheckMetrics, accessibilityScore } =
            processAccessibilityMetrics(desktopReport, reportId);

        const responseData = {
            url: report.url,
            accessibilityScore,
            failedMetrics,
            passedMetrics,
            manualCheckMetrics,
            createdAt: report.createdAt,
        };

        console.log(`[Debug] Successfully fetched Desktop Accessibility metrics for reportId: ${reportId}`);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("[Get Desktop Accessibility Metrics Error]", error instanceof Error ? error.message : "Unknown error");
        res.status(500).json({ message: "Failed to fetch the Desktop Accessibility metrics." });
    }
};
