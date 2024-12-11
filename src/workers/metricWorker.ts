// src/workers/metricWorker.ts

const { parentPort, workerData } = require("worker_threads");
const mongoose = require("mongoose");
const { Content } = require("../models/ContentModel");
const { Metrics } = require("../models/MetricsModel");
const { calculateMetrics } = require("../services/calculateMetrics");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

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

// Function to generate a screenshot for a given URL
const generateScreenshot = async (url: string, outputPath: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log(`[Worker] Generating screenshot for URL: ${url}`);
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Improve performance on systems with limited shared memory
          '--disable-gpu' // Avoid GPU overhead
        ],
      });
      const page = await browser.newPage();

      // Set the viewport to simulate a desktop screen
      await page.setViewport({
        width: 1280, // Standard desktop width
        height: 768, // Standard desktop height
        deviceScaleFactor: 2, // Higher scale for better quality
      });

      // Ensure CSS, images, and JavaScript are loaded
      await page.goto(url, { waitUntil: "networkidle0" }); // Wait for all network requests to finish

      // Take a screenshot of the visible viewport only
      await page.screenshot({
        path: outputPath,
        fullPage: false, // Ensure only the visible viewport is captured
        type: "jpeg",
        quality: 90, // High quality for better visuals
      });

      console.log(`[Worker] Screenshot saved at: ${outputPath}`);
      await browser.close();
      resolve();
    } catch (error) {
      console.error(`[Worker] Failed to generate screenshot for ${url}:`, error);
      reject(error);
    }
  });
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

    // Step 3: Generate screenshot
    const screenshotDir = path.resolve(__dirname, "../../screenshots");
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
      console.log(`[Worker] Created screenshot directory: ${screenshotDir}`);
    }

    const screenshotPath = path.resolve(
      screenshotDir,
      `${url.replace(/[^a-zA-Z0-9]/g, "_")}.jpeg`
    );

    try {
      await generateScreenshot(url, screenshotPath);
    } catch (error) {
      console.error(`[Worker] Failed to generate screenshot for URL: ${url}`, error);
    }

    // Step 4: Calculate metrics (ensure we await the result)
    const metrics = await calculateMetrics(scrapedData.toObject());
    console.log("[Worker] Calculated Metrics:", JSON.stringify(metrics, null, 2)); // Log calculated metrics

    // Validate that all required fields exist in the metrics object
    if (
      !metrics.seo ||
      !metrics.security ||
      !metrics.performance ||
      !metrics.miscellaneous
    ) {
      throw new Error(
        "Metrics validation failed: Missing required fields (seo, security, performance, miscellaneous)"
      );
    }

    // Step 5: Save the processed metrics to the `Metrics` collection
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
    // Step 6: Disconnect from MongoDB
    await mongoose.disconnect();
    console.log("[Worker] Disconnected from MongoDB");
  }
})();