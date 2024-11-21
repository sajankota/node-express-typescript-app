// src/models/reportModel.ts

import mongoose, { Schema, Document } from 'mongoose';

// Define the report interface
export interface IReport extends Document {
    userId: string; // ID of the user who generated the report
    url: string; // The URL being analyzed
    mobileReport: object; // Mobile-specific analysis data
    desktopReport: object; // Desktop-specific analysis data
    createdAt: Date; // Timestamp when the report was created
}

// Define the report schema
const reportSchema = new Schema<IReport>(
    {
        userId: { type: String, required: true }, // ID of the user who generated the report
        url: { type: String, required: true }, // The URL being analyzed
        mobileReport: { type: Object, required: true }, // Mobile-specific analysis data
        desktopReport: { type: Object, required: true }, // Desktop-specific analysis data
    },
    { timestamps: true } // Automatically add `createdAt` and `updatedAt` fields
);

// Create and export the Report model
export const Report = mongoose.model<IReport>('Report', reportSchema);
