// src/services/helpers/MiscellaneousHelpers.ts

/**
 * Check if a <meta name="viewport"> tag is present in the HTML content.
 * - Uses a regex to handle variations in spacing and case sensitivity.
 * - Returns false if HTML content is empty or invalid.
 */
export const isMetaViewportPresent = (htmlContent: string): boolean => {
    if (!htmlContent) {
        console.warn("[MiscellaneousHelpers] HTML content is empty or undefined.");
        return false;
    }

    const viewportRegex = /<meta\s+name=["']viewport["'][^>]*>/i;
    return viewportRegex.test(htmlContent);
};

/**
 * Extract the character set declared in the HTML <meta charset> tag.
 * - Supports both `<meta charset="UTF-8">` and `<meta http-equiv="Content-Type">` formats.
 * - Returns null if no charset is found or the HTML content is invalid.
 */
export const extractCharacterSet = (htmlContent: string): string | null => {
    if (!htmlContent) {
        console.warn("[MiscellaneousHelpers] HTML content is empty or undefined.");
        return null;
    }

    const charsetRegex = /<meta[^>]+charset=["']?([^"'>\s]+)/i;
    const match = htmlContent.match(charsetRegex);

    if (match && match[1]) {
        console.info(`[MiscellaneousHelpers] Character set extracted: ${match[1]}`);
        return match[1];
    }

    console.warn("[MiscellaneousHelpers] No character set found in the HTML content.");
    return null;
};

/**
 * Check if the sitemap is accessible by constructing its URL and sending a HEAD request.
 * - First checks for `/sitemap.xml` and `/sitemap-index.xml`.
 * - If neither is accessible, parses `robots.txt` to find `Sitemap:` directives.
 */
export const isSitemapAccessible = async (url: string): Promise<boolean> => {
    try {
        const parsedUrl = new URL(url); // Validate the base URL
        const baseOrigin = parsedUrl.origin;

        // Check standard sitemap locations
        const sitemapUrls = [
            new URL("/sitemap.xml", baseOrigin).href,
            new URL("/sitemap-index.xml", baseOrigin).href,
        ];

        for (const sitemapUrl of sitemapUrls) {
            if (await isUrlAccessible(sitemapUrl)) {
                console.info(`[MiscellaneousHelpers] Sitemap is accessible at: ${sitemapUrl}`);
                return true;
            }
        }

        // Fallback: Check robots.txt for Sitemap directives
        const robotsTxtUrl = new URL("/robots.txt", baseOrigin).href;
        const sitemapUrlsFromRobots = await parseSitemapsFromRobots(robotsTxtUrl);

        for (const sitemapUrl of sitemapUrlsFromRobots) {
            if (await isUrlAccessible(sitemapUrl)) {
                console.info(`[MiscellaneousHelpers] Sitemap found in robots.txt and accessible: ${sitemapUrl}`);
                return true;
            }
        }

        console.warn("[MiscellaneousHelpers] No accessible sitemap found.");
        return false;
    } catch (error) {
        console.error(`[MiscellaneousHelpers] Error checking sitemap accessibility for URL: ${url}`, error);
        return false;
    }
};

/**
 * Helper function to check if a URL is accessible by sending a HEAD request.
 */
const isUrlAccessible = async (url: string): Promise<boolean> => {
    try {
        const response = await fetch(url, { method: "HEAD" });
        return response.ok;
    } catch (error) {
        console.error(`[MiscellaneousHelpers] Error accessing URL: ${url}`, error);
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

        if (!response.ok) {
            console.warn(`[MiscellaneousHelpers] Robots.txt not accessible: ${robotsTxtUrl}. Status: ${response.status}`);
            return [];
        }

        const robotsTxtContent = await response.text();
        const sitemapUrls: string[] = [];

        // Regex to extract Sitemap directives
        const sitemapRegex = /^sitemap:\s*(.+)$/gim;
        let match;

        while ((match = sitemapRegex.exec(robotsTxtContent)) !== null) {
            sitemapUrls.push(match[1].trim());
        }

        if (sitemapUrls.length > 0) {
            console.info(`[MiscellaneousHelpers] Sitemaps found in robots.txt: ${sitemapUrls}`);
        } else {
            console.warn("[MiscellaneousHelpers] No Sitemap directives found in robots.txt.");
        }

        return sitemapUrls;
    } catch (error) {
        console.error(`[MiscellaneousHelpers] Error parsing robots.txt: ${robotsTxtUrl}`, error);
        return [];
    }
};

/**
 * Calculate the text-to-HTML ratio.
 * - Ensures no division by zero by handling empty or invalid HTML content.
 * - Returns a ratio between 0 and 1.
 */
export const calculateTextToHtmlRatio = (htmlContent: string, textContent: string | null): number => {
    if (!htmlContent) {
        console.warn("[MiscellaneousHelpers] HTML content is empty or undefined.");
        return 0;
    }

    const htmlLength = htmlContent.length;
    const textLength = textContent?.length || 0;

    const ratio = textLength / htmlLength;

    console.info(`[MiscellaneousHelpers] Text-to-HTML ratio calculated: ${ratio.toFixed(2)}`);
    return parseFloat(ratio.toFixed(2)); // Round to 2 decimal places for precision
};
