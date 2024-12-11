// src/models/MetricsModel.ts

import mongoose, { Schema, Document } from "mongoose";

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
    userId: string;
    url: string;
    metrics: {
        seo: SEO;
        security: Security;
        performance: Performance;
        miscellaneous: Miscellaneous;
    };
    screenshotPath: string | null;
    createdAt: Date;
}

// Define the Mongoose schema
const MetricsSchema = new Schema<IMetrics>({
    userId: { type: String, required: true },
    url: { type: String, required: true },
    metrics: {
        seo: {
            type: new Schema({
                actualTitle: { type: String, default: null },
                title: { type: String, default: null },
                titlePresent: { type: Boolean, required: true },
                titleLength: { type: Number, required: true },
                titleMessage: { type: String, required: true },
                actualMetaDescription: { type: String, default: null },
                metaDescription: { type: String, default: null },
                metaDescriptionPresent: { type: Boolean, required: true },
                metaDescriptionLength: { type: Number, required: true },
                metaDescriptionMessage: { type: String, required: true },
                seoFriendlyUrl: { type: Boolean, required: true },
                faviconPresent: { type: Boolean, required: true },
                faviconUrl: { type: String, default: null },
                robotsTxtAccessible: { type: Boolean, required: true },
                inPageLinks: { type: Number, required: true },
                keywordsPresent: { type: String, required: true },
                hreflangTagPresent: { type: [String], default: [] },
                languageDeclared: { type: String, default: null },
                canonicalTagPresent: { type: Boolean, required: true },
                canonicalTagUrl: { type: String, default: null },
                noindexTagPresent: { type: Boolean, required: true },
                noindexHeaderPresent: { type: Boolean, required: true },
                has404ErrorPage: { type: Boolean, required: true }, // Added field

                // Optimized Heading Analysis
                headingAnalysis: {
                    type: new Schema({
                        summary: {
                            type: new Schema({
                                totalHeadings: { type: Number, required: true },
                                headingTagCounts: {
                                    type: new Schema({
                                        h1: { type: Number, required: true },
                                        h2: { type: Number, required: true },
                                        h3: { type: Number, required: true },
                                        h4: { type: Number, required: true },
                                        h5: { type: Number, required: true },
                                        h6: { type: Number, required: true },
                                    }),
                                    required: true,
                                },
                            }),
                            required: true,
                        },
                        issues: {
                            type: new Schema({
                                multipleH1Tags: { type: Boolean, required: true },
                                missingH1Tag: { type: Boolean, required: true },
                                h1MatchesTitle: { type: Boolean, required: true },
                                sequence: {
                                    type: new Schema({
                                        hasIssues: { type: Boolean, required: true },
                                        skippedLevels: { type: [String], default: [] },
                                    }),
                                    required: true,
                                },
                                invalidTextLength: {
                                    type: new Schema({
                                        tooShort: { type: [String], default: [] },
                                        tooLong: { type: [String], default: [] },
                                    }),
                                    required: true,
                                },
                                duplicateHeadings: { type: [String], default: [] },
                                excessiveHeadings: { type: Boolean, required: true },
                                insufficientHeadings: { type: Boolean, required: true },
                            }),
                            required: true,
                        },
                        detailedHeadings: {
                            type: [
                                {
                                    level: { type: String, required: true },
                                    content: { type: String, required: true },
                                    order: { type: Number, required: true },
                                },
                            ],
                            required: true,
                        },
                    }),
                    required: true,
                },
            }),
            required: true,
        },
        security: {
            type: new Schema({
                httpsEnabled: { type: Boolean, required: true },
                mixedContent: { type: Boolean, required: true },
                serverSignatureHidden: { type: Boolean, required: true },
                hstsEnabled: { type: Boolean, required: true },
            }),
            required: true,
        },
        performance: {
            type: new Schema({
                pageSizeKb: { type: Number, required: true },
                httpRequests: {
                    type: new Schema({
                        total: { type: Number, required: true },
                        links: { type: Number, required: true },
                        scripts: { type: Number, required: true },
                        images: { type: Number, required: true },
                    }),
                    required: true,
                },
                textCompressionEnabled: { type: Boolean, required: true },
            }),
            required: true,
        },
        miscellaneous: {
            type: new Schema({
                metaViewportPresent: { type: Boolean, required: true },
                characterSet: { type: String, default: null },
                sitemapAccessible: { type: Boolean, required: true },
                textToHtmlRatio: { type: Number, required: true },
            }),
            required: true,
        },
    },
    screenshotPath: { type: String, default: null }, // New field
    createdAt: { type: Date, default: Date.now },
});

// Export the Mongoose model
export const Metrics = mongoose.model<IMetrics>("Metrics", MetricsSchema);
