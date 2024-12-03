// src/workers/metricWorker.ts

const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const { Content } = require("../models/ContentModel");
const { Metrics } = require("../models/MetricsModel");
const { calculateMetrics } = require("../services/calculateMetrics");

// MongoDB URI
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/roundcodebox";

// Function to connect to MongoDB
const connectWorkerToDB = async () => {
  try {
    console.log("[Worker] Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds
    });
    console.log("[Worker] Connected to MongoDB");
  } catch (error) {
    console.error("[Worker] MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB in worker thread");
  }
};

// Main worker logic
(async () => {
  try {
    // Step 1: Connect to MongoDB
    await connectWorkerToDB();

    const { userId, url } = workerData;

    console.log(`[Worker] Processing metrics for URL: ${url} and User: ${userId}`);

    // Step 2: Fetch the scraped content from MongoDB
    const scrapedData = await Content.findOne({ userId, url });
    if (!scrapedData) {
      console.warn(`[Worker] No scraped data found for URL: ${url}`);
      parentPort?.postMessage(`[Worker] No scraped data found for URL: ${url}`);
      return;
    }

    console.log("[Worker] Scraped Data:", JSON.stringify(scrapedData, null, 2)); // Log the entire scraped data

    // Check if the favicon field exists in the document
    if (!scrapedData.favicon) {
      console.warn("[Worker] Favicon field is missing or null in scraped data");
    } else {
      console.log("[Worker] Favicon URL found in scraped data:", scrapedData.favicon);
    }

    // Step 3: Calculate metrics
    const metrics = calculateMetrics(scrapedData.toObject());
    console.log("[Worker] Calculated Metrics:", JSON.stringify(metrics, null, 2)); // Log calculated metrics

    // Step 4: Save the processed metrics to the `Metrics` collection
    await Metrics.create({
      userId,
      url,
      metrics,
      createdAt: new Date(),
    });

    console.log(`[Worker] Metrics processed successfully for URL: ${url}`);
    parentPort?.postMessage(`[Worker] Metrics processed successfully for URL: ${url}`);
  } catch (error) {
    console.error(`[Worker] Error processing metrics:`, error);
    parentPort?.postMessage(
      `[Worker] Error processing metrics: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    // Step 5: Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("[Worker] Disconnected from MongoDB");
  }
})();
