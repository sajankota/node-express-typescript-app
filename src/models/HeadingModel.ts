// src/models/HeadingModel.ts

import mongoose, { Schema, Document } from "mongoose";

// Define the Heading interface for TypeScript
export interface IHeading extends Document {
    userId: string; // ID of the user who requested the extraction
    url: string; // URL of the page being scraped
    headings: { tag: string; text: string; id?: string; class?: string }[]; // Array of heading tags and their text
    counts: {
        h1: number;
        h2: number;
        h3: number;
        h4: number;
        h5: number;
        h6: number;
    }; // Count of each heading type
    hierarchy: {
        tag: string; // The heading tag (e.g., "h1", "h2")
        text: string; // The text of the heading
        level: number; // The level in the hierarchy (e.g., 1 for H1, 2 for H2)
        parent?: string; // Optional parent heading (for nested structures)
    }[]; // Hierarchy of headings
    createdAt: Date; // Timestamp when the record was created
}

// Define the Heading schema
const HeadingSchema: Schema = new Schema<IHeading>(
    {
        userId: { type: String, required: true }, // User ID requesting the analysis
        url: { type: String, required: true }, // URL of the page being analyzed
        headings: [
            {
                tag: { type: String, required: true }, // The heading tag (e.g., h1, h2, etc.)
                text: { type: String, required: true }, // The text content of the heading
                id: { type: String }, // Optional: ID of the HTML element
                class: { type: String }, // Optional: Class of the HTML element
            },
        ],
        counts: {
            h1: { type: Number, default: 0 }, // Count of H1 tags
            h2: { type: Number, default: 0 }, // Count of H2 tags
            h3: { type: Number, default: 0 }, // Count of H3 tags
            h4: { type: Number, default: 0 }, // Count of H4 tags
            h5: { type: Number, default: 0 }, // Count of H5 tags
            h6: { type: Number, default: 0 }, // Count of H6 tags
        },
        hierarchy: [
            {
                tag: { type: String, required: true }, // The heading tag (e.g., h1, h2, etc.)
                text: { type: String, required: true }, // The text content of the heading
                level: { type: Number, required: true }, // The level in the heading hierarchy
                parent: { type: String }, // Optional: Parent heading reference
            },
        ],
        createdAt: { type: Date, default: Date.now }, // Automatically set the creation timestamp
    },
    { timestamps: true } // Automatically add `createdAt` and `updatedAt` fields
);

// Export the Heading model
export default mongoose.model<IHeading>("Heading", HeadingSchema);
