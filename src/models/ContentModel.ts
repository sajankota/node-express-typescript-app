// src/models/ContentModel.ts

import mongoose, { Schema } from "mongoose";

export interface IContent {
    url: string;
    metadata: {
        title: string | null;
        description: string | null;
        keywords: string | null;
        ogTitle: string | null;
        ogDescription: string | null;
        ogImage: string | null;
    };
    favicon: string | null;
    textContent: string | null;
    dynamic: boolean;
    htmlContent: string;
    headers?: Record<string, string | undefined>; // Optional `headers` property
    userId: string;
    createdAt: Date;
}

const ContentSchema = new Schema<IContent>(
    {
        url: { type: String, required: true, index: true },
        metadata: {
            title: { type: String, default: null },
            description: { type: String, default: null },
            keywords: { type: String, default: null },
            ogTitle: { type: String, default: null },
            ogDescription: { type: String, default: null },
            ogImage: { type: String, default: null },
        },
        favicon: { type: String, default: null },
        textContent: { type: String, default: null, required: false },
        dynamic: { type: Boolean, required: true },
        htmlContent: { type: String, required: true },
        headers: { type: Map, of: String, required: false },
        userId: { type: String, required: true, index: true },
        createdAt: { type: Date, default: Date.now },
    },
    { minimize: true }
);

ContentSchema.index({ userId: 1, url: 1 }, { unique: true });

export const Content = mongoose.model<IContent>("Content", ContentSchema);
