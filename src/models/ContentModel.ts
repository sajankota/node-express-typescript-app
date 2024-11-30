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
    textContent: string;
    dynamic: boolean;
    createdAt: Date;
}

// Define the Content schema
const ContentSchema = new Schema<IContent>({
    url: { type: String, required: true },
    metadata: {
        title: { type: String, default: null },
        description: { type: String, default: null },
        keywords: { type: String, default: null },
        ogTitle: { type: String, default: null },
        ogDescription: { type: String, default: null },
        ogImage: { type: String, default: null },
    },
    favicon: { type: String, default: null },
    textContent: { type: String, required: true },
    dynamic: { type: Boolean, required: true },
    createdAt: { type: Date, default: Date.now },
});

// Create the Content model
export const Content = mongoose.model<IContent>("Content", ContentSchema);
