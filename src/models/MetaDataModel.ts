import mongoose, { Schema, Document } from "mongoose";

interface IMetadata extends Document {
    userId: string; // ID of the user who requested the metadata
    url: string; // The URL being scraped
    metadata: {
        title: string;
        description: string;
        keywords: string;
        favicon: string;
        language: string; // New field for language
        author: string; // New field for author
        viewport: string; // New field for viewport
        og: {
            title: string;
            description: string;
            image: string;
            url: string;
            type: string;
            site_name: string;
        };
        twitter: {
            title: string;
            description: string;
            image: string;
            card: string;
        };
        custom: Record<string, string>; // For additional meta tags
    };
    createdAt: Date; // Timestamp when the record was created
}

const MetadataSchema: Schema = new Schema(
    {
        userId: { type: String, required: true },
        url: { type: String, required: true },
        metadata: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            keywords: { type: String, default: "" },
            favicon: { type: String, default: "" },
            language: { type: String, default: "" }, // New field
            author: { type: String, default: "" }, // New field
            viewport: { type: String, default: "" }, // New field
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
            custom: { type: Map, of: String }, // Dynamic key-value pairs for additional meta tags
        },
        createdAt: { type: Date, default: Date.now }, // Automatically set the timestamp
    },
    { timestamps: true } // Automatically add `createdAt` and `updatedAt` fields
);

export default mongoose.model<IMetadata>("Metadata", MetadataSchema);
