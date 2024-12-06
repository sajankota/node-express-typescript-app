// src/services/calculateMetrics.ts

import { IContent } from "../models/ContentModel";
import * as SEOHelpers from "./helpers/SEOHelpers";
import * as SecurityHelpers from "./helpers/SecurityHelpers";
import * as PerformanceHelpers from "./helpers/PerformanceHelpers";
import * as MiscellaneousHelpers from "./helpers/MiscellaneousHelpers";
import { TITLE_MESSAGES, META_DESCRIPTION_MESSAGES } from "../constants/seoMetricsMessages"; // Import constants

interface MetricResults {
    seo: {
        actualTitle: string | null;
        title: string | null;
        titlePresent: boolean;
        titleLength: number;
        titleMessage: string;
        actualMetaDescription: string | null;
        metaDescription: string | null;
        metaDescriptionPresent: boolean;
        metaDescriptionLength: number;
        metaDescriptionMessage: string;
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
        // Title Metrics
        const title = data.metadata.title || null; // Default to null
        const titlePresent = !!title;
        const titleLength = title ? title.length : 0;
        const titleMessage = titlePresent
            ? titleLength < 50
                ? TITLE_MESSAGES.TITLE_LENGTH_SHORT
                : titleLength > 60
                    ? TITLE_MESSAGES.TITLE_LENGTH_LONG
                    : TITLE_MESSAGES.TITLE_LENGTH_OPTIMAL
            : TITLE_MESSAGES.TITLE_MISSING;

        // Meta Description Metrics
        const metaDescription = data.metadata.description || null; // Default to null
        const metaDescriptionPresent = !!metaDescription;
        const metaDescriptionLength = metaDescription ? metaDescription.length : 0;
        const metaDescriptionMessage = metaDescriptionPresent
            ? metaDescriptionLength < 150
                ? META_DESCRIPTION_MESSAGES.META_DESCRIPTION_LENGTH_SHORT
                : metaDescriptionLength > 160
                    ? META_DESCRIPTION_MESSAGES.META_DESCRIPTION_LENGTH_LONG
                    : META_DESCRIPTION_MESSAGES.META_DESCRIPTION_LENGTH_OPTIMAL
            : META_DESCRIPTION_MESSAGES.META_DESCRIPTION_MISSING;



        const seoMetrics = {
            title,
            actualTitle: title,
            titlePresent,
            titleLength,
            titleMessage,
            metaDescription,
            actualMetaDescription: metaDescription,
            metaDescriptionPresent,
            metaDescriptionLength,
            metaDescriptionMessage,
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
