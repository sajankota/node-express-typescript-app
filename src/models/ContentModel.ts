// src/models/ContentModel.ts

import mongoose, { Schema, Document } from "mongoose";

// Define the Content interface
export interface IContent extends Document {
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
    userId: string; // User ID for association
    createdAt: Date;
}

// Define the Content schema
const ContentSchema = new Schema<IContent>(
    {
        url: { type: String, required: true, index: true }, // Indexed for faster querying
        metadata: {
            title: { type: String, default: null },
            description: { type: String, default: null },
            keywords: { type: String, default: null },
            ogTitle: { type: String, default: null },
            ogDescription: { type: String, default: null },
            ogImage: { type: String, default: null },
        },
        favicon: { type: String, default: null },
        textContent: {
            type: String,
            default: null, // Allow null values for missing `textContent`
            required: false, // Made optional
        },
        dynamic: { type: Boolean, required: true },
        htmlContent: { type: String, required: true },
        headers: { type: Map, of: String, required: false }, // Optional `headers` field
        userId: { type: String, required: true, index: true }, // Indexed for faster querying
        createdAt: { type: Date, default: Date.now },
    },
    { minimize: true } // Remove empty objects from the database
);

// Override the `toObject` method to ensure proper typing
ContentSchema.method("toObject", function (this: IContent) {
    return this.toJSON() as IContent;
});

// Compound index for common query patterns
ContentSchema.index({ userId: 1, url: 1 }, { unique: true });

// Create the Content model
export const Content = mongoose.model<IContent>("Content", ContentSchema);
