// src/services/workerService.ts

import { Worker } from "worker_threads";
import path from "path";

/**
 * Trigger the Worker Thread to process metrics for a specific user and URL.
 * @param userId The user ID for the metrics.
 * @param url The URL for which metrics should be processed.
 */
export const triggerMetricProcessing = (userId: string, url: string) => {
    // Determine the worker file dynamically based on environment
    const isProduction = process.env.NODE_ENV === "production";

    // Use absolute paths to avoid incorrect resolution
    const workerPath = isProduction
        ? path.resolve(__dirname, "../../dist/workers/metricWorker.js")
        : path.resolve(__dirname, "../../src/workers/metricWorker.ts");

    console.log(`[WorkerService] Worker Path: ${workerPath}`);

    // Use `ts-node` for development environment to handle `.ts` files
    const execArgv = isProduction ? [] : ["-r", "ts-node/register"];

    try {
        // Create a new Worker Thread
        const worker = new Worker(workerPath, {
            workerData: { userId, url },
            execArgv,
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
    } catch (error) {
        console.error("[WorkerService] Failed to start worker:", error);
    }
};
