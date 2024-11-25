// src/controllers/performanceMetricsController.ts


import { Request, Response } from "express";
import mongoose from "mongoose";
import { Report } from "../models/reportModel";
import { performanceMetricsConstants } from "../constants/performanceMetricsConstants";

// Define the type for priority
type Priority = "Critical" | "High" | "Medium" | "Low";

// Define the type for metric data
interface MetricData {
    id: string;
    name: string;
    tooltip: string;
    feedback: string;
    score: number | null;
    priority: Priority;
    displayValue: string | null;
    description: string | null;
    numericValue: number | null;
    details: any;
}

// Helper function to process and sort metrics
const processPerformanceMetrics = (reportData: any, reportId: string) => {
    const failedMetrics: MetricData[] = [];
    const passedMetrics: MetricData[] = [];
    const manualCheckMetrics: MetricData[] = [];

    // Define priority order for sorting
    const priorityOrder: Record<Priority, number> = {
        Critical: 1,
        High: 2,
        Medium: 3,
        Low: 4,
    };

    performanceMetricsConstants.forEach((metric) => {
        const audit = reportData?.lighthouseResult?.audits?.[metric.id];

        const metricData: MetricData = {
            id: metric.id,
            name: metric.name,
            tooltip: metric.tooltip,
            feedback:
                audit?.score === 1
                    ? metric.positiveText
                    : metric.negativeText,
            score: audit?.score ?? null,
            priority: metric.priority as Priority,
            displayValue: audit?.displayValue || null,
            description: audit?.description || null,
            numericValue: audit?.numericValue || null,
            details: audit?.details || null,
        };

        if (audit?.score === 1) {
            passedMetrics.push(metricData);
        } else if (audit?.score === 0) {
            failedMetrics.push(metricData);
        } else {
            manualCheckMetrics.push(metricData);
        }
    });

    // Sort failedMetrics by priority
    failedMetrics.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    // Sort passedMetrics by priority
    passedMetrics.sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    return { failedMetrics, passedMetrics, manualCheckMetrics };
};

// Controller to fetch mobile performance metrics by report ID
export const getMobilePerformanceMetrics = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { reportId } = req.params;

    console.log(`[Debug] Fetching Mobile Performance metrics for reportId: ${reportId}`);

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
        const { failedMetrics, passedMetrics, manualCheckMetrics } =
            processPerformanceMetrics(mobileReport, reportId);
        const performanceScore =
            mobileReport?.lighthouseResult?.categories?.performance?.score || null;

        const responseData = {
            url: report.url,
            performanceScore,
            metrics: {
                failedMetrics,
                passedMetrics,
                manualCheckMetrics,
            },
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
export const getDesktopPerformanceMetrics = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { reportId } = req.params;

    console.log(`[Debug] Fetching Desktop Performance metrics for reportId: ${reportId}`);

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
        const { failedMetrics, passedMetrics, manualCheckMetrics } =
            processPerformanceMetrics(desktopReport, reportId);
        const performanceScore =
            desktopReport?.lighthouseResult?.categories?.performance?.score || null;

        const responseData = {
            url: report.url,
            performanceScore,
            metrics: {
                failedMetrics,
                passedMetrics,
                manualCheckMetrics,
            },
            createdAt: report.createdAt,
        };

        console.log(`[Debug] Successfully fetched Desktop Performance metrics for reportId: ${reportId}`);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("[Get Desktop Performance Metrics Error]", error instanceof Error ? error.message : "Unknown error");
        res.status(500).json({ message: "Failed to fetch the Desktop Performance metrics." });
    }
};
