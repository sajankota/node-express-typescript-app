// src/models/reportModel.ts

import mongoose, { Schema, Document } from 'mongoose';

// Define the report interface
export interface IReport extends Document {
    userId: string;
    url: string;
    mobileReport: object;
    desktopReport: object;
    createdAt: Date;
}

// Define the report schema
const reportSchema = new Schema<IReport>(
    {
        userId: { type: String, required: true },
        url: { type: String, required: true },
        mobileReport: { type: Object, required: true },
        desktopReport: { type: Object, required: true },
    },
    { timestamps: true }
);

// Create the Report model
export const Report = mongoose.model<IReport>('Report', reportSchema);
