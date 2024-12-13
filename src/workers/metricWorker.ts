// src/workers/metricWorker.ts

import "regenerator-runtime/runtime";
import { parentPort, workerData } from "worker_threads";
import mongoose from "mongoose";
import { Content } from "../models/ContentModel";
import { Metrics } from "../models/MetricsModel";
import { calculateMetrics } from "../services/calculateMetrics";
import puppeteer from "puppeteer-extra";
import type { Browser, Page } from "puppeteer";
import path from "path";
import fs from "fs";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/roundcodebox";
const NODE_SERVER_URL =
  process.env.NODE_ENV === "production"
    ? "http://api.roundcodebox.com"
    : "http://localhost:4000";

// Connect to MongoDB
const connectWorkerToDB = async (): Promise<void> => {
  try {
    console.log("[Worker] Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 });
    console.log("[Worker] Connected to MongoDB");
  } catch (error) {
    console.error("[Worker] MongoDB connection error:", error);
    throw new Error("Failed to connect to MongoDB in worker thread");
  }
};

// Generate screenshot for a given URL
const generateScreenshot = async (
  browser: Browser,
  url: string,
  outputPath: string
): Promise<string | null> => {
  let page: Page | null = null;
  try {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 768, deviceScaleFactor: 2 });
    await page.goto(url, { waitUntil: "networkidle2", timeout: 90000 });

    await page.screenshot({ path: outputPath, fullPage: true, type: "jpeg", quality: 90 });
    return `${NODE_SERVER_URL}/screenshots/${path.basename(outputPath)}`;
  } catch (error) {
    console.error(`[Worker] Error generating screenshot for URL: ${url}`, error);
    return null;
  } finally {
    if (page) await page.close();
  }
};

// Main worker logic
(async () => {
  let browser: Browser | null = null;
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
      await Metrics.updateOne(
        { userId, url },
        { $set: { status: "error" } },
        { upsert: true }
      );
      parentPort?.postMessage(`[Worker] No scraped data found for URL: ${url}`);
      return;
    }

    await Metrics.updateOne(
      { userId, url },
      { $set: { status: "processing" } },
      { upsert: true }
    );

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const screenshotDir = path.resolve(__dirname, "../../screenshots");
    fs.mkdirSync(screenshotDir, { recursive: true });
    const screenshotPath = path.join(
      screenshotDir,
      `${url.replace(/[^a-zA-Z0-9]/g, "_")}.jpeg`
    );

    const [screenshotUrl, metrics] = await Promise.all([
      generateScreenshot(browser, url, screenshotPath),
      calculateMetrics(scrapedData.toObject()),
    ]);

    await Metrics.updateOne(
      { userId, url },
      {
        $set: {
          metrics,
          screenshotPath: screenshotUrl,
          status: "ready",
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log(`[Worker] Metrics processed successfully for URL: ${url}`);
    parentPort?.postMessage(`[Worker] Metrics and screenshot processed successfully for URL: ${url}`);
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error(`[Worker] Error processing metrics: ${error.message}`);
    } else {
      console.error(`[Worker] Unknown Error:`, error);
    }

    await Metrics.updateOne(
      { userId, url },
      { $set: { status: "error" } },
      { upsert: true }
    );
    parentPort?.postMessage(`[Worker] Error processing metrics: ${errorMessage}`);
  } finally {
    if (browser) await browser.close();
    await mongoose.disconnect();
    console.log("[Worker] Browser closed and MongoDB disconnected.");
  }
})();
