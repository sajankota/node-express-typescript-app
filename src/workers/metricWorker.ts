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

// Determine the backend URL dynamically
const NODE_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "http://api.roundcodebox.com:4000"
    : "http://localhost:4000";

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
  let browser;
  try {
    console.log(`[Worker] Generating screenshot for URL: ${url}`);
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 768, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.screenshot({ path: outputPath, fullPage: false, type: "jpeg", quality: 90 });
    console.log(`[Worker] Screenshot saved at: ${outputPath}`);
  } catch (error) {
    console.error(`[Worker] Failed to generate screenshot for ${url}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// Main worker logic
(async () => {
  try {
    await connectWorkerToDB();
    const { userId, url } = workerData;

    if (!url || typeof url !== "string") {
      throw new Error("Invalid or missing 'url' in workerData.");
    }

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

      // Save the public screenshot URL
      const publicScreenshotUrl = `${NODE_SERVER_URL}/screenshots/${path.basename(screenshotPath)}`;
      console.log(`[Worker] Public Screenshot URL: ${publicScreenshotUrl}`);
      await Metrics.updateOne(
        { userId, url },
        { $set: { screenshotPath: publicScreenshotUrl } },
        { upsert: true }
      );
    } catch (error) {
      console.error(`[Worker] Screenshot generation failed for URL: ${url}`, error);
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
