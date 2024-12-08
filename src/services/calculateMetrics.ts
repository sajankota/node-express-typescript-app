// src/services/calculateMetrics.ts

import { IContent } from "../models/ContentModel";
import * as SEOHelpers from "./helpers/SEOHelpers";
import * as SecurityHelpers from "./helpers/SecurityHelpers";
import * as PerformanceHelpers from "./helpers/PerformanceHelpers";
import * as MiscellaneousHelpers from "./helpers/MiscellaneousHelpers";
import { TITLE_MESSAGES, META_DESCRIPTION_MESSAGES } from "../constants/seoMetricsMessages";

interface MetricResults {
    seo: {
        title: string | null;
        titlePresent: boolean;
        titleLength: number;
        titleMessage: string;
        metaDescription: string | null;
        metaDescriptionPresent: boolean;
        metaDescriptionLength: number;
        metaDescriptionMessage: string;
        seoFriendlyUrl: boolean;
        faviconPresent: boolean;
        faviconUrl: string | null;
        robotsTxtAccessible: boolean;
        inPageLinks: number;
        languageDeclared: string | null;
        hreflangTagPresent: string[];
        canonicalTagPresent: boolean;
        canonicalTagUrl: string | null;
        noindexTagPresent: boolean;
        noindexHeaderPresent: boolean;
        keywordsPresent: string;
        has404ErrorPage: boolean;
        headingAnalysis: {
            summary: {
                totalHeadings: number;
                headingTagCounts: {
                    h1: number;
                    h2: number;
                    h3: number;
                    h4: number;
                    h5: number;
                    h6: number;
                };
            };
            issues: {
                multipleH1Tags: boolean;
                missingH1Tag: boolean;
                h1MatchesTitle: boolean;
                sequence: {
                    hasIssues: boolean;
                    skippedLevels: string[];
                };
                invalidTextLength: {
                    tooShort: string[];
                    tooLong: string[];
                };
                duplicateHeadings: string[];
                excessiveHeadings: boolean;
                insufficientHeadings: boolean;
            };
            detailedHeadings: {
                level: string;
                content: string;
                order: number;
            }[];
        };
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
    const htmlContent = data.htmlContent || "";
    const textContent = data.textContent || ""; // For calculating text-to-HTML ratio
    const headers = data.headers || {};

    console.debug("[calculateMetrics] Starting metrics calculation...");

    // Validate inputs
    if (!htmlContent.trim()) {
        throw new Error("HTML content is missing or empty.");
    }

    if (!url) {
        throw new Error("Cannot calculate metrics without a valid URL.");
    }

    try {
        /** SEO Metrics */
        const title = SEOHelpers.extractFirstTitleTag(htmlContent);
        const titlePresent = !!title;
        const titleLength = title?.length || 0;
        const titleMessage = titlePresent
            ? titleLength < 50
                ? TITLE_MESSAGES.TITLE_LENGTH_SHORT
                : titleLength > 60
                    ? TITLE_MESSAGES.TITLE_LENGTH_LONG
                    : TITLE_MESSAGES.TITLE_LENGTH_OPTIMAL
            : TITLE_MESSAGES.TITLE_MISSING;

        const metaDescription = SEOHelpers.extractMetaDescription(htmlContent);
        const metaDescriptionPresent = !!metaDescription;
        const metaDescriptionLength = metaDescription?.length || 0;
        const metaDescriptionMessage = metaDescriptionPresent
            ? metaDescriptionLength < 150
                ? META_DESCRIPTION_MESSAGES.META_DESCRIPTION_LENGTH_SHORT
                : metaDescriptionLength > 160
                    ? META_DESCRIPTION_MESSAGES.META_DESCRIPTION_LENGTH_LONG
                    : META_DESCRIPTION_MESSAGES.META_DESCRIPTION_LENGTH_OPTIMAL
            : META_DESCRIPTION_MESSAGES.META_DESCRIPTION_MISSING;

        const headingTags = SEOHelpers.extractAllHeadingsWithDetails(htmlContent);
        const headingTagCounts = SEOHelpers.countHeadingTagLevels(headingTags);
        const totalHeadings = headingTags.length;
        const headingIssues = SEOHelpers.analyzeHeadingIssues(headingTags, title);

        const headingAnalysis = {
            summary: {
                totalHeadings,
                headingTagCounts,
            },
            issues: {
                ...headingIssues,
                excessiveHeadings: totalHeadings > 50,
                insufficientHeadings: totalHeadings < 3,
            },
            detailedHeadings: headingTags,
        };

        const seoMetrics = {
            title,
            titlePresent,
            titleLength,
            titleMessage,
            metaDescription,
            metaDescriptionPresent,
            metaDescriptionLength,
            metaDescriptionMessage,
            seoFriendlyUrl: SEOHelpers.isSeoFriendlyUrl(url),
            faviconPresent: !!data.favicon,
            faviconUrl: data.favicon || null,
            robotsTxtAccessible: SEOHelpers.isRobotsTxtAccessible(url),
            inPageLinks: SEOHelpers.countInPageLinks(htmlContent),
            languageDeclared: SEOHelpers.extractLangTag(htmlContent),
            hreflangTagPresent: SEOHelpers.extractHreflangTags(htmlContent),
            canonicalTagPresent: SEOHelpers.hasCanonicalTag(htmlContent).present,
            canonicalTagUrl: SEOHelpers.hasCanonicalTag(htmlContent).url,
            noindexTagPresent: SEOHelpers.hasNoindexTag(htmlContent),
            noindexHeaderPresent: SEOHelpers.hasNoindexHeader(headers),
            keywordsPresent: SEOHelpers.extractKeywords(htmlContent).length > 0 ? "Yes" : "No",
            has404ErrorPage: await SEOHelpers.has404ErrorPage(url),
            headingAnalysis,
        };

        console.debug("[calculateMetrics] SEO Metrics calculated:", seoMetrics);

        /** Security Metrics */
        const securityMetrics = {
            httpsEnabled: SecurityHelpers.isHttpsEnabled(url),
            mixedContent: SecurityHelpers.hasMixedContent(htmlContent),
            serverSignatureHidden: SecurityHelpers.isServerSignatureHidden(headers),
            hstsEnabled: SecurityHelpers.isHstsEnabled(headers),
        };

        console.debug("[calculateMetrics] Security Metrics calculated:", securityMetrics);

        /** Performance Metrics */
        const performanceMetrics = {
            pageSizeKb: PerformanceHelpers.calculatePageSize(htmlContent),
            httpRequests: PerformanceHelpers.countHttpRequests(htmlContent),
            textCompressionEnabled: PerformanceHelpers.isTextCompressionEnabled(headers),
        };

        console.debug("[calculateMetrics] Performance Metrics calculated:", performanceMetrics);

        /** Miscellaneous Metrics */
        const miscellaneousMetrics = {
            metaViewportPresent: MiscellaneousHelpers.isMetaViewportPresent(htmlContent),
            characterSet: MiscellaneousHelpers.extractCharacterSet(htmlContent),
            sitemapAccessible: await MiscellaneousHelpers.isSitemapAccessible(url),
            textToHtmlRatio: MiscellaneousHelpers.calculateTextToHtmlRatio(htmlContent, textContent),
        };

        console.debug("[calculateMetrics] Miscellaneous Metrics calculated:", miscellaneousMetrics);

        // Combine all metrics into the result object
        return {
            seo: seoMetrics,
            security: securityMetrics,
            performance: performanceMetrics,
            miscellaneous: miscellaneousMetrics,
        };
    } catch (error) {
        console.error("[calculateMetrics] Error occurred:", error);
        throw new Error("Failed to calculate metrics.");
    }
};
