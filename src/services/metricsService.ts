// src/services/metricsService.ts 

import { IContent } from "../models/ContentModel"; // Import the correct type

interface MetricResults {
    seo: {
        actualTitle: string | null; // Add the actual scraped title
        titlePresent: boolean;
        titleLength: number; // Title length
        actualMetaDescription: string | null; // Add the actual scraped meta-description
        metaDescriptionPresent: boolean;
        metaDescriptionLength: number; // Meta description length
        headingsCount: number;
        contentKeywords: string[];
        seoFriendlyUrl: boolean;
        faviconPresent: boolean;
        robotsTxtAccessible: boolean;
        inPageLinks: number;
        languageDeclared: boolean;
    };
    security: {
        httpsEnabled: boolean;
        mixedContent: boolean;
        serverSignatureHidden: boolean;
        hstsEnabled: boolean;
    };
    performance: {
        pageSizeKb: number;
        httpRequests: number;
        textCompressionEnabled: boolean;
    };
    miscellaneous: {
        metaViewportPresent: boolean;
        characterSet: string | null;
        sitemapAccessible: boolean;
        textToHtmlRatio: number;
    };
}

/**
 * Calculate metrics for a single scraped data object.
 */
export const calculateMetrics = (data: IContent): MetricResults => {
    const url = data.url;
    const htmlContent = data.htmlContent;

    // --- SEO Metrics ---
    const title = data.metadata.title || null; // Extract the actual title
    const metaDescription = data.metadata.description || null; // Extract the actual meta-description

    const seoMetrics = {
        actualTitle: title, // Include the actual scraped title
        titlePresent: title !== null, // Check if title is present
        titleLength: calculateLength(title), // Calculate title length
        actualMetaDescription: metaDescription, // Include the actual scraped meta-description
        metaDescriptionPresent: metaDescription !== null, // Check if meta-description is present
        metaDescriptionLength: calculateLength(metaDescription), // Calculate meta-description length
        headingsCount: (htmlContent.match(/<h[1-6]>/g) || []).length, // Count headings
        contentKeywords: extractKeywords(htmlContent), // Extract keywords
        seoFriendlyUrl: isSeoFriendlyUrl(url), // Check if URL is SEO-friendly
        faviconPresent: data.favicon !== null, // Check if favicon is present
        robotsTxtAccessible: isRobotsTxtAccessible(url), // Check robots.txt accessibility
        inPageLinks: (htmlContent.match(/<a /g) || []).length, // Count in-page links
        languageDeclared: htmlContent.includes('<html lang='), // Check if language is declared
    };

    // --- Security Metrics ---
    const securityMetrics = {
        httpsEnabled: url.startsWith("https://"), // Check if HTTPS is enabled
        mixedContent: hasMixedContent(htmlContent), // Check for mixed content
        serverSignatureHidden: true, // Placeholder for server signature validation
        hstsEnabled: true, // Placeholder for HSTS validation
    };

    // --- Performance Metrics ---
    const performanceMetrics = {
        pageSizeKb: Math.ceil(htmlContent.length / 1024), // Calculate page size in KB
        httpRequests: countHttpRequests(htmlContent), // Count HTTP requests
        textCompressionEnabled: htmlContent.includes("Content-Encoding: gzip"), // Placeholder for text compression
    };

    // --- Miscellaneous Metrics ---
    const miscellaneousMetrics = {
        metaViewportPresent: htmlContent.includes('<meta name="viewport"'), // Check if meta viewport is present
        characterSet: extractCharacterSet(htmlContent), // Extract character set
        sitemapAccessible: isSitemapAccessible(url), // Check if sitemap is accessible
        textToHtmlRatio: calculateTextToHtmlRatio(htmlContent, data.textContent), // Calculate text-to-HTML ratio
    };

    return {
        seo: seoMetrics,
        security: securityMetrics,
        performance: performanceMetrics,
        miscellaneous: miscellaneousMetrics,
    };
};

// --- Helper Functions ---

/**
 * Calculate the length of a given string.
 * If the input is null or undefined, returns 0.
 */
const calculateLength = (text: string | null | undefined): number => {
    if (!text) return 0;
    return text.trim().length;
};

/**
 * Extract keywords from the meta tag in the HTML content.
 */
const extractKeywords = (htmlContent: string): string[] => {
    const metaTag = htmlContent.match(/<meta name="keywords" content="([^"]+)"/i);
    if (metaTag && metaTag[1]) {
        return metaTag[1].split(",").map((keyword) => keyword.trim());
    }
    return [];
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
    } catch {
        return false;
    }
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
 * Count the number of HTTP requests in the HTML content.
 */
const countHttpRequests = (htmlContent: string): number => {
    const links = (htmlContent.match(/<link /g) || []).length;
    const scripts = (htmlContent.match(/<script /g) || []).length;
    const images = (htmlContent.match(/<img /g) || []).length;
    return links + scripts + images;
};

/**
 * Extract the character set from the HTML content.
 */
const extractCharacterSet = (htmlContent: string): string | null => {
    const charsetMatch = htmlContent.match(/<meta charset="([^"]+)"/i);
    return charsetMatch ? charsetMatch[1] : null;
};

/**
 * Check if the sitemap is accessible.
 */
const isSitemapAccessible = (url: string): boolean => {
    try {
        const sitemapUrl = new URL("/sitemap.xml", url).href;
        return true; // Placeholder for actual HTTP request logic
    } catch {
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
