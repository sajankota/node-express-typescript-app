// src/models/ContentModel.ts

import mongoose, { Schema, Document } from "mongoose";

export interface ContentDocument extends Document {
    url: string;
    tags: { tag: string; text: string }[];
    counts: Record<string, number>;
    analysis: {
        wordCount: number;
        wordFrequencies: Record<string, number>;
        nGramCounts: Record<string, Record<string, number>>;
        sentiment: Record<string, any>;
        readingTime: string;
    };
    content: {
        introduction: string[];
        mainContent: string[];
        listItems: string[];
        footerContent: string[];
    };
}

const ContentSchema = new Schema<ContentDocument>(
    {
        url: { type: String, required: true },
        tags: [
            {
                tag: { type: String, required: true },
                text: { type: String, required: true },
            },
        ],
        counts: { type: Map, of: Number, required: true },
        analysis: {
            wordCount: { type: Number, required: true },
            wordFrequencies: { type: Map, of: Number, required: true },
            nGramCounts: {
                "2-word": { type: Map, of: Number },
                "3-word": { type: Map, of: Number },
                "4-word": { type: Map, of: Number },
            },
            sentiment: { type: Object, required: true },
            readingTime: { type: String, required: true },
        },
        content: {
            introduction: { type: [String], default: [] },
            mainContent: { type: [String], default: [] },
            listItems: { type: [String], default: [] },
            footerContent: { type: [String], default: [] },
        },
    },
    { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

export default mongoose.model<ContentDocument>("Content", ContentSchema);
