// src/services/calculateMetrics.ts

import { IContent } from "../models/ContentModel";

interface MetricResults {
    seo: {
        actualTitle: string | null;
        titlePresent: boolean;
        titleLength: number;
        actualMetaDescription: string | null;
        metaDescriptionPresent: boolean;
        metaDescriptionLength: number;
        headingsCount: number;
        contentKeywords: string[];
        seoFriendlyUrl: boolean;
        faviconPresent: boolean;
        faviconUrl: string | null;
        robotsTxtAccessible: boolean;
        inPageLinks: number;
        languageDeclared: boolean;
        hreflangTagPresent: boolean;
        h1TagCount: number;
        h1TagContent: string[];
        h2ToH6TagCount: number;
        h2ToH6TagContent: { tag: string; content: string }[];
        canonicalTagPresent: boolean;
        canonicalTagUrl: string | null;
        noindexTagPresent: boolean;
        noindexHeaderPresent: boolean;
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

export const calculateMetrics = (data: IContent): MetricResults => {
    const url = data.url;
    const htmlContent = data.htmlContent;

    const title = data.metadata.title || null;
    const metaDescription = data.metadata.description || null;

    const seoMetrics = {
        actualTitle: title,
        titlePresent: title !== null,
        titleLength: calculateLength(title),
        title: title || "Unknown Title",
        actualMetaDescription: metaDescription,
        metaDescriptionPresent: metaDescription !== null,
        metaDescriptionLength: calculateLength(metaDescription),
        metaDescription: metaDescription || "No Meta Description",
        headingsCount: (htmlContent.match(/<h[1-6]>/g) || []).length,
        contentKeywords: extractKeywords(htmlContent),
        seoFriendlyUrl: isSeoFriendlyUrl(url),
        faviconPresent: data.favicon !== null,
        faviconUrl: data.favicon || null,
        robotsTxtAccessible: isRobotsTxtAccessible(url),
        inPageLinks: (htmlContent.match(/<a /g) || []).length,
        languageDeclared: htmlContent.includes('<html lang='),
        keywordsPresent: extractKeywords(htmlContent).length > 0 ? "Yes" : "No",
        hreflangTagPresent: hasHreflangTag(htmlContent),
        h1TagCount: countH1Tags(htmlContent),
        h1TagContent: extractH1Content(htmlContent),
        h2ToH6TagCount: countH2ToH6Tags(htmlContent),
        h2ToH6TagContent: extractH2ToH6Content(htmlContent),

        // Canonical tag metrics
        canonicalTagPresent: hasCanonicalTag(htmlContent).present,
        canonicalTagUrl: hasCanonicalTag(htmlContent).url,
        noindexTagPresent: hasNoindexTag(htmlContent),

        noindexHeaderPresent: hasNoindexHeader(data.headers),
    };

    return {
        seo: seoMetrics,
        security: {
            httpsEnabled: url.startsWith("https://"),
            mixedContent: hasMixedContent(htmlContent),
            serverSignatureHidden: true,
            hstsEnabled: true,
        },
        performance: {
            pageSizeKb: Math.ceil(htmlContent.length / 1024),
            httpRequests: countHttpRequests(htmlContent),
            textCompressionEnabled: htmlContent.includes("Content-Encoding: gzip"),
        },
        miscellaneous: {
            metaViewportPresent: htmlContent.includes('<meta name="viewport"'),
            characterSet: extractCharacterSet(htmlContent),
            sitemapAccessible: isSitemapAccessible(url),
            textToHtmlRatio: calculateTextToHtmlRatio(htmlContent, data.textContent),
        },
    };
};

// --- Helper Functions ---

/**
 * Check if the hreflang tag is present in the HTML content.
 */
const hasHreflangTag = (htmlContent: string): boolean => {
    return /<link[^>]+rel=["']alternate["'][^>]+hreflang=["'][^"']+["']/i.test(htmlContent);
};

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

// Helper function to count the number of <h1> tags
const countH1Tags = (htmlContent: string): number => {
    return (htmlContent.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) || []).length;
};

// Helper function to extract the content of all <h1> tags
const extractH1Content = (htmlContent: string): string[] => {
    const matches = htmlContent.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    return matches.map((h1Tag) => h1Tag.replace(/<[^>]+>/g, "").trim());
};

// Helper function to count <h2> to <h6> tags
const countH2ToH6Tags = (htmlContent: string): number => {
    return (htmlContent.match(/<h[2-6]\b[^>]*>/gi) || []).length;
};

// Helper function to extract content of <h2> to <h6> tags
const extractH2ToH6Content = (htmlContent: string): { tag: string; content: string }[] => {
    const matches = htmlContent.match(/<(h[2-6])\b[^>]*>([\s\S]*?)<\/\1>/gi) || [];
    return matches.map((headingTag) => {
        const tagMatch = headingTag.match(/<(h[2-6])/i); // Extract tag name (e.g., h2, h3)
        const tagName = tagMatch ? tagMatch[1] : "unknown";
        const textContent = headingTag.replace(/<[^>]+>/g, "").trim(); // Extract inner content
        return { tag: tagName, content: textContent };
    });
};

/**
 * Check if a canonical tag is present and extract its URL.
 */
const hasCanonicalTag = (htmlContent: string): { present: boolean; url: string | null } => {
    const match = htmlContent.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    if (match && match[1]) {
        return { present: true, url: match[1] };
    }
    return { present: false, url: null };
};


/**
 * Check if a noindex tag is present in the HTML content.
 */
const hasNoindexTag = (htmlContent: string): boolean => {
    return /<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["']/i.test(htmlContent);
};


/**
 * Check if an X-Robots-Tag header is present.
 */
const hasNoindexHeader = (headers?: Record<string, string | undefined>): boolean => {
    if (!headers) return false; // Gracefully handle missing headers
    const xRobotsTag = headers["x-robots-tag"];
    if (xRobotsTag) {
        return /noindex/i.test(xRobotsTag);
    }
    return false;
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
