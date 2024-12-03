// src/services/calculateMetrics.ts

export const calculateMetrics = (scrapedData: any) => {
    // --- SEO Metrics ---
    const seoMetrics = {
        actualTitle: scrapedData.metadata.title || null, // Include actual title in SEO section
        title: scrapedData.metadata.title || "Missing Title", // Use actual scraped title
        titleLength: calculateLength(scrapedData.metadata.title), // Length of the title
        actualMetaDescription: scrapedData.metadata.description || null, // Include actual meta-description in SEO section
        metaDescription: scrapedData.metadata.description || "Missing Meta Description", // Use actual scraped meta-description
        metaDescriptionLength: calculateLength(scrapedData.metadata.description), // Length of the meta-description
        headingsCount: countHeadings(scrapedData.htmlContent), // Number of headings
        seoFriendlyUrl: isSeoFriendlyUrl(scrapedData.url), // Whether URL is SEO-friendly
        faviconPresent: scrapedData.favicon ? true : false, // Whether a favicon is present
        faviconUrl: scrapedData.favicon || null, // Add favicon URL
        robotsTxtAccessible: isRobotsTxtAccessible(scrapedData.url), // Whether robots.txt is accessible
        inPageLinks: countInPageLinks(scrapedData.htmlContent), // Count of in-page links
        keywordsPresent: scrapedData.metadata.keywords || "No keywords found", // Keywords in metadata
    };

    // --- Security Metrics ---
    const securityMetrics = {
        https: scrapedData.url.startsWith("https"), // HTTPS enabled check
        mixedContent: hasMixedContent(scrapedData.htmlContent), // Mixed content check
        serverSignatureHidden: true, // Placeholder for server signature validation
        hstsEnabled: true, // Placeholder for HSTS validation
    };

    // --- Performance Metrics ---
    const performanceMetrics = {
        pageSizeKb: calculatePageSizeKb(scrapedData.htmlContent), // Page size in KB
        textCompressionEnabled: scrapedData.htmlContent.includes("Content-Encoding: gzip"), // Placeholder for text compression
        httpRequests: countHttpRequests(scrapedData.htmlContent), // Count of HTTP requests
    };

    // --- Miscellaneous Metrics ---
    const miscellaneousMetrics = {
        sitemap: isSitemapAccessible(scrapedData.url), // Sitemap accessibility check
        metaViewportPresent: scrapedData.htmlContent.includes('<meta name="viewport"'), // Meta viewport check
        characterSet: extractCharacterSet(scrapedData.htmlContent), // Character set extraction
        textToHtmlRatio: calculateTextToHtmlRatio(scrapedData.htmlContent, scrapedData.textContent), // Text-to-HTML ratio
    };

    // Return the calculated metrics, including raw title and meta description in the SEO section
    return {
        seo: seoMetrics,
        security: securityMetrics,
        performance: performanceMetrics,
        miscellaneous: miscellaneousMetrics,
    };
};

// --- Helper Functions (unchanged) ---

/**
 * Calculate the length of a given string.
 * If the input is null or undefined, returns 0.
 */
const calculateLength = (text: string | null | undefined): number => {
    if (!text) return 0;
    return text.trim().length;
};

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
        return true; // Placeholder for actual HTTP request logic
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
        return true; // Placeholder for actual HTTP request logic
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
