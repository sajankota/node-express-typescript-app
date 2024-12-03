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
    userId: string; // Added userId
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
    textContent: {
        type: String,
        default: null, // Allow null values for missing `textContent`
        required: false, // Made optional
    },
    dynamic: { type: Boolean, required: true },
    htmlContent: { type: String, required: true },
    userId: { type: String, required: true }, // User ID field
    createdAt: { type: Date, default: Date.now },
});

// Override the `toObject` method to ensure proper typing
ContentSchema.method("toObject", function (this: IContent) {
    return this.toJSON() as IContent;
});

// Create the Content model
export const Content = mongoose.model<IContent>("Content", ContentSchema);
