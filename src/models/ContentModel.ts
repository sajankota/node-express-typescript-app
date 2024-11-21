// src/models/ContentModel.ts

import mongoose, { Schema, Document } from "mongoose";

// Define the ContentDocument interface for TypeScript
export interface ContentDocument extends Document {
    url: string; // URL of the page being analyzed
    tags: { tag: string; text: string }[]; // Tags and their associated text
    counts: Record<string, number>; // Counts of various elements
    analysis: {
        wordCount: number; // Total word count
        wordFrequencies: Record<string, number>; // Frequency of each word
        nGramCounts: Record<string, Record<string, number>>; // N-gram counts (e.g., 2-word, 3-word, etc.)
        sentiment: Record<string, any>; // Sentiment analysis results
        readingTime: string; // Estimated reading time
    };
    content: {
        introduction: string[]; // List of introduction paragraphs
        mainContent: string[]; // List of main content paragraphs
        listItems: string[]; // List of items (e.g., bullet points)
        footerContent: string[]; // List of footer content paragraphs
    };
}

// Define the Content schema
const ContentSchema = new Schema<ContentDocument>(
    {
        url: { type: String, required: true }, // URL of the analyzed page
        tags: [
            {
                tag: { type: String, required: true }, // Tag name (e.g., "h1", "p", "span")
                text: { type: String, required: true }, // Text content inside the tag
            },
        ],
        counts: { type: Map, of: Number, required: true }, // Element counts (e.g., number of paragraphs, links, etc.)
        analysis: {
            wordCount: { type: Number, required: true }, // Total word count
            wordFrequencies: { type: Map, of: Number, required: true }, // Frequency of each word
            nGramCounts: {
                "2-word": { type: Map, of: Number }, // Counts for 2-word combinations
                "3-word": { type: Map, of: Number }, // Counts for 3-word combinations
                "4-word": { type: Map, of: Number }, // Counts for 4-word combinations
            },
            sentiment: { type: Object, required: true }, // Sentiment analysis result (e.g., positive/negative/neutral)
            readingTime: { type: String, required: true }, // Estimated reading time for the content
        },
        content: {
            introduction: { type: [String], default: [] }, // Introduction paragraphs
            mainContent: { type: [String], default: [] }, // Main content paragraphs
            listItems: { type: [String], default: [] }, // List items (e.g., from bullet points)
            footerContent: { type: [String], default: [] }, // Footer content paragraphs
        },
    },
    { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

// Export the Content model
export default mongoose.model<ContentDocument>("Content", ContentSchema);
