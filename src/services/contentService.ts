// src/services/contentService.ts

import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Content } from "../models/ContentModel";
import { triggerMetricProcessing } from "./workerService";

// Use Puppeteer Stealth Plugin to bypass bot detections
puppeteer.use(StealthPlugin());

/**
 * Fetch content from the URL using Axios.
 */
export const fetchWithAxios = async (url: string): Promise<string> => {
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        if (!response.headers["content-type"]?.includes("text/html")) {
            throw new Error("The provided URL did not return an HTML response.");
        }

        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            console.error("[Axios] Failed to fetch URL:", url, error.message);
        } else {
            console.error("[Axios] Unknown error occurred while fetching URL:", url, error);
        }
        throw new Error("Failed to fetch content with Axios.");
    }
};

/**
 * Fetch content from the URL using Puppeteer.
 */
export const fetchWithPuppeteer = async (url: string): Promise<string> => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });

        const page = await browser.newPage();
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        );
        await page.setExtraHTTPHeaders({
            "Accept-Language": "en-US,en;q=0.9",
        });

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 60000,
        });

        const html = await page.content();
        return html;
    } catch (error) {
        if (error instanceof Error) {
            console.error("[Puppeteer] Failed to fetch URL:", url, error.message);
        } else {
            console.error("[Puppeteer] Unknown error occurred while fetching URL:", url, error);
        }
        throw new Error("Failed to fetch content with Puppeteer.");
    } finally {
        if (browser) await browser.close();
    }
};

/**
 * Process the HTML content with Cheerio to extract metadata and text content.
 */
export const processContent = (htmlContent: string, url: string) => {
    const $ = cheerio.load(htmlContent);

    const metadata = {
        title: $("title").text() || null,
        description: $('meta[name="description"]').attr("content") || null,
        keywords: $('meta[name="keywords"]').attr("content") || null,
        ogTitle: $('meta[property="og:title"]').attr("content") || null,
        ogDescription: $('meta[property="og:description"]').attr("content") || null,
        ogImage: $('meta[property="og:image"]').attr("content") || null,
    };

    const textContent = $("body").text().trim();

    let favicon =
        $('link[rel="icon"]').attr("href") ||
        $('link[rel="shortcut icon"]').attr("href") ||
        null;

    if (favicon && !favicon.startsWith("http") && !favicon.startsWith("//")) {
        const urlObj = new URL(url);
        favicon = new URL(favicon, urlObj.origin).href;
    }

    return { metadata, textContent, favicon };
};

/**
 * Save the processed content into the MongoDB collection.
 * Automatically trigger metric processing after saving using Worker Pool.
 */
export const saveContentToDB = async (data: {
    userId: string;
    url: string;
    metadata: object;
    textContent: string;
    favicon: string | null;
    dynamic: boolean;
    htmlContent: string;
}) => {
    try {
        const savedContent = await Content.create(data);
        console.log("[Database] Scraped content saved successfully for:", data.url);

        console.log(`[Worker Pool] Triggering metric processing for URL: ${data.url}`);
        await triggerMetricProcessing(data.userId, data.url);

        return savedContent;
    } catch (error) {
        if (error instanceof Error) {
            console.error("[Database] Failed to save content for URL:", data.url, error.message);
        } else {
            console.error("[Database] Unknown error occurred while saving content for URL:", data.url, error);
        }
        throw new Error("Error saving content to database.");
    }
};
