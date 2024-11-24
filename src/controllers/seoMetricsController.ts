import { Request, Response } from "express";
import mongoose from "mongoose";
import { Report } from "../models/reportModel";
import { seoMetricsConstants } from "../constants/seoMetricsConstants";

// Define the type for LighthouseResult
interface LighthouseResult {
    audits: Record<string, any>;
    categories?: {
        seo?: {
            score: number; // SEO score (0 to 1)
        };
    };
}

// Define the type for Report
interface ReportWithLighthouse {
    url: string;
    mobileReport?: { lighthouseResult?: LighthouseResult };
    desktopReport?: { lighthouseResult?: LighthouseResult };
    createdAt: string;
}

// Helper function to filter and update metrics
const filterSEOMetrics = (audits: Record<string, any>) => {
    // Create a map of valid metric details from seoMetricsConstants
    const metricDetailsMap = new Map(
        seoMetricsConstants.map((metric) => [metric.id, metric])
    );

    // Filter the audits to include only metrics that exist in seoMetricsConstants
    const filteredAudits = Object.entries(audits)
        .filter(([id]) => metricDetailsMap.has(id)) // Include only matching IDs
        .map(([id, audit]) => {
            const metricDetails = metricDetailsMap.get(id);

            // Update name, tooltip, and feedback using seoMetricsConstants
            return {
                id,
                name: metricDetails?.name || audit.title || 'Unknown Metric',
                tooltip: metricDetails?.tooltip || audit.description || '',
                feedback:
                    audit.score === 1
                        ? metricDetails?.positiveText || 'Good'
                        : metricDetails?.negativeText || 'Needs Improvement',
                ...audit, // Preserve original audit properties
            };
        });

    return filteredAudits; // Return the filtered and updated metrics
};

// Controller to fetch mobile SEO metrics by report ID
export const getMobileSEOMetrics = async (req: Request, res: Response): Promise<void> => {
    const { reportId } = req.params;

    console.log(`[Debug] Fetching mobile SEO metrics for reportId: ${reportId}`);

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
        console.error(`[Error] Invalid reportId format: ${reportId}`);
        res.status(400).json({ message: "Invalid report ID format." });
        return;
    }

    try {
        const report = (await Report.findById(reportId).select(
            "url mobileReport createdAt"
        )) as ReportWithLighthouse;

        if (!report) {
            console.warn(`[Warning] Report not found for reportId: ${reportId}`);
            res.status(404).json({ message: "Report not found." });
            return;
        }

        const audits = report.mobileReport?.lighthouseResult?.audits || {};
        const seoScore = report.mobileReport?.lighthouseResult?.categories?.seo?.score || null;
        const metrics = filterSEOMetrics(audits);

        const responseData = {
            url: report.url,
            metrics,
            seoScore: seoScore !== null ? seoScore * 100 : null, // Convert score to percentage
            createdAt: report.createdAt,
        };

        console.log(`[Debug] Successfully fetched mobile SEO metrics for reportId: ${reportId}`);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("[Get Mobile SEO Metrics Error]", error instanceof Error ? error.message : "Unknown error");
        res.status(500).json({ message: "Failed to fetch the mobile SEO metrics." });
    }
};

// Controller to fetch desktop SEO metrics by report ID
export const getDesktopSEOMetrics = async (req: Request, res: Response): Promise<void> => {
    const { reportId } = req.params;

    console.log(`[Debug] Fetching desktop SEO metrics for reportId: ${reportId}`);

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
        console.error(`[Error] Invalid reportId format: ${reportId}`);
        res.status(400).json({ message: "Invalid report ID format." });
        return;
    }

    try {
        const report = (await Report.findById(reportId).select(
            "url desktopReport createdAt"
        )) as ReportWithLighthouse;

        if (!report) {
            console.warn(`[Warning] Report not found for reportId: ${reportId}`);
            res.status(404).json({ message: "Report not found." });
            return;
        }

        const audits = report.desktopReport?.lighthouseResult?.audits || {};
        const seoScore = report.desktopReport?.lighthouseResult?.categories?.seo?.score || null;
        const metrics = filterSEOMetrics(audits);

        const responseData = {
            url: report.url,
            metrics,
            seoScore: seoScore !== null ? seoScore * 100 : null, // Convert score to percentage
            createdAt: report.createdAt,
        };

        console.log(`[Debug] Successfully fetched desktop SEO metrics for reportId: ${reportId}`);
        res.status(200).json(responseData);
    } catch (error) {
        console.error("[Get Desktop SEO Metrics Error]", error instanceof Error ? error.message : "Unknown error");
        res.status(500).json({ message: "Failed to fetch the desktop SEO metrics." });
    }
};
