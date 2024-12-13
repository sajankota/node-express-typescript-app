// src/controllers/processMetrics.ts

import { Request, Response } from "express";
import { Content } from "../models/ContentModel";
import { Metrics } from "../models/MetricsModel";
import { calculateMetrics } from "../services/calculateMetrics";
import { MetricResults } from "../types/MetricsTypes";

export const processMetrics = async (req: Request, res: Response): Promise<void> => {
    const { userId, url } = req.body;

    if (!userId || !url) {
        res.status(400).json({ message: "Missing 'userId' or 'url' in request body" });
        return;
    }

    try {
        const scrapedData = await Content.findOne({ userId, url }).lean();
        if (!scrapedData) {
            res.status(404).json({ message: "No scraped data found for the given criteria" });
            return;
        }

        let metricsEntry = await Metrics.findOne({ userId, url });
        if (!metricsEntry) {
            metricsEntry = await Metrics.create({ userId, url, status: "processing" });
        } else {
            metricsEntry.status = "processing";
            await metricsEntry.save();
        }

        const metricsId = metricsEntry._id;

        const calculatedMetrics: MetricResults = await calculateMetrics(scrapedData);

        metricsEntry.metrics = calculatedMetrics;
        metricsEntry.status = "ready";
        metricsEntry.createdAt = new Date();
        await metricsEntry.save();

        res.status(200).json({
            message: "Metrics processed successfully",
            reportId: metricsId,
            metrics: calculatedMetrics,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("[processMetrics] Error:", errorMessage);

        await Metrics.updateOne({ userId, url }, { $set: { status: "error" } }, { upsert: true });

        res.status(500).json({ message: "Error processing metrics", error: errorMessage });
    }
};
