// src/controllers/processMetrics.ts

import { Request, Response } from "express";
import { Content, IContent } from "../models/ContentModel";
import { Metrics } from "../models/MetricsModel";
import { calculateMetrics } from "../services/calculateMetrics";
import { FilterQuery } from "mongoose";

export const processMetrics = async (req: Request, res: Response): Promise<void> => {
    const { userId, url } = req.body;

    try {
        // Step 1: Build the query
        const query: FilterQuery<IContent> = {};
        if (userId) query.userId = String(userId).trim();
        if (url) query.url = String(url).trim();

        console.log("[Debug] Querying Content collection with:", query);

        // Step 2: Fetch data and cast result
        const scrapedData: IContent[] = await Content.find(query).lean();

        if (!scrapedData.length) {
            res.status(404).json({ message: "No scraped data found for the given criteria" });
            return;
        }

        console.log(`[Debug] Fetched ${scrapedData.length} scraped data records`);

        // Step 3: Process each record concurrently
        const metricsData = await Promise.all(
            scrapedData.map(async (data) => {
                try {
                    const metrics = await calculateMetrics(data);

                    if (!metrics.seo || !metrics.security || !metrics.performance || !metrics.miscellaneous) {
                        throw new Error("Incomplete metrics data.");
                    }

                    await Metrics.updateOne(
                        { userId: data.userId, url: data.url },
                        { $set: { metrics, createdAt: new Date() } },
                        { upsert: true }
                    );

                    return metrics;
                } catch (error) {
                    console.error("[processMetrics] Error processing record:", error);
                    throw error;
                }
            })
        );

        console.log("[Debug] Metrics processing completed successfully");

        res.status(200).json({
            message: "Metrics processed successfully",
            metrics: metricsData,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("[processMetrics] Error:", errorMessage);
        res.status(500).json({ message: "Error processing metrics", error: errorMessage });
    }
};
