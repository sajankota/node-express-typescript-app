// src/services/workerService.ts

import { Worker } from "worker_threads";
import path from "path";

/**
 * Trigger the Worker Thread to process metrics for a specific user and URL.
 * @param userId The user ID for the metrics.
 * @param url The URL for which metrics should be processed.
 * @param io WebSocket server instance
 */
export const triggerMetricProcessing = (userId: string, url: string, io: any) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";
        const workerPath = path.resolve(
            __dirname,
            isProduction ? "../../dist/workers/metricWorker.js" : "../../dist/workers/metricWorker.js" // Ensure JS file is used
        );

        console.log(`[WorkerService] Worker Path: ${workerPath}`);

        const worker = new Worker(workerPath, { workerData: { userId, url } });

        // Handle messages from the worker
        worker.on("message", (message) => {
            console.log(`[WorkerService] Message from Worker for URL: ${url}`, message);

            // Emit 'status_update' and 'project_update' to WebSocket clients
            if (message?.status) {
                const statusUpdatePayload = { url: message.url, status: message.status };
                const projectUpdatePayload = { ...message };

                console.log(`[WebSocket] Emitting 'status_update' for URL: ${message.url}`);
                io.to(userId).emit("status_update", statusUpdatePayload);

                console.log(`[WebSocket] Emitting 'project_update' for URL: ${message.url}`);
                io.to(userId).emit("project_update", projectUpdatePayload);
            }
        });

        worker.on("error", (error) => {
            console.error(`[WorkerService] Error from Worker for URL: ${url}`, error);
        });

        worker.on("exit", (exitCode) => {
            if (exitCode !== 0) {
                console.error(`[WorkerService] Worker exited with error code: ${exitCode} for URL: ${url}`);
            } else {
                console.log(`[WorkerService] Worker completed successfully for URL: ${url}`);
            }
        });
    } catch (error) {
        console.error("[WorkerService] Failed to start worker:", error);
    }
};
