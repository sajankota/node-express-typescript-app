// src/models/HeadingModel.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IHeading extends Document {
    userId: string; // ID of the user who requested the extraction
    url: string; // URL of the page being scraped
    headings: { tag: string; text: string }[]; // Array of heading tags and their text
    counts: {
        h1: number;
        h2: number;
        h3: number;
        h4: number;
        h5: number;
        h6: number;
    }; // Count of each heading type
    createdAt: Date; // Timestamp when the record was created
}

const HeadingSchema: Schema = new Schema(
    {
        userId: { type: String, required: true },
        url: { type: String, required: true },
        headings: [
            {
                tag: { type: String, required: true },
                text: { type: String, required: true },
                id: { type: String },
                class: { type: String },
            },
        ],
        counts: {
            h1: { type: Number, default: 0 },
            h2: { type: Number, default: 0 },
            h3: { type: Number, default: 0 },
            h4: { type: Number, default: 0 },
            h5: { type: Number, default: 0 },
            h6: { type: Number, default: 0 },
        },
        hierarchy: [
            {
                tag: { type: String, required: true },
                text: { type: String, required: true },
                level: { type: Number, required: true },
                parent: { type: String },
            },
        ],
        createdAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);


export default mongoose.model<IHeading>("Heading", HeadingSchema);
