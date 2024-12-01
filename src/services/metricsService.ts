// src/services/metricsService.ts

import { IContent } from "../models/ContentModel"; // Import the correct type

interface MetricResults {
    seo: {
        titlePresent: boolean;
        metaDescriptionPresent: boolean;
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
    const titlePresent = htmlContent.includes("<title>") && htmlContent.includes("</title>");
    const metaDescriptionPresent = htmlContent.includes('<meta name="description"');
    const headingsCount = (htmlContent.match(/<h[1-6]>/g) || []).length;
    const contentKeywords = extractKeywords(htmlContent); // Custom logic to extract keywords
    const seoFriendlyUrl = isSeoFriendlyUrl(url);
    const faviconPresent = data.favicon !== null;
    const robotsTxtAccessible = isRobotsTxtAccessible(url);
    const inPageLinks = (htmlContent.match(/<a /g) || []).length;
    const languageDeclared = htmlContent.includes('<html lang=');

    // --- Security Metrics ---
    const httpsEnabled = url.startsWith("https://");
    const mixedContent = hasMixedContent(htmlContent);
    const serverSignatureHidden = true; // Assume server signature is hidden; customize this based on actual check
    const hstsEnabled = true; // Assume HSTS is enabled; requires actual server header validation

    // --- Performance Metrics ---
    const pageSizeKb = Math.ceil(htmlContent.length / 1024); // Rough page size in KB
    const httpRequests = countHttpRequests(htmlContent); // Custom function to count HTTP requests
    const textCompressionEnabled = htmlContent.includes("Content-Encoding: gzip");

    // --- Miscellaneous Metrics ---
    const metaViewportPresent = htmlContent.includes('<meta name="viewport"');
    const characterSet = extractCharacterSet(htmlContent); // Extract charset from <meta> tag
    const sitemapAccessible = isSitemapAccessible(url);
    const textToHtmlRatio = calculateTextToHtmlRatio(htmlContent, data.textContent);

    return {
        seo: {
            titlePresent,
            metaDescriptionPresent,
            headingsCount,
            contentKeywords,
            seoFriendlyUrl,
            faviconPresent,
            robotsTxtAccessible,
            inPageLinks,
            languageDeclared,
        },
        security: {
            httpsEnabled,
            mixedContent,
            serverSignatureHidden,
            hstsEnabled,
        },
        performance: {
            pageSizeKb,
            httpRequests,
            textCompressionEnabled,
        },
        miscellaneous: {
            metaViewportPresent,
            characterSet,
            sitemapAccessible,
            textToHtmlRatio,
        },
    };
};

/**
 * Extract keywords from the content.
 */
const extractKeywords = (htmlContent: string): string[] => {
    const metaTag = htmlContent.match(/<meta name="keywords" content="([^"]+)"/);
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
 * Count the number of HTTP requests on the page.
 */
const countHttpRequests = (htmlContent: string): number => {
    const links = (htmlContent.match(/<link /g) || []).length;
    const scripts = (htmlContent.match(/<script /g) || []).length;
    const images = (htmlContent.match(/<img /g) || []).length;
    return links + scripts + images;
};

/**
 * Extract character set from the HTML.
 */
const extractCharacterSet = (htmlContent: string): string | null => {
    const charsetMatch = htmlContent.match(/<meta charset="([^"]+)"/);
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
 * Calculate text-to-HTML ratio.
 */
const calculateTextToHtmlRatio = (htmlContent: string, textContent: string | null): number => {
    const htmlLength = htmlContent.length;
    const textLength = textContent?.length || 0;
    return textLength / htmlLength;
};
