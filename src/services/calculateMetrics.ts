// src/services/calculateMetrics.ts

// src/services/calculateMetrics.ts

export const calculateMetrics = (scrapedData: any) => {
    // --- SEO Metrics ---
    const seoMetrics = {
        title: scrapedData.metadata.title || "Missing Title",
        metaDescription: scrapedData.metadata.description || "Missing Meta Description",
        headingsCount: countHeadings(scrapedData.htmlContent),
        seoFriendlyUrl: isSeoFriendlyUrl(scrapedData.url),
        faviconPresent: scrapedData.favicon ? true : false,
        robotsTxtAccessible: isRobotsTxtAccessible(scrapedData.url),
        inPageLinks: countInPageLinks(scrapedData.htmlContent),
        keywordsPresent: scrapedData.metadata.keywords || "No keywords found",
    };

    // --- Security Metrics ---
    const securityMetrics = {
        https: scrapedData.url.startsWith("https"),
        mixedContent: hasMixedContent(scrapedData.htmlContent),
        serverSignatureHidden: true, // Placeholder, requires server-side header validation
        hstsEnabled: true, // Placeholder, requires server-side header validation
    };

    // --- Performance Metrics ---
    const performanceMetrics = {
        pageSizeKb: calculatePageSizeKb(scrapedData.htmlContent),
        textCompressionEnabled: scrapedData.htmlContent.includes("Content-Encoding: gzip"), // Placeholder
        httpRequests: countHttpRequests(scrapedData.htmlContent),
    };

    // --- Miscellaneous Metrics ---
    const miscellaneousMetrics = {
        sitemap: isSitemapAccessible(scrapedData.url),
        metaViewportPresent: scrapedData.htmlContent.includes('<meta name="viewport"'),
        characterSet: extractCharacterSet(scrapedData.htmlContent),
        textToHtmlRatio: calculateTextToHtmlRatio(scrapedData.htmlContent, scrapedData.textContent),
    };

    // Return the calculated metrics
    return {
        seo: seoMetrics,
        security: securityMetrics,
        performance: performanceMetrics,
        miscellaneous: miscellaneousMetrics,
    };
};

// --- Helper Functions ---

/**
 * Count the number of headings (H1-H6) in the HTML content.
 */
const countHeadings = (htmlContent: string): number => {
    return (htmlContent.match(/<h[1-6]>/g) || []).length;
};

/**
 * Check if the URL is SEO-friendly.
 */
const isSeoFriendlyUrl = (url: string): boolean => {
    const seoFriendlyPattern = /^[a-z0-9-]+$/i;
    const urlPath = new URL(url).pathname.split("/").filter((part) => part.length > 0);
    return urlPath.every((segment) => seoFriendlyPattern.test(segment));
};

/**
 * Check if the robots.txt file is accessible.
 */
const isRobotsTxtAccessible = (url: string): boolean => {
    try {
        const robotsTxtUrl = new URL("/robots.txt", url).href;
        // Actual HTTP request logic to check robots.txt can be implemented here
        // For now, we return `true` as a placeholder
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Count the number of in-page links (anchor tags) in the HTML content.
 */
const countInPageLinks = (htmlContent: string): number => {
    return (htmlContent.match(/<a /g) || []).length;
};

/**
 * Check for mixed content on the page.
 */
const hasMixedContent = (htmlContent: string): boolean => {
    const httpLinks = (htmlContent.match(/http:\/\//g) || []).length;
    const httpsLinks = (htmlContent.match(/https:\/\//g) || []).length;
    return httpLinks > 0 && httpsLinks > 0;
};

/**
 * Calculate the page size in kilobytes (KB).
 */
const calculatePageSizeKb = (htmlContent: string): number => {
    return Math.ceil(htmlContent.length / 1024); // Convert bytes to KB
};

/**
 * Count the number of HTTP requests (e.g., for scripts, images, links) in the HTML content.
 */
const countHttpRequests = (htmlContent: string): number => {
    const links = (htmlContent.match(/<link /g) || []).length;
    const scripts = (htmlContent.match(/<script /g) || []).length;
    const images = (htmlContent.match(/<img /g) || []).length;
    return links + scripts + images;
};

/**
 * Extract the character set from the HTML content (e.g., UTF-8).
 */
const extractCharacterSet = (htmlContent: string): string | null => {
    const match = htmlContent.match(/<meta charset="([^"]+)"/);
    return match ? match[1] : null;
};

/**
 * Check if the sitemap is accessible.
 */
const isSitemapAccessible = (url: string): boolean => {
    try {
        const sitemapUrl = new URL("/sitemap.xml", url).href;
        // Actual HTTP request logic to check sitemap can be implemented here
        // For now, we return `true` as a placeholder
        return true;
    } catch (error) {
        return false;
    }
};

/**
 * Calculate the text-to-HTML ratio.
 */
const calculateTextToHtmlRatio = (htmlContent: string, textContent: string | null): number => {
    const htmlLength = htmlContent.length;
    const textLength = textContent?.length || 0;
    return textLength / htmlLength;
};
