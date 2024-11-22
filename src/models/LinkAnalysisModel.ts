// src/models/LinkAnalysisModel.ts

import mongoose, { Schema, Document } from "mongoose";

// Define the Link interface for individual link details
export interface Link {
    href: string; // Link URL
    anchorText: string; // Anchor text of the link
    isInternal: boolean; // Whether the link is internal or external
}

// Define the LinkAnalysisDocument interface for TypeScript
export interface LinkAnalysisDocument extends Document {
    url: string; // URL of the analyzed page
    internalLinks: Link[]; // Array of internal links
    externalLinks: Link[]; // Array of external links
}

// Define the schema for individual links
const LinkSchema = new Schema<Link>(
    {
        href: { type: String, required: true }, // Link URL
        anchorText: { type: String, required: true }, // Anchor text
        isInternal: { type: Boolean, required: true }, // Whether the link is internal or external
    },
    { _id: false } // Prevent Mongoose from creating an `_id` field for subdocuments
);

// Define the schema for link analysis
const LinkAnalysisSchema = new Schema<LinkAnalysisDocument>(
    {
        url: { type: String, required: true }, // The analyzed page's URL
        internalLinks: { type: [LinkSchema], default: [] }, // Array of internal links
        externalLinks: { type: [LinkSchema], default: [] }, // Array of external links
    },
    { timestamps: true } // Automatically add createdAt and updatedAt fields
);

// Export the LinkAnalysis model
export default mongoose.model<LinkAnalysisDocument>("LinkAnalysis", LinkAnalysisSchema);
