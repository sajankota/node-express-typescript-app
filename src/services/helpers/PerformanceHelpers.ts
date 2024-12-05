// src/services/helpers/PerformanceHelpers.ts

/**
 * Calculate the size of the HTML content in kilobytes (KB).
 * - Includes fallback handling for empty or invalid input.
 * - Reports size to 2 decimal places for accuracy.
 */
export const calculatePageSize = (htmlContent: string): number => {
    if (!htmlContent) {
        console.warn("[PerformanceHelpers] HTML content is empty or undefined.");
        return 0;
    }

    const sizeInBytes = new TextEncoder().encode(htmlContent).length; // Accurate byte length
    return parseFloat((sizeInBytes / 1024).toFixed(2)); // Convert to KB with 2 decimal places
};

/**
 * Count the number of HTTP requests triggered by the HTML content.
 * - Processes HTML in a single regex pass to extract <link>, <script>, and <img> tags.
 * - Returns a breakdown of counts by resource type as well as the total.
 */
export const countHttpRequests = (htmlContent: string): {
    total: number;
    links: number;
    scripts: number;
    images: number;
} => {
    if (!htmlContent) {
        console.warn("[PerformanceHelpers] HTML content is empty or undefined.");
        return { total: 0, links: 0, scripts: 0, images: 0 };
    }

    // Use a single regex to capture all resource tags in one pass
    const matches = htmlContent.match(/<(link|script|img)\b[^>]*>/gi) || [];
    let links = 0,
        scripts = 0,
        images = 0;

    for (const match of matches) {
        if (match.startsWith("<link")) links++;
        else if (match.startsWith("<script")) scripts++;
        else if (match.startsWith("<img")) images++;
    }

    const total = links + scripts + images;

    return { total, links, scripts, images };
};

/**
 * Check if text compression (e.g., gzip) is enabled.
 * - Works with HTTP response headers, not the HTML content itself.
 * - Returns false if headers are missing or incomplete.
 */
export const isTextCompressionEnabled = (headers?: Record<string, string | undefined>): boolean => {
    if (!headers) {
        console.warn("[PerformanceHelpers] Headers are undefined or missing.");
        return false;
    }

    const encoding = headers["content-encoding"] || "";
    const isCompressed = /gzip|br|deflate/i.test(encoding); // Match common compression algorithms

    if (!isCompressed) {
        console.info("[PerformanceHelpers] Text compression is not enabled.");
    }

    return isCompressed;
};
