// src/services/helpers/MiscellaneousHelpers.ts

import fetch from "cross-fetch";

/**
 * Check if a <meta name="viewport"> tag is present in the HTML content.
 * - Handles edge cases like attribute order, self-closing tags, and extra whitespace.
 * - Returns false if HTML content is empty or invalid.
 * @param htmlContent - The HTML content of the webpage as a string.
 * @returns `true` if a <meta name="viewport"> tag is present, `false` otherwise.
 */
export const isMetaViewportPresent = (htmlContent: string): boolean => {
    if (!htmlContent || typeof htmlContent !== "string") {
        console.warn("[isMetaViewportPresent] Invalid or empty HTML content provided.");
        return false;
    }

    // Trim unnecessary whitespaces and check for quick elimination
    const cleanedHtml = htmlContent.trim();
    if (!cleanedHtml.includes("viewport")) return false; // Quick check before regex

    // Robust regex to match <meta> tags with name="viewport" (order-insensitive)
    const viewportRegex = /<meta\b[^>]*\bname=["']viewport["'][^>]*>/i;

    // Test the regex against the cleaned HTML
    const isViewportPresent = viewportRegex.test(cleanedHtml);

    if (!isViewportPresent) {
        console.warn("[isMetaViewportPresent] No <meta name='viewport'> tag found.");
    }

    return isViewportPresent;
};


/**
 * Extract the character set declared in the HTML <meta charset> or <meta http-equiv="Content-Type"> tag.
 * - Supports `<meta charset="UTF-8">` and `<meta http-equiv="Content-Type" content="...charset=UTF-8">` formats.
 * - Handles variations in spacing, attribute order, and case sensitivity.
 * - Returns null if no charset is found or if the HTML content is invalid.
 * @param htmlContent - The HTML content as a string.
 * @returns The extracted character set (e.g., "UTF-8") or null if not found.
 */
export const extractCharacterSet = (htmlContent: string): string | null => {
    if (!htmlContent || typeof htmlContent !== "string") {
        console.warn("[extractCharacterSet] Invalid or empty HTML content provided.");
        return null;
    }

    // Clean and trim unnecessary whitespaces
    const cleanedHtml = htmlContent.trim();

    // Early exit if neither "charset" nor "Content-Type" is in the content
    if (!cleanedHtml.includes("charset") && !cleanedHtml.includes("Content-Type")) {
        console.warn("[extractCharacterSet] No charset-related meta tags found.");
        return null;
    }

    // Regex to match <meta charset="..."> (direct charset declaration)
    const charsetRegex = /<meta[^>]*\bcharset=["']?([^"'>\s]+)/i;

    // Regex to match <meta http-equiv="Content-Type" content="text/html; charset=..."> (Content-Type declaration)
    const httpEquivCharsetRegex = /<meta[^>]*\bhttp-equiv=["']?Content-Type["'][^>]*\bcontent=["'][^"'>]*charset=([^"'>\s]+)/i;

    // Attempt to match <meta charset="...">
    const directMatch = cleanedHtml.match(charsetRegex);
    if (directMatch && directMatch[1]) {
        console.info(`[extractCharacterSet] Character set found: ${directMatch[1]}`);
        return directMatch[1];
    }

    // Attempt to match <meta http-equiv="Content-Type" content="...charset=...">
    const httpEquivMatch = cleanedHtml.match(httpEquivCharsetRegex);
    if (httpEquivMatch && httpEquivMatch[1]) {
        console.info(`[extractCharacterSet] Character set found via http-equiv: ${httpEquivMatch[1]}`);
        return httpEquivMatch[1];
    }

    console.warn("[extractCharacterSet] No valid character set found in the meta tags.");
    return null;
};


/**
 * Check if the sitemap is accessible by constructing its URL and sending a HEAD request.
 * - First checks for `/sitemap.xml` and `/sitemap-index.xml`.
 * - If neither is accessible, parses `robots.txt` to find `Sitemap:` directives.
 */
export const isSitemapAccessible = async (url: string): Promise<boolean> => {
    try {
        const baseOrigin = new URL(url).origin;

        // Standard sitemap locations
        const sitemapUrls = [
            `${baseOrigin}/sitemap.xml`,
            `${baseOrigin}/sitemap-index.xml`,
        ];

        // Check each standard location
        for (const sitemapUrl of sitemapUrls) {
            if (await isUrlAccessible(sitemapUrl)) return true;
        }

        // Fallback: Check robots.txt for sitemap directives
        const robotsTxtUrl = `${baseOrigin}/robots.txt`;
        const sitemapsFromRobots = await parseSitemapsFromRobots(robotsTxtUrl);

        // Check sitemap URLs from robots.txt
        for (const sitemapUrl of sitemapsFromRobots) {
            if (await isUrlAccessible(sitemapUrl)) return true;
        }

        return false;
    } catch {
        return false;
    }
};


/**
 * Helper function to check if a URL is accessible via a HEAD request.
 * - Validates the URL format before making a request.
 * - Handles errors gracefully and logs failures for debugging.
 * - Includes a timeout mechanism to avoid hanging on unresponsive servers.
 * @param url - The URL to check for accessibility.
 * @param timeoutMs - Timeout in milliseconds (default: 5000ms).
 * @returns A promise that resolves to true if the URL is accessible, false otherwise.
 */
const isUrlAccessible = async (url: string, timeoutMs = 5000): Promise<boolean> => {
    // Validate the URL format
    try {
        new URL(url); // Throws an error if the URL is invalid
    } catch (error) {
        console.error(`[isUrlAccessible] Invalid URL: ${url}`);
        return false;
    }

    // Create an AbortController for the timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        // Attempt a HEAD request to check URL accessibility
        const response = await fetch(url, { method: "HEAD", signal: controller.signal });

        // Clear the timeout if the request succeeds
        clearTimeout(timeoutId);

        if (response.ok) {
            return true; // URL is accessible
        }

        // Optionally log non-2xx/3xx responses
        console.warn(`[isUrlAccessible] URL responded with status: ${response.status}`);
        return false;
    } catch (error) {
        // Narrow the type of `error` to check its properties
        if (error instanceof DOMException && error.name === "AbortError") {
            console.error(`[isUrlAccessible] Request timed out after ${timeoutMs}ms: ${url}`);
        } else {
            console.error(`[isUrlAccessible] Error checking URL: ${url}`, error);
        }

        return false;
    }
};


/**
 * Parse the robots.txt file to extract sitemap URLs.
 * - Fetches the robots.txt file and looks for `Sitemap:` directives.
 */
const parseSitemapsFromRobots = async (robotsTxtUrl: string): Promise<string[]> => {
    try {
        const response = await fetch(robotsTxtUrl);

        if (!response.ok) return [];

        const robotsTxtContent = await response.text();
        const sitemapRegex = /^sitemap:\s*(.+)$/gim;

        return Array.from(robotsTxtContent.matchAll(sitemapRegex), match => match[1].trim());
    } catch {
        return [];
    }
};

/**
 * Calculate the text-to-HTML ratio.
 * - Ensures valid input for both HTML and text content.
 * - Handles edge cases like empty or malformed HTML content.
 * - Returns a ratio between 0 and 1, rounded to two decimal places.
 * @param htmlContent - The raw HTML content as a string.
 * @param textContent - The extracted text content from the HTML.
 * @returns A ratio between 0 and 1 (text length divided by HTML length), or 0 for invalid inputs.
 */
export const calculateTextToHtmlRatio = (htmlContent: string, textContent: string | null): number => {
    // Validate input
    if (!htmlContent || typeof htmlContent !== "string") {
        console.warn("[calculateTextToHtmlRatio] Invalid or empty HTML content.");
        return 0;
    }

    if (typeof textContent !== "string" && textContent !== null) {
        console.warn("[calculateTextToHtmlRatio] Invalid text content provided.");
        return 0;
    }

    // Calculate lengths
    const htmlLength = htmlContent.trim().length; // Trim to exclude excessive whitespace
    const textLength = textContent?.trim().length || 0;

    // Handle edge cases
    if (htmlLength === 0) {
        console.warn("[calculateTextToHtmlRatio] HTML content is empty after trimming.");
        return 0;
    }

    // Calculate the ratio
    const ratio = textLength / htmlLength;

    // Ensure the ratio is between 0 and 1, and round to 2 decimal places
    return Math.min(1, Math.max(0, parseFloat(ratio.toFixed(2))));
};

