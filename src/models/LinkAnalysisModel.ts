// src/models/LinkAnalysisModel.ts

import mongoose, { Schema, Document } from "mongoose";

export interface Link {
    href: string;
    anchorText: string;
    isInternal: boolean;
}

export interface LinkAnalysisDocument extends Document {
    url: string;
    internalLinks: Link[];
    externalLinks: Link[];
}

const LinkSchema = new Schema<Link>(
    {
        href: { type: String, required: true }, // Link URL
        anchorText: { type: String, required: true }, // Anchor text
        isInternal: { type: Boolean, required: true }, // Whether the link is internal or external
    },
    { _id: false } // Prevent Mongoose from creating an `_id` field for subdocuments
);

const LinkAnalysisSchema = new Schema<LinkAnalysisDocument>(
    {
        url: { type: String, required: true }, // The analyzed page's URL
        internalLinks: { type: [LinkSchema], default: [] }, // Array of internal links
        externalLinks: { type: [LinkSchema], default: [] }, // Array of external links
    },
    { timestamps: true } // Automatically add createdAt and updatedAt fields
);

export default mongoose.model<LinkAnalysisDocument>(
    "LinkAnalysis",
    LinkAnalysisSchema
);
