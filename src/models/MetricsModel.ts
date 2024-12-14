// src/models/MetricsModel.ts

import mongoose, { Schema, Document, Types } from "mongoose";

// Define interfaces for each metric type
interface SEO {
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
    seoFriendlyUrl: boolean;
    faviconPresent: boolean;
    faviconUrl: string | null;
    robotsTxtAccessible: boolean;
    inPageLinks: number;
    keywordsPresent: string;
    hreflangTagPresent: string[];
    languageDeclared: string | null;
    canonicalTagPresent: boolean;
    canonicalTagUrl: string | null;
    noindexTagPresent: boolean;
    noindexHeaderPresent: boolean;
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

interface Security {
    httpsEnabled: boolean;
    mixedContent: boolean;
    serverSignatureHidden: boolean;
    hstsEnabled: boolean;
}

interface Performance {
    pageSizeKb: number;
    httpRequests: {
        total: number;
        links: number;
        scripts: number;
        images: number;
    };
    textCompressionEnabled: boolean;
}

interface Miscellaneous {
    metaViewportPresent: boolean;
    characterSet: string | null;
    sitemapAccessible: boolean;
    textToHtmlRatio: number;
}

// Define the IMetrics interface
export interface IMetrics extends Document {
    _id: Types.ObjectId; // Explicitly defining the _id field
    userId: string;
    url: string;
    status: "processing" | "ready" | "error";
    metrics?: {
        seo: SEO;
        security: Security;
        performance: Performance;
        miscellaneous: Miscellaneous;
    };
    screenshotPath?: string | null;
    createdAt: Date;
}

// Define the Mongoose schema
const MetricsSchema = new Schema<IMetrics>({
    userId: { type: String, required: true, index: true },
    url: { type: String, required: true, index: true },
    status: { type: String, enum: ["processing", "ready", "error"], default: "processing" },
    metrics: {
        type: new Schema(
            {
                seo: {
                    type: Object,
                    default: {
                        actualTitle: null,
                        title: null,
                        titlePresent: false,
                        titleLength: 0,
                        titleMessage: "",
                        actualMetaDescription: null,
                        metaDescription: null,
                        metaDescriptionPresent: false,
                        metaDescriptionLength: 0,
                        metaDescriptionMessage: "",
                        seoFriendlyUrl: false,
                        faviconPresent: false,
                        faviconUrl: null,
                        robotsTxtAccessible: false,
                        inPageLinks: 0,
                        keywordsPresent: "",
                        hreflangTagPresent: [],
                        languageDeclared: null,
                        canonicalTagPresent: false,
                        canonicalTagUrl: null,
                        noindexTagPresent: false,
                        noindexHeaderPresent: false,
                        has404ErrorPage: false,
                        headingAnalysis: {
                            summary: {
                                totalHeadings: 0,
                                headingTagCounts: { h1: 0, h2: 0, h3: 0, h4: 0, h5: 0, h6: 0 },
                            },
                            issues: {
                                multipleH1Tags: false,
                                missingH1Tag: false,
                                h1MatchesTitle: false,
                                sequence: { hasIssues: false, skippedLevels: [] },
                                invalidTextLength: { tooShort: [], tooLong: [] },
                                duplicateHeadings: [],
                                excessiveHeadings: false,
                                insufficientHeadings: false,
                            },
                            detailedHeadings: [],
                        },
                    },
                },
                security: {
                    type: Object,
                    default: {
                        httpsEnabled: false,
                        mixedContent: false,
                        serverSignatureHidden: false,
                        hstsEnabled: false,
                    },
                },
                performance: {
                    type: Object,
                    default: {
                        pageSizeKb: 0,
                        httpRequests: { total: 0, links: 0, scripts: 0, images: 0 },
                        textCompressionEnabled: false,
                    },
                },
                miscellaneous: {
                    type: Object,
                    default: {
                        metaViewportPresent: false,
                        characterSet: null,
                        sitemapAccessible: false,
                        textToHtmlRatio: 0,
                    },
                },
            },
            { _id: false } // Prevent creation of nested _id fields
        ),
        required: true,
        default: {}, // Default to an empty object to allow schema defaults to apply
    },
    screenshotPath: { type: String, default: null },
    createdAt: { type: Date, default: Date.now },
});

// Add a compound index for userId and url
MetricsSchema.index({ userId: 1, url: 1 }, { unique: true });

// Export the model
export const Metrics = mongoose.model<IMetrics>("Metrics", MetricsSchema);
