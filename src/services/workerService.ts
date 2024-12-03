// src/services/workerService.ts

import { Worker } from "worker_threads";
import path from "path";

/**
 * Trigger the Worker Thread to process metrics for a specific user and URL.
 * @param userId The user ID for the metrics.
 * @param url The URL for which metrics should be processed.
 */
export const triggerMetricProcessing = (userId: string, url: string) => {
    // Path to the Worker Thread file
    const workerPath = path.resolve(__dirname, "../dist/workers/metricWorker.js");

    // Create a new Worker Thread
    const worker = new Worker(workerPath, {
        workerData: { userId, url }, // Pass userId and URL to the worker
    });

    // Listen for messages from the worker
    worker.on("message", (message) => {
        console.log(`[Worker Message]: ${message}`);
    });

    // Handle worker errors
    worker.on("error", (error) => {
        console.error(`[Worker Error]:`, error);
    });

    // Handle worker exit
    worker.on("exit", (exitCode) => {
        if (exitCode !== 0) {
            console.error(`[Worker] Exited with code: ${exitCode}`);
        } else {
            console.log(`[Worker] Worker completed successfully for URL: ${url}`);
        }
    });
};
