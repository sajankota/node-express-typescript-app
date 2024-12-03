// src/models/MetricsModel.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IMetrics extends Document {
    userId: string;
    url: string;
    metrics: {
        seo: {
            actualTitle: string | null;
            title: string;
            titleLength: number;
            actualMetaDescription: string | null;
            metaDescription: string;
            metaDescriptionLength: number;
            headingsCount: number;
            seoFriendlyUrl: boolean;
            faviconPresent: boolean;
            faviconUrl: string | null;
            robotsTxtAccessible: boolean;
            inPageLinks: number;
            keywordsPresent: string;
            hreflangTagPresent: boolean;
            languageDeclared: boolean;
            h1TagCount: number; // New field
            h1TagContent: string[]; // New field
        };
        security: object;
        performance: object;
        miscellaneous: object;
    };
    createdAt: Date;
}

const MetricsSchema = new Schema<IMetrics>({
    userId: { type: String, required: true },
    url: { type: String, required: true },
    metrics: {
        seo: {
            type: new Schema({
                actualTitle: { type: String, default: null },
                title: { type: String, required: true },
                titleLength: { type: Number, required: true },
                actualMetaDescription: { type: String, default: null },
                metaDescription: { type: String, required: true },
                metaDescriptionLength: { type: Number, required: true },
                headingsCount: { type: Number, required: true },
                seoFriendlyUrl: { type: Boolean, required: true },
                faviconPresent: { type: Boolean, required: true },
                faviconUrl: { type: String, default: null },
                robotsTxtAccessible: { type: Boolean, required: true },
                inPageLinks: { type: Number, required: true },
                keywordsPresent: { type: String, required: true },
                hreflangTagPresent: { type: Boolean, required: true },
                languageDeclared: { type: Boolean, required: true },

                // New fields for H1 tags
                h1TagCount: { type: Number, required: true },
                h1TagContent: { type: [String], required: true },
            }),
            required: true,
        },
        security: { type: Object, required: true },
        performance: { type: Object, required: true },
        miscellaneous: { type: Object, required: true },
    },
    createdAt: { type: Date, default: Date.now },
});

export const Metrics = mongoose.model<IMetrics>("Metrics", MetricsSchema);
