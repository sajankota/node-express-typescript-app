// src/models/MetadataModel.ts

import mongoose, { Schema, Document } from "mongoose";

// Define the Metadata interface for TypeScript
interface IMetadata extends Document {
    userId: string; // ID of the user who requested the metadata
    url: string; // The URL being scraped
    metadata: {
        title?: string;
        description?: string;
        author?: string;
        date?: string;
        audio?: string;
        feed?: string;
        image?: string;
        iframe?: string;
        lang?: string;
        logo?: string;
        logoFavicon?: string;
        mediaProvider?: string;
        publisher?: string;
        readability?: string;
        video?: string;
        url?: string;
    };
}

// Define the Metadata schema
const MetadataSchema: Schema = new Schema(
    {
        userId: { type: String, required: true },
        url: {
            type: String,
            required: true,
            validate: {
                validator: function (v: string) {
                    return /^(https?:\/\/)/.test(v); // Simple URL validation
                },
                message: (props: any) => `${props.value} is not a valid URL!`,
            },
        },
        metadata: {
            title: { type: String, default: "" },
            description: { type: String, default: "" },
            author: { type: String, default: "" },
            date: { type: String, default: "" },
            audio: { type: String, default: "" },
            feed: { type: String, default: "" },
            image: { type: String, default: "" },
            iframe: { type: String, default: "" },
            lang: { type: String, default: "" },
            logo: { type: String, default: "" },
            logoFavicon: { type: String, default: "" },
            mediaProvider: { type: String, default: "" },
            publisher: { type: String, default: "" },
            readability: { type: String, default: "" },
            video: { type: String, default: "" },
            url: { type: String, default: "" },
        },
    },
    { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Export the Metadata model
export default mongoose.model<IMetadata>("Metadata", MetadataSchema);
