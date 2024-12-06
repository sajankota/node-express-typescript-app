// src/models/MetricsModel.ts

import mongoose, { Schema, Document } from "mongoose";

// Define interfaces for each metric type
interface SEO {
    actualTitle: string | null;
    title: string | null; // Optional
    titlePresent: boolean;
    titleLength: number;
    titleMessage: string;
    actualMetaDescription: string | null;
    metaDescription: string | null; // Optional
    metaDescriptionPresent: boolean;
    metaDescriptionLength: number;
    metaDescriptionMessage: string;
    headingsCount: number;
    seoFriendlyUrl: boolean;
    faviconPresent: boolean;
    faviconUrl: string | null;
    robotsTxtAccessible: boolean;
    inPageLinks: number;
    keywordsPresent: string;
    hreflangTagPresent: string[];
    languageDeclared: string | null;
    h1TagCount: number;
    h1TagContent: string[];
    h2ToH6TagCount: number;
    h2ToH6TagContent: { tag: string; content: string }[];
    canonicalTagPresent: boolean;
    canonicalTagUrl: string | null;
    noindexTagPresent: boolean;
    noindexHeaderPresent: boolean;
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
                title: { type: String, default: null }, // Make it optional
                titlePresent: { type: Boolean, required: true },
                titleLength: { type: Number, required: true },
                titleMessage: { type: String, required: true },
                actualMetaDescription: { type: String, default: null },
                metaDescription: { type: String, default: null }, // Make it optional
                metaDescriptionPresent: { type: Boolean, required: true },
                metaDescriptionLength: { type: Number, required: true },
                metaDescriptionMessage: { type: String, required: true },
                headingsCount: { type: Number, required: true },
                seoFriendlyUrl: { type: Boolean, required: true },
                faviconPresent: { type: Boolean, required: true },
                faviconUrl: { type: String, default: null },
                robotsTxtAccessible: { type: Boolean, required: true },
                inPageLinks: { type: Number, required: true },
                keywordsPresent: { type: String, required: true },
                hreflangTagPresent: { type: [String], default: [] },
                languageDeclared: { type: String, default: null },
                h1TagCount: { type: Number, required: true },
                h1TagContent: { type: [String], required: true },
                h2ToH6TagCount: { type: Number, required: true },
                h2ToH6TagContent: {
                    type: [{ tag: String, content: String }],
                    required: true,
                },
                canonicalTagPresent: { type: Boolean, required: true },
                canonicalTagUrl: { type: String, default: null },
                noindexTagPresent: { type: Boolean, required: true },
                noindexHeaderPresent: { type: Boolean, required: true },
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
    createdAt: { type: Date, default: Date.now },
});

// Export the Mongoose model
export const Metrics = mongoose.model<IMetrics>("Metrics", MetricsSchema);
