// src/services/calculateMetrics.ts

import { IContent } from "../models/ContentModel";
import * as SEOHelpers from "./helpers/SEOHelpers";
import * as SecurityHelpers from "./helpers/SecurityHelpers";
import * as PerformanceHelpers from "./helpers/PerformanceHelpers";
import * as MiscellaneousHelpers from "./helpers/MiscellaneousHelpers";
import { TITLE_MESSAGES, META_DESCRIPTION_MESSAGES } from "../constants/seoMetricsMessages";
import { MetricResults } from "../types/MetricsTypes";

export const calculateMetrics = async (data: IContent): Promise<MetricResults> => {
    const { url, htmlContent = "", textContent = "", headers = {}, favicon } = data;

    if (!htmlContent.trim()) throw new Error("HTML content is missing or empty.");
    if (!url) throw new Error("Cannot calculate metrics without a valid URL.");

    const title = SEOHelpers.extractFirstTitleTag(htmlContent);
    const metaDescription = SEOHelpers.extractMetaDescription(htmlContent);
    const headingTags = SEOHelpers.extractAllHeadingsWithDetails(htmlContent);

    const headingIssues = SEOHelpers.analyzeHeadingIssues(headingTags, title);
    const totalHeadings = headingTags.length;

    return {
        seo: {
            title,
            actualTitle: title,
            titlePresent: !!title,
            titleLength: title?.length || 0,
            titleMessage: title
                ? title.length < 50
                    ? TITLE_MESSAGES.TITLE_LENGTH_SHORT
                    : title.length > 60
                        ? TITLE_MESSAGES.TITLE_LENGTH_LONG
                        : TITLE_MESSAGES.TITLE_LENGTH_OPTIMAL
                : TITLE_MESSAGES.TITLE_MISSING,
            metaDescription,
            actualMetaDescription: metaDescription,
            metaDescriptionPresent: !!metaDescription,
            metaDescriptionLength: metaDescription?.length || 0,
            metaDescriptionMessage: metaDescription
                ? metaDescription.length < 150
                    ? META_DESCRIPTION_MESSAGES.META_DESCRIPTION_LENGTH_SHORT
                    : metaDescription.length > 160
                        ? META_DESCRIPTION_MESSAGES.META_DESCRIPTION_LENGTH_LONG
                        : META_DESCRIPTION_MESSAGES.META_DESCRIPTION_LENGTH_OPTIMAL
                : META_DESCRIPTION_MESSAGES.META_DESCRIPTION_MISSING,
            seoFriendlyUrl: SEOHelpers.isSeoFriendlyUrl(url),
            faviconPresent: !!favicon,
            faviconUrl: favicon || null,
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
            headingAnalysis: {
                summary: {
                    totalHeadings,
                    headingTagCounts: SEOHelpers.countHeadingTagLevels(headingTags),
                },
                issues: {
                    ...headingIssues,
                    excessiveHeadings: totalHeadings > 50,
                    insufficientHeadings: totalHeadings < 3,
                },
                detailedHeadings: headingTags,
            },
        },
        security: {
            httpsEnabled: SecurityHelpers.isHttpsEnabled(url),
            mixedContent: SecurityHelpers.hasMixedContent(htmlContent),
            serverSignatureHidden: SecurityHelpers.isServerSignatureHidden(headers),
            hstsEnabled: SecurityHelpers.isHstsEnabled(headers),
        },
        performance: {
            pageSizeKb: PerformanceHelpers.calculatePageSize(htmlContent),
            httpRequests: PerformanceHelpers.countHttpRequests(htmlContent),
            textCompressionEnabled: PerformanceHelpers.isTextCompressionEnabled(headers),
        },
        miscellaneous: {
            metaViewportPresent: MiscellaneousHelpers.isMetaViewportPresent(htmlContent),
            characterSet: MiscellaneousHelpers.extractCharacterSet(htmlContent),
            sitemapAccessible: await MiscellaneousHelpers.isSitemapAccessible(url),
            textToHtmlRatio: MiscellaneousHelpers.calculateTextToHtmlRatio(htmlContent, textContent),
        },
    };
};
