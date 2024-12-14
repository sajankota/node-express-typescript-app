// src/controllers/processMetrics.ts

import { Request, Response } from "express";
import { Content } from "../models/ContentModel";
import { Metrics } from "../models/MetricsModel";
import { calculateMetrics } from "../services/calculateMetrics";

export const processMetrics = async (req: Request, res: Response): Promise<void> => {
    const { userId, url } = req.body;
    console.log("[processMetrics] Received request:", req.body);

    if (!userId || !url) {
        console.error("[processMetrics] Missing 'userId' or 'url' in request body");
        res.status(400).json({ message: "Missing 'userId' or 'url' in request body" });
        return;
    }

    try {
        console.log("[processMetrics] Fetching scraped data...");
        const scrapedData = await Content.findOne({ userId, url }).lean();
        if (!scrapedData) {
            console.warn(`[processMetrics] No scraped data found for URL: ${url}`);
            res.status(404).json({ message: "No scraped data found for the given criteria" });
            return;
        }

        console.log("[processMetrics] Fetching metrics entry...");
        let metricsEntry = await Metrics.findOne({ userId, url });
        if (!metricsEntry) {
            console.log("[processMetrics] Creating new metrics entry...");
            metricsEntry = await Metrics.create({ userId, url, status: "processing" });
        } else {
            console.log("[processMetrics] Updating metrics entry status to 'processing'...");
            metricsEntry.status = "processing";
            await metricsEntry.save();
        }

        // Emit WebSocket update for "processing" status
        const io = req.app.get("io");
        const processingPayload = {
            reportId: metricsEntry._id,
            status: "processing",
            url,
            generatedAt: new Date(),
        };
        console.log("[WebSocket] Emitting 'project_update' for 'processing':", processingPayload);
        io.to(userId).emit("project_update", processingPayload);

        console.log("[processMetrics] Calculating metrics...");
        const calculatedMetrics = await calculateMetrics(scrapedData);

        console.log("[processMetrics] Updating metrics entry...");
        metricsEntry.metrics = calculatedMetrics;
        metricsEntry.status = "ready";
        metricsEntry.createdAt = new Date();
        await metricsEntry.save();

        // Emit WebSocket update for "ready" status
        const readyPayload = {
            reportId: metricsEntry._id,
            status: "ready",
            url,
            metrics: calculatedMetrics,
            generatedAt: metricsEntry.createdAt,
        };

        console.log("[WebSocket] Emitting to room:", userId);
        console.log("[WebSocket] Payload for 'ready':", readyPayload);
        io.to(userId).emit("project_update", readyPayload);
        console.log("[WebSocket] 'ready' status emitted successfully.");


        res.status(200).json({
            message: "Metrics processed successfully",
            reportId: metricsEntry._id,
            metrics: calculatedMetrics,
        });
    } catch (error) {
        const io = req.app.get("io");
        console.error("[processMetrics] Error occurred:", error);

        // Emit WebSocket update for "error" status
        const errorPayload = {
            url,
            status: "error",
        };
        console.log("[WebSocket] Emitting 'project_update' for 'error':", errorPayload);
        io.to(userId).emit("project_update", errorPayload);

        res.status(500).json({ message: "Error processing metrics" });
    }
};
