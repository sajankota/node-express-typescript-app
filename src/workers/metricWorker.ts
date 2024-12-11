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
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("[Worker] Connected to MongoDB");
  } catch (error) {
    console.error("[Worker] MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB in worker thread");
  }
};

// Function to generate a screenshot for a given URL
const generateScreenshot = async (url: string, outputPath: string) => {
  try {
    console.log(`[Worker] Generating screenshot for URL: ${url}`);
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 768, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.screenshot({ path: outputPath, fullPage: false, type: "jpeg", quality: 90 });
    await browser.close();
    console.log(`[Worker] Screenshot saved at: ${outputPath}`);
  } catch (error) {
    console.error(`[Worker] Failed to generate screenshot for ${url}:`, error);
    throw error;
  }
};

// Main worker logic
(async () => {
  try {
    await connectWorkerToDB();
    const { userId, url } = workerData;

    console.log(`[Worker] Processing metrics for URL: ${url} and User: ${userId}`);

    const scrapedData = await Content.findOne({ userId, url });
    if (!scrapedData) {
      console.warn(`[Worker] No scraped data found for URL: ${url}`);
      parentPort?.postMessage(`[Worker] No scraped data found for URL: ${url}`);
      return;
    }

    const screenshotDir = path.resolve(__dirname, "../../screenshots");
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

    const screenshotPath = path.resolve(
      screenshotDir,
      `${url.replace(/[^a-zA-Z0-9]/g, "_")}.jpeg`
    );

    try {
      await generateScreenshot(url, screenshotPath);

      // Save the screenshot path
      await Metrics.updateOne(
        { userId, url },
        { $set: { screenshotPath } },
        { upsert: true }
      );
    } catch (error) {
      console.error(`[Worker] Screenshot generation failed:`, error);
    }

    const metrics = await calculateMetrics(scrapedData.toObject());
    await Metrics.updateOne(
      { userId, url },
      { $set: { metrics, createdAt: new Date() } },
      { upsert: true }
    );

    console.log(`[Worker] Metrics processed successfully for URL: ${url}`);
    parentPort?.postMessage(`[Worker] Metrics processed successfully for URL: ${url}`);
  } catch (error) {
    console.error(`[Worker] Error processing metrics:`, error);
    parentPort?.postMessage(
      `[Worker] Error processing metrics: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    await mongoose.disconnect();
    console.log("[Worker] Disconnected from MongoDB");
  }
})();
