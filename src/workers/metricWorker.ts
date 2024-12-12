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

// Import Puppeteer Stealth Plugin
import StealthPlugin from "puppeteer-extra-plugin-stealth";
puppeteer.use(StealthPlugin());

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/roundcodebox";
const NODE_SERVER_URL = process.env.NODE_ENV === "production" ? "http://api.roundcodebox.com:4000" : "http://localhost:4000";

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

// Function to check for captchas on the page
const detectCaptcha = async (page: Page): Promise<boolean> => {
  try {
    const captchaDetected = await page.evaluate(() => {
      return document.querySelector("iframe[src*='captcha']") !== null;
    });

    if (captchaDetected) {
      console.warn("[Worker] Captcha detected on the page.");
    }
    return captchaDetected;
  } catch (error) {
    console.error("[Worker] Error during captcha detection:", error);
    return false;
  }
};

// Function to generate a screenshot for a given URL
const generateScreenshot = async (
  browser: Browser,
  url: string,
  outputPath: string,
  retries = 3
): Promise<void> => {
  let page: Page | null = null;
  try {
    console.log(`[Worker] Generating screenshot for URL: ${url}`);
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 768, deviceScaleFactor: 2 });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 90000,
    });

    // Check for captchas
    if (await detectCaptcha(page)) {
      console.warn(`[Worker] Skipping URL due to captcha: ${url}`);
      return;
    }

    // Take a screenshot of the visible viewport
    await page.screenshot({ path: outputPath, fullPage: false, type: "jpeg", quality: 90 });
    console.log(`[Worker] Screenshot saved at: ${outputPath}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (retries > 0) {
      console.warn(`[Worker] Retry (${3 - retries}) for URL: ${url} due to: ${errorMessage}`);
      await generateScreenshot(browser, url, outputPath, retries - 1);
    } else {
      console.error(`[Worker] Failed to generate screenshot for ${url} after retries: ${errorMessage}`);
      throw error;
    }
  } finally {
    if (page) {
      await page.close();
    }
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
      parentPort?.postMessage(`[Worker] No scraped data found for URL: ${url}`);
      return;
    }

    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const screenshotDir = path.resolve(__dirname, "../../screenshots");
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

    const screenshotPath = path.resolve(
      screenshotDir,
      `${url.replace(/[^a-zA-Z0-9]/g, "_")}.jpeg`
    );

    try {
      await generateScreenshot(browser, url, screenshotPath);

      const publicScreenshotUrl = `${NODE_SERVER_URL}/screenshots/${path.basename(screenshotPath)}`;
      console.log(`[Worker] Public Screenshot URL: ${publicScreenshotUrl}`);
      await Metrics.updateOne(
        { userId, url },
        { $set: { screenshotPath: publicScreenshotUrl } },
        { upsert: true }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`[Worker] Screenshot generation failed for URL: ${url}`, errorMessage);
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
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Worker] Error processing metrics: ${errorMessage}`);
    parentPort?.postMessage(`[Worker] Error processing metrics: ${errorMessage}`);
  } finally {
    if (browser) {
      await browser.close();
      console.log("[Worker] Browser instance closed.");
    }
    await mongoose.disconnect();
    console.log("[Worker] Disconnected from MongoDB");
  }
})();
