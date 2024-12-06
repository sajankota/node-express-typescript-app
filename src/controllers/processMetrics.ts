// src/controllers/processMetrics.ts

import { Request, Response } from "express";
import { Content, IContent } from "../models/ContentModel";
import { Metrics } from "../models/MetricsModel";
import { calculateMetrics } from "../services/calculateMetrics";
import { FilterQuery } from "mongoose";
import { Worker } from "worker_threads";
import path from "path";

/**
 * Process metrics for the given URL.
 */
export const processMetrics = async (req: Request, res: Response): Promise<void> => {
    const { userId, url } = req.body;

    try {
        // Step 1: Build the query
        const query: FilterQuery<IContent> = {};
        if (userId) query.userId = userId;
        if (url) query.url = url;

        const scrapedData = await Content.find(query);

        if (!scrapedData || scrapedData.length === 0) {
            res.status(404).json({ message: "No scraped data found for the given criteria" });
            return;
        }

        const metricsData = [];

        // Step 2: Process each URL and calculate metrics
        for (const data of scrapedData) {
            // Convert Mongoose document to plain object
            const plainData = data.toObject();
            const metrics = await calculateMetrics(plainData);

            // Validate metrics before saving
            if (
                !metrics.seo ||
                !metrics.security ||
                !metrics.performance ||
                !metrics.miscellaneous
            ) {
                console.error("[processMetrics] Incomplete metrics:", metrics);
                throw new Error("Incomplete metrics data.");
            }

            await Metrics.create({
                userId: plainData.userId,
                url: plainData.url,
                metrics,
                createdAt: new Date(),
            });

            metricsData.push(metrics);
        }

        // Step 4: Send response with metrics included
        res.status(200).json({
            message: "Metrics processed successfully",
            metrics: metricsData,
        });
    } catch (error) {
        // Ensure `error` is an instance of Error before accessing its `message` property
        const errorMessage =
            error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("[processMetrics] Error:", errorMessage);
        res.status(500).json({ message: "Error processing metrics", error: errorMessage });
    }
};

/**
 * Trigger metric processing using worker threads.
 */
export const triggerMetricProcessing = (userId: string, url: string): void => {
    console.log(`[Worker] Triggering metric processing for URL: ${url}`);

    // Path to the compiled worker file (ensure TypeScript has compiled this to `dist`)
    const workerPath = path.resolve(__dirname, "../../dist/workers/metricWorker.js");

    try {
        // Initialize a new worker thread
        const worker = new Worker(workerPath, {
            workerData: { userId, url },
        });

        // Listen for messages from the worker
        worker.on("message", (msg) => console.log(`[Worker Message]: ${msg}`));

        // Listen for errors
        worker.on("error", (err) => console.error("[Worker Error]:", err));

        // Listen for the exit event
        worker.on("exit", (code) => {
            if (code !== 0) {
                console.error(`[Worker] Worker exited with code: ${code}`);
            } else {
                console.log(`[Worker] Worker completed successfully for URL: ${url}`);
            }
        });
    } catch (error) {
        // Ensure `error` is an instance of Error before accessing its `message` property
        const errorMessage =
            error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("[Worker Trigger Error]:", errorMessage);
    }
};
