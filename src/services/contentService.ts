// src/services/contentService.ts

import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import { Content } from "../models/ContentModel"; // Import the Mongoose model
import { triggerMetricProcessing } from "./workerService"; // Import Worker Thread trigger function

/**
 * Fetch content from the URL using Axios.
 */
export const fetchWithAxios = async (url: string): Promise<string> => {
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
};

/**
 * Fetch content from the URL using Puppeteer.
 */
export const fetchWithPuppeteer = async (url: string): Promise<string> => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    try {
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

        await page.waitForSelector("body", { timeout: 60000 });
        const html = await page.content();

        await browser.close();
        return html;
    } catch (error) {
        console.error("Puppeteer Error Details:", error);
        await browser.close();
        throw error;
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

    let favicon = $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href") || null;

    if (favicon && !favicon.startsWith("http") && !favicon.startsWith("//")) {
        const urlObj = new URL(url);
        favicon = new URL(favicon, urlObj.origin).href;
    }

    return { metadata, textContent, favicon };
};

/**
 * Save the processed content into the MongoDB collection.
 * Automatically trigger metric processing after saving.
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
        // Save scraped content to the database
        const savedContent = await Content.create(data);
        console.log("[Database] Scraped content saved successfully:", savedContent);

        // Trigger Worker Thread for metric processing
        console.log(`[Worker] Triggering metric processing for URL: ${data.url}`);
        triggerMetricProcessing(data.userId, data.url);

        return savedContent;
    } catch (error) {
        console.error("[Database] Failed to save content:", error);
        throw new Error("Error saving content to database");
    }
};
