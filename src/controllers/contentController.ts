// src/controllers/contentController.ts

import { Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio"; // Import Cheerio
import puppeteer from "puppeteer";

/**
 * Controller to fetch and extract content & metadata from a URL
 */
export const getContent = async (req: Request, res: Response): Promise<void> => {
    const { url } = req.query;

    // Validate the URL query parameter
    if (!url || typeof url !== "string") {
        res.status(400).json({ error: "Invalid or missing 'url' query parameter" });
        return;
    }

    /**
     * Function to scrape a page with Puppeteer
     */
    const scrapeWithPuppeteer = async (url: string): Promise<string> => {
        const browser = await puppeteer.launch({
            headless: true,
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
        });
        const page = await browser.newPage();

        try {
            // Set headers to bypass anti-bot detection
            await page.setUserAgent(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            );
            await page.setExtraHTTPHeaders({
                "Accept-Language": "en-US,en;q=0.9",
            });

            // Navigate to the URL with proper timeout and wait conditions
            await page.goto(url, {
                waitUntil: "networkidle2",
                timeout: 60000, // Increased timeout
            });

            // Wait for the body element to ensure dynamic content is loaded
            await page.waitForSelector("body", { timeout: 60000 });

            // Get the fully-rendered HTML
            const html = await page.content();

            await browser.close();
            return html;
        } catch (error) {
            console.error("Puppeteer Error Details:", error); // Log the error
            await browser.close();
            throw error;
        }
    };


    /**
     * Function to determine if Puppeteer is needed
     */
    const requiresPuppeteer = ($: cheerio.CheerioAPI): boolean => {
        const bodyContent = $("body").text().trim();
        const hasEmptyBody = !bodyContent || bodyContent.length < 50; // Check if body content is empty or too short
        const hasPlaceholders = $("noscript").length > 0 || $("div").hasClass("loading") || $("div").hasClass("spinner");

        return hasEmptyBody || hasPlaceholders;
    };

    try {
        let htmlContent: string;

        // Step 1: Attempt to scrape with Axios + Cheerio
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });

        if (!response.headers["content-type"]?.includes("text/html")) {
            throw new Error("The provided URL did not return an HTML response.");
        }

        htmlContent = response.data;

        // Step 2: Load HTML into Cheerio for initial parsing
        let $ = cheerio.load(htmlContent);

        // Step 3: Check if Puppeteer is required
        if (requiresPuppeteer($)) {
            console.log("Switching to Puppeteer as Cheerio could not extract meaningful content...");
            htmlContent = await scrapeWithPuppeteer(url);
            $ = cheerio.load(htmlContent); // Reload with Cheerio
        }

        // Extract metadata
        const metadata = {
            title: $("title").text() || null,
            description: $('meta[name="description"]').attr("content") || null,
            keywords: $('meta[name="keywords"]').attr("content") || null,
            ogTitle: $('meta[property="og:title"]').attr("content") || null,
            ogDescription: $('meta[property="og:description"]').attr("content") || null,
            ogImage: $('meta[property="og:image"]').attr("content") || null,
        };

        // Extract text content
        const textContent = $("body").text().trim();

        // Check for favicon
        let favicon = $('link[rel="icon"]').attr("href") || $('link[rel="shortcut icon"]').attr("href") || null;

        // Resolve relative favicon URLs to absolute URLs
        if (favicon && !favicon.startsWith("http") && !favicon.startsWith("//")) {
            const urlObj = new URL(url);
            favicon = new URL(favicon, urlObj.origin).href;
        }

        res.status(200).json({
            url,
            metadata,
            favicon,
            textContent,
            dynamic: htmlContent !== response.data, // Indicate if Puppeteer was used
        });
    } catch (error) {
        // Handle errors gracefully
        console.error("Error while fetching content:", error);

        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        res.status(500).json({
            error: "Failed to fetch content from the provided URL",
            details: errorMessage,
        });
    }
};