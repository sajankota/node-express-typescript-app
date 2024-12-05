// src/services/calculateMetrics.ts

import { IContent } from "../models/ContentModel";
import * as SEOHelpers from "./helpers/SEOHelpers";
import * as SecurityHelpers from "./helpers/SecurityHelpers";
import * as PerformanceHelpers from "./helpers/PerformanceHelpers";
import * as MiscellaneousHelpers from "./helpers/MiscellaneousHelpers";
import { TITLE_MESSAGES } from "../constants/seoMetricsMessages"; // Import constants

interface MetricResults {
    seo: {
        actualTitle: string | null;
        titlePresent: boolean;
        titleLength: number;
        titleMessage: string; // Add titleMessage to the metrics
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

    if (!url) {
        throw new Error("Cannot calculate metrics without a valid URL.");
    }

    try {
        // ** SEO Metrics **
        const title = data.metadata.title || null; // Fetch the title
        const titlePresent = SEOHelpers.isTitlePresent(title); // Check if title exists
        const titleLength = SEOHelpers.calculateLength(title); // Calculate title length

        let titleMessage = "";
        if (titlePresent) {
            if (titleLength < 50) {
                titleMessage = TITLE_MESSAGES.TITLE_LENGTH_SHORT;
            } else if (titleLength > 60) {
                titleMessage = TITLE_MESSAGES.TITLE_LENGTH_LONG;
            } else {
                titleMessage = TITLE_MESSAGES.TITLE_LENGTH_OPTIMAL;
            }
        } else {
            titleMessage = TITLE_MESSAGES.TITLE_MISSING;
        }

        const seoMetrics = {
            title: title || "", // Map to required schema field
            actualTitle: title, // Preserve original field for reference
            titlePresent,
            titleLength,
            titleMessage,
            metaDescription: data.metadata.description || "", // Map to required schema field
            actualMetaDescription: data.metadata.description || null, // Preserve original field
            metaDescriptionPresent: SEOHelpers.isMetaDescriptionPresent(data.metadata.description),
            metaDescriptionLength: SEOHelpers.calculateLength(data.metadata.description),
            headingsCount: SEOHelpers.extractAllHeadings(htmlContent).length,
            contentKeywords: SEOHelpers.extractKeywords(htmlContent),
            seoFriendlyUrl: SEOHelpers.isSeoFriendlyUrl(url),
            faviconPresent: !!data.favicon,
            faviconUrl: data.favicon || null,
            robotsTxtAccessible: SEOHelpers.isRobotsTxtAccessible(url),
            inPageLinks: SEOHelpers.countInPageLinks(htmlContent),
            languageDeclared: SEOHelpers.extractLangTag(htmlContent),
            hreflangTagPresent: SEOHelpers.extractHreflangTags(htmlContent),
            h1TagCount: SEOHelpers.countTagsByLevel(
                SEOHelpers.extractAllHeadings(htmlContent),
                "h1"
            ),
            h1TagContent: SEOHelpers.extractContentByLevel(
                SEOHelpers.extractAllHeadings(htmlContent),
                "h1"
            ),
            h2ToH6TagCount: SEOHelpers.countTagsByLevel(
                SEOHelpers.extractAllHeadings(htmlContent),
                "h2",
                "h3",
                "h4",
                "h5",
                "h6"
            ),
            h2ToH6TagContent: SEOHelpers.extractContentByRange(
                SEOHelpers.extractAllHeadings(htmlContent),
                "h2",
                "h6"
            ),
            canonicalTagPresent: SEOHelpers.hasCanonicalTag(htmlContent).present,
            canonicalTagUrl: SEOHelpers.hasCanonicalTag(htmlContent).url,
            noindexTagPresent: SEOHelpers.hasNoindexTag(htmlContent),
            noindexHeaderPresent: SEOHelpers.hasNoindexHeader(headers),
            keywordsPresent: SEOHelpers.extractKeywords(htmlContent).length > 0 ? "Yes" : "No",
        };

        // ** Security Metrics **
        const securityMetrics = {
            httpsEnabled: SecurityHelpers.isHttpsEnabled(url),
            mixedContent: SecurityHelpers.hasMixedContent(htmlContent),
            serverSignatureHidden: SecurityHelpers.isServerSignatureHidden(headers),
            hstsEnabled: SecurityHelpers.isHstsEnabled(headers),
        };

        // ** Performance Metrics **
        const performanceMetrics = {
            pageSizeKb: PerformanceHelpers.calculatePageSize(htmlContent),
            httpRequests: PerformanceHelpers.countHttpRequests(htmlContent),
            textCompressionEnabled: PerformanceHelpers.isTextCompressionEnabled(headers),
        };

        // ** Miscellaneous Metrics **
        const miscellaneousMetrics = {
            metaViewportPresent: MiscellaneousHelpers.isMetaViewportPresent(htmlContent),
            characterSet: MiscellaneousHelpers.extractCharacterSet(htmlContent),
            sitemapAccessible: await MiscellaneousHelpers.isSitemapAccessible(url),
            textToHtmlRatio: MiscellaneousHelpers.calculateTextToHtmlRatio(htmlContent, data.textContent),
        };

        // Return all metrics as a single object
        return {
            seo: seoMetrics,
            security: securityMetrics,
            performance: performanceMetrics,
            miscellaneous: miscellaneousMetrics,
        };
    } catch (error) {
        console.error("[calculateMetrics] Error calculating metrics:", error);
        throw new Error("Failed to calculate metrics.");
    }
};

