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
 * Function to extract the first <title> tag from HTML content.
 */
const extractFirstTitleTag = (html: string): string | null => {
    const match = html.match(/<title>(.*?)<\/title>/i); // Match the first <title>...</title>
    return match ? match[1].trim() : null; // Return the content inside <title> if it exists
};

/**
 * Main function to calculate metrics for the given content.
 */
export const calculateMetrics = async (data: IContent): Promise<MetricResults> => {
    const url = data.url;
    const htmlContent = data.htmlContent || "";
    const headers = data.headers || {};

    // Validate HTML content
    if (!htmlContent || htmlContent.trim() === "") {
        console.warn("[calculateMetrics] HTML content is missing or empty.");
        throw new Error("HTML content is missing or empty.");
    }

    if (!url) {
        throw new Error("Cannot calculate metrics without a valid URL.");
    }

    try {
        // ** SEO Metrics **
        // Title Metrics
        const title = extractFirstTitleTag(htmlContent) || null; // Extract the first <title> tag
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
        const metaDescription = data.metadata.description || null;
        const metaDescriptionPresent = !!metaDescription;
        const metaDescriptionLength = metaDescription ? metaDescription.length : 0;
        const metaDescriptionMessage = metaDescriptionPresent
            ? metaDescriptionLength < 150
                ? META_DESCRIPTION_MESSAGES.META_DESCRIPTION_LENGTH_SHORT
                : metaDescriptionLength > 160
                    ? META_DESCRIPTION_MESSAGES.META_DESCRIPTION_LENGTH_LONG
                    : META_DESCRIPTION_MESSAGES.META_DESCRIPTION_LENGTH_OPTIMAL
            : META_DESCRIPTION_MESSAGES.META_DESCRIPTION_MISSING;

        // ** Heading Tag Analysis **
        const headingTags = SEOHelpers.extractAllHeadingsWithDetails(htmlContent);
        const headingTagCounts = SEOHelpers.countHeadingTagLevels(headingTags);
        const totalHeadings = headingTags.length;

        // ** Heading Issues **
        const multipleH1Tags = headingTagCounts.h1 > 1;
        const h1MatchesTitle = headingTags.some(
            (heading) => heading.level === "h1" && heading.content.trim() === (title?.trim() || "")
        );
        const missingH1Tag = headingTagCounts.h1 === 0;
        const sequenceIssues = SEOHelpers.detectHeadingSequenceIssues(headingTags);
        const excessiveHeadings = totalHeadings > 50; // Arbitrary threshold
        const insufficientHeadings = totalHeadings < 3;
        const invalidTextLength = SEOHelpers.getInvalidHeadingTextLengths(headingTags);
        const duplicateHeadings = SEOHelpers.getDuplicateHeadings(headingTags);

        const headingAnalysis = {
            summary: {
                totalHeadings,
                headingTagCounts: headingTagCounts,
            },
            issues: {
                multipleH1Tags,
                missingH1Tag,
                h1MatchesTitle,
                sequence: {
                    hasIssues: sequenceIssues,
                    skippedLevels: SEOHelpers.getSkippedHeadingLevels(headingTags),
                },
                invalidTextLength,
                duplicateHeadings,
                excessiveHeadings,
                insufficientHeadings,
            },
            detailedHeadings: headingTags,
        };

        // Check if the webpage has a 404 error page
        const has404ErrorPage = await SEOHelpers.has404ErrorPage(url);

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
            has404ErrorPage,
            headingAnalysis,
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
