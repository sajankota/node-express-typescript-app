// src/models/reportModel.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
    userId: string;
    url: string;
    mobilePerformanceScore: number;
    desktopPerformanceScore: number;
    mobileReport: object;
    desktopReport: object;
    timestamp: Date;
}

const reportSchema = new Schema<IReport>(
    {
        userId: { type: String, required: true },
        url: { type: String, required: true },
        mobilePerformanceScore: { type: Number, required: true },
        desktopPerformanceScore: { type: Number, required: true },
        mobileReport: { type: Object, required: true },
        desktopReport: { type: Object, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

export const Report = mongoose.model<IReport>('Report', reportSchema);
