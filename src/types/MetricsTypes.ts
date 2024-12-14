// src/types/MetricsTypes.ts

export interface SEO {
    title: string | null;
    actualTitle: string | null;
    titlePresent: boolean;
    titleLength: number;
    titleMessage: string;
    metaDescription: string | null;
    actualMetaDescription: string | null;
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
}

export interface Security {
    httpsEnabled: boolean;
    mixedContent: boolean;
    serverSignatureHidden: boolean;
    hstsEnabled: boolean;
}

export interface Performance {
    pageSizeKb: number;
    httpRequests: {
        total: number;
        links: number;
        scripts: number;
        images: number;
    };
    textCompressionEnabled: boolean;
}

export interface Miscellaneous {
    metaViewportPresent: boolean;
    characterSet: string | null;
    sitemapAccessible: boolean;
    textToHtmlRatio: number;
}

export interface MetricResults {
    seo: SEO;
    security: Security;
    performance: Performance;
    miscellaneous: Miscellaneous;
}
