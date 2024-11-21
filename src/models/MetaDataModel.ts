// src/models/MetadataSchema.ts

import mongoose, { Schema, Document } from "mongoose";

// Define the Metadata interface for TypeScript
interface IMetadata extends Document {
    userId: string; // ID of the user who requested the metadata
    url: string; // The URL being scraped
    metadata: {
        title: string; // Page title
        description: string; // Meta description
        keywords: string; // Meta keywords
        favicon: string; // Favicon URL
        language: string; // Language of the page
        author: string; // Author of the page
        viewport: string; // Viewport settings
        og: {
            title: string; // OpenGraph title
            description: string; // OpenGraph description
            image: string; // OpenGraph image URL
            url: string; // OpenGraph URL
            type: string; // OpenGraph type (e.g., website, article)
            site_name: string; // OpenGraph site name
        };
        twitter: {
            title: string; // Twitter card title
            description: string; // Twitter card description
            image: string; // Twitter card image URL
            card: string; // Twitter card type
        };
        custom: Record<string, string>; // Dynamic key-value pairs for additional meta tags
    };
    createdAt: Date; // Timestamp when the record was created
}

// Define the Metadata schema
const MetadataSchema: Schema = new Schema(
    {
        userId: { type: String, required: true }, // Ensure userId is always provided
        url: { type: String, required: true },
        metadata: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            keywords: { type: String, default: "" },
            favicon: { type: String, default: "" },
            language: { type: String, default: "" },
            author: { type: String, default: "" },
            viewport: { type: String, default: "" },
            og: {
                title: { type: String, default: "" },
                description: { type: String, default: "" },
                image: { type: String, default: "" },
                url: { type: String, default: "" },
                type: { type: String, default: "" },
                site_name: { type: String, default: "" },
            },
            twitter: {
                title: { type: String, default: "" },
                description: { type: String, default: "" },
                image: { type: String, default: "" },
                card: { type: String, default: "" },
            },
            custom: { type: Map, of: String }, // Flexible structure for additional tags
        },
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);


// Export the Metadata model
export default mongoose.model<IMetadata>("Metadata", MetadataSchema);
