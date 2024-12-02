// src/controllers/processMetrics.ts

import { Request, Response } from "express";
import { Content, IContent } from "../models/ContentModel";
import { Metrics } from "../models/MetricsModel";
import { calculateMetrics } from "../services/metricsService";
import { FilterQuery } from "mongoose";
import { Worker } from "worker_threads";
import path from "path";

/**
 * Manually process metrics in a single thread (not recommended for production scale).
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

        let processedCount = 0;
        const metricsData = []; // Collect metrics for response

        // Step 2: Process each URL and calculate metrics
        for (const data of scrapedData) {
            // Convert Mongoose document to plain object
            const plainData = data.toObject();

            // Pass the plain object to the metrics calculation service
            const metrics = calculateMetrics(plainData);
            console.log("Calculated Metrics:", metrics); // Debugging: Ensure metrics include new fields

            // Step 3: Save the processed metrics to the new collection
            await Metrics.create({
                userId: plainData.userId,
                url: plainData.url,
                metrics,
                createdAt: new Date(),
            });

            metricsData.push(metrics); // Collect metrics for API response
            processedCount++;
        }

        // Step 4: Send response with metrics included
        res.status(200).json({
            message: "Metrics processed successfully",
            processedCount,
            metrics: scrapedData.map((data) => calculateMetrics(data.toObject())), // Include all calculated metrics
        });
    } catch (error) {
        console.error("[Process Metrics] Error:", error);

        // Handle error type properly
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        res.status(500).json({ message: "Error processing metrics", error: errorMessage });
    }
};

/**
 * Trigger metric processing using worker threads.
 * 
 * @param userId - The ID of the user for which metrics are being processed
 * @param url - The URL to process metrics for
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
        console.error("[Worker Trigger Error]:", error);
    }
};
