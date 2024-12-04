// src/services/calculateMetrics.ts

import { IContent } from "../models/ContentModel";
import * as SEOHelpers from "./helpers/SEOHelpers";
import * as SecurityHelpers from "./helpers/SecurityHelpers";
import * as PerformanceHelpers from "./helpers/PerformanceHelpers";
import * as MiscellaneousHelpers from "./helpers/MiscellaneousHelpers";

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
        languageDeclared: string | null;
        hreflangTagPresent: string[];
        h1TagCount: number;
        h1TagContent: string[];
        h2ToH6TagCount: number;
        h2ToH6TagContent: { tag: string; content: string }[];
        canonicalTagPresent: boolean;
        canonicalTagUrl: string | null;
        noindexTagPresent: boolean;
        noindexHeaderPresent: boolean;
        keywordsPresent: string;
    };
    security: {
        httpsEnabled: boolean;
        mixedContent: boolean;
        serverSignatureHidden: boolean;
        hstsEnabled: boolean;
    };
    performance: {
        pageSizeKb: number;
        httpRequests: {
            total: number;
            links: number;
            scripts: number;
            images: number;
        };
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
 * Main function to calculate metrics for the given content.
 */
export const calculateMetrics = async (data: IContent): Promise<MetricResults> => {
    const url = data.url;
    const htmlContent = data.htmlContent || ""; // Default to empty string if missing
    const headers = data.headers || {}; // Default to an empty object if headers are missing

    // Log warnings for missing critical data
    if (!htmlContent) {
        console.warn("[calculateMetrics] HTML content is missing or empty.");
    }
    if (Object.keys(headers).length === 0) {
        console.warn("[calculateMetrics] Headers are missing or empty.");
    }
    if (!url) {
        console.error("[calculateMetrics] URL is missing or invalid.");
        throw new Error("Cannot calculate metrics without a valid URL.");
    }

    // Batch extraction of all heading tags (h1-h6) for SEO analysis
    const allHeadings = SEOHelpers.extractAllHeadings(htmlContent);

    // Miscellaneous: Check sitemap accessibility (await the async call)
    let sitemapAccessible = false;
    try {
        sitemapAccessible = await MiscellaneousHelpers.isSitemapAccessible(url);
    } catch (error) {
        console.error("[calculateMetrics] Error checking sitemap accessibility:", error);
        sitemapAccessible = false; // Explicit fallback
    }

    // Log the results
    console.info("[calculateMetrics] Sitemap Accessibility:", sitemapAccessible);

    // SEO Metrics
    const seoMetrics = {
        actualTitle: data.metadata.title || null,
        titlePresent: SEOHelpers.isTitlePresent(data.metadata.title),
        titleLength: SEOHelpers.calculateLength(data.metadata.title),
        actualMetaDescription: data.metadata.description || null,
        metaDescriptionPresent: SEOHelpers.isMetaDescriptionPresent(data.metadata.description),
        metaDescriptionLength: SEOHelpers.calculateLength(data.metadata.description),
        headingsCount: allHeadings.length,
        contentKeywords: SEOHelpers.extractKeywords(htmlContent),
        seoFriendlyUrl: SEOHelpers.isSeoFriendlyUrl(url),
        faviconPresent: !!data.favicon,
        faviconUrl: data.favicon || null,
        robotsTxtAccessible: SEOHelpers.isRobotsTxtAccessible(url),
        inPageLinks: SEOHelpers.countInPageLinks(htmlContent),
        languageDeclared: SEOHelpers.extractLangTag(htmlContent),
        hreflangTagPresent: SEOHelpers.extractHreflangTags(htmlContent),
        h1TagCount: SEOHelpers.countTagsByLevel(allHeadings, "h1"),
        h1TagContent: SEOHelpers.extractContentByLevel(allHeadings, "h1"),
        h2ToH6TagCount: SEOHelpers.countTagsByLevel(allHeadings, "h2", "h3", "h4", "h5", "h6"),
        h2ToH6TagContent: SEOHelpers.extractContentByRange(allHeadings, "h2", "h6"),
        canonicalTagPresent: SEOHelpers.hasCanonicalTag(htmlContent).present,
        canonicalTagUrl: SEOHelpers.hasCanonicalTag(htmlContent).url,
        noindexTagPresent: SEOHelpers.hasNoindexTag(htmlContent),
        noindexHeaderPresent: SEOHelpers.hasNoindexHeader(headers),
        keywordsPresent: SEOHelpers.extractKeywords(htmlContent).length > 0 ? "Yes" : "No",
    };

    // Security Metrics
    const securityMetrics = {
        httpsEnabled: SecurityHelpers.isHttpsEnabled(url),
        mixedContent: SecurityHelpers.hasMixedContent(htmlContent),
        serverSignatureHidden: SecurityHelpers.isServerSignatureHidden(headers),
        hstsEnabled: SecurityHelpers.isHstsEnabled(headers),
    };

    // Performance Metrics
    const performanceMetrics = {
        pageSizeKb: PerformanceHelpers.calculatePageSize(htmlContent),
        httpRequests: PerformanceHelpers.countHttpRequests(htmlContent), // Returns breakdown and total
        textCompressionEnabled: PerformanceHelpers.isTextCompressionEnabled(headers),
    };

    // Miscellaneous Metrics
    const miscellaneousMetrics = {
        metaViewportPresent: MiscellaneousHelpers.isMetaViewportPresent(htmlContent),
        characterSet: MiscellaneousHelpers.extractCharacterSet(htmlContent),
        sitemapAccessible, // Use the awaited result
        textToHtmlRatio: MiscellaneousHelpers.calculateTextToHtmlRatio(htmlContent, data.textContent),
    };

    // Log calculated text-to-HTML ratio
    console.info("[calculateMetrics] Text-to-HTML Ratio:", miscellaneousMetrics.textToHtmlRatio);

    // Return all metrics as a single object
    return {
        seo: seoMetrics,
        security: securityMetrics,
        performance: performanceMetrics,
        miscellaneous: miscellaneousMetrics,
    };
};

