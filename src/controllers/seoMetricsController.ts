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

interface CategorizedMetrics {
    failedMetrics: Array<any>;
    passedMetrics: Array<any>;
    manualCheckMetrics: Array<any>;
}

const categorizeSEOMetrics = (audits: Record<string, any>): CategorizedMetrics => {
    const metricDetailsMap = new Map<string, any>(
        seoMetricsConstants.map((metric) => [metric.id, metric])
    );

    const categorizedMetrics: CategorizedMetrics = {
        failedMetrics: [],
        passedMetrics: [],
        manualCheckMetrics: [],
    };

    for (const [id, audit] of Object.entries(audits)) {
        const metricDetails = metricDetailsMap.get(id);

        if (metricDetails) {
            // Construct the metric object, including only the fields present in the audit
            const metric: any = {
                id,
                name: metricDetails.name || audit.title || "Unknown Metric",
                feedback:
                    audit.score === 1
                        ? metricDetails.positiveText || "Good"
                        : metricDetails.negativeText || "Needs Improvement",
                tooltip: metricDetails.tooltip || audit.description || "",
                priority: metricDetails.priority || "Medium",
            };

            // Include the `details` field only if it exists in the original audit
            if (audit.details) {
                metric.details = audit.details;
            }

            // Include any additional fields from the original audit
            metric.score = audit.score;
            metric.scoreDisplayMode = audit.scoreDisplayMode;

            // Categorize the metric based on its score
            if (audit.score === 1) {
                categorizedMetrics.passedMetrics.push(metric);
            } else if (audit.score === 0) {
                categorizedMetrics.failedMetrics.push(metric);
            } else {
                categorizedMetrics.manualCheckMetrics.push(metric);
            }
        }
    }

    return categorizedMetrics;
};

export const getMobileSEOMetrics = async (req: Request, res: Response): Promise<void> => {
    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
        res.status(400).json({ message: "Invalid report ID format." });
        return;
    }

    try {
        const report = (await Report.findById(reportId).select(
            "url mobileReport createdAt"
        )) as ReportWithLighthouse;

        if (!report) {
            res.status(404).json({ message: "Report not found." });
            return;
        }

        const audits = report.mobileReport?.lighthouseResult?.audits || {};
        const seoScore = report.mobileReport?.lighthouseResult?.categories?.seo?.score || null;
        const metrics = categorizeSEOMetrics(audits);

        const responseData = {
            url: report.url,
            seoScore: seoScore !== null ? seoScore * 100 : null,
            createdAt: report.createdAt,
            metrics,
        };

        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch the mobile SEO metrics." });
    }
};

export const getDesktopSEOMetrics = async (req: Request, res: Response): Promise<void> => {
    const { reportId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
        res.status(400).json({ message: "Invalid report ID format." });
        return;
    }

    try {
        const report = (await Report.findById(reportId).select(
            "url desktopReport createdAt"
        )) as ReportWithLighthouse;

        if (!report) {
            res.status(404).json({ message: "Report not found." });
            return;
        }

        const audits = report.desktopReport?.lighthouseResult?.audits || {};
        const seoScore = report.desktopReport?.lighthouseResult?.categories?.seo?.score || null;
        const metrics = categorizeSEOMetrics(audits);

        const responseData = {
            url: report.url,
            seoScore: seoScore !== null ? seoScore * 100 : null,
            createdAt: report.createdAt,
            metrics,
        };

        res.status(200).json(responseData);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch the desktop SEO metrics." });
    }
};
