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

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/roundcodebox";
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

// Function to detect captchas on a page
const detectCaptcha = async (page: Page): Promise<boolean> => {
  try {
    return await page.evaluate(
      () => !!document.querySelector("iframe[src*='captcha']")
    );
  } catch (error) {
    console.error("[Worker] Error during captcha detection:", error);
    return false;
  }
};

// Function to generate a screenshot for a given URL
const generateScreenshot = async (
  browser: Browser,
  url: string,
  outputPath: string
): Promise<string | null> => {
  let page: Page | null = null;
  try {
    console.log(`[Worker] Generating screenshot for URL: ${url}`);
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 768, deviceScaleFactor: 2 });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 90000,
    });

    if (await detectCaptcha(page)) {
      console.warn(`[Worker] Skipping URL due to captcha: ${url}`);
      return null;
    }

    await page.screenshot({
      path: outputPath,
      fullPage: true,
      type: "jpeg",
      quality: 100,
    });
    console.log(`[Worker] Screenshot saved at: ${outputPath}`);
    return `${NODE_SERVER_URL}/screenshots/${path.basename(outputPath)}`;
  } finally {
    if (page) await page.close();
  }
};

// Main worker logic
(async () => {
  let browser: Browser | null = null;
  try {
    console.log("[Worker] Starting processing...");
    await connectWorkerToDB();

    const { userId, url }: { userId: string; url: string } = workerData;

    if (!userId || !url) {
      throw new Error("Invalid or missing 'userId' or 'url' in workerData.");
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
      parentPort?.postMessage({ userId, url, status: "error" });
      return;
    }

    console.log("[Worker] Setting status to 'processing'...");
    await Metrics.updateOne(
      { userId, url },
      { $set: { status: "processing" } },
      { upsert: true }
    );
    parentPort?.postMessage({ userId, url, status: "processing" });

    console.log("[Worker] Launching Puppeteer...");
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

    console.log("[Worker] Generating screenshot...");
    const screenshotUrl = await generateScreenshot(browser, url, screenshotPath);

    if (screenshotUrl) {
      console.log("[Worker] Updating screenshotPath in Metrics...");
      await Metrics.updateOne(
        { userId, url },
        { $set: { screenshotPath: screenshotUrl } },
        { upsert: true }
      );
    }

    console.log("[Worker] Calculating metrics...");
    const metrics = await calculateMetrics(scrapedData.toObject());
    await Metrics.updateOne(
      { userId, url },
      {
        $set: {
          metrics,
          status: "ready",
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    console.log("[Worker] Sending 'ready' status to parentPort...");
    parentPort?.postMessage({ userId, url, status: "ready", metrics });
  } catch (error) {
    console.error(`[Worker] Error during processing:`, error);
    if (workerData?.url && workerData?.userId) {
      await Metrics.updateOne(
        { userId: workerData.userId, url: workerData.url },
        { $set: { status: "error" } },
        { upsert: true }
      );
      parentPort?.postMessage({
        userId: workerData.userId,
        url: workerData.url,
        status: "error",
      });
    }
  } finally {
    if (browser) await browser.close();
    await mongoose.disconnect();
  }
})();
