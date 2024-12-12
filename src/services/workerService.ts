// src/services/workerService.ts

import { Worker } from "worker_threads";
import path from "path";

/**
 * Trigger the Worker Thread to process metrics for a specific user and URL.
 * @param userId The user ID for the metrics.
 * @param url The URL for which metrics should be processed.
 */
export const triggerMetricProcessing = (userId: string, url: string) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";
        const workerPath = path.resolve(
            __dirname,
            isProduction ? "../../dist/workers/metricWorker.js" : "../../dist/workers/metricWorker.js" // Ensure JS file is used
        );

        console.log(`[WorkerService] Worker Path: ${workerPath}`);

        const worker = new Worker(workerPath, { workerData: { userId, url } });

        worker.on("message", (message) => console.log(`[Worker Message]: ${message}`));

        worker.on("error", (error) => console.error(`[Worker Error]:`, error));

        worker.on("exit", (exitCode) => {
            if (exitCode !== 0) {
                console.error(`[Worker] Exited with error code: ${exitCode}`);
            } else {
                console.log(`[Worker] Successfully completed for URL: ${url}`);
            }
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error("[WorkerService] Failed to start worker:", error.message);
        } else {
            console.error("[WorkerService] Unknown error occurred while starting worker:", error);
        }
    }
};
