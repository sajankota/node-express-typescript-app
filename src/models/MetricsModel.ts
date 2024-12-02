// src/models/MetricsModel.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IMetrics extends Document {
    userId: string;
    url: string;
    metrics: {
        seo: object;
        security: object;
        performance: object;
        miscellaneous: object;
    };
    createdAt: Date;
}

const MetricsSchema = new Schema<IMetrics>({
    userId: { type: String, required: true },
    url: { type: String, required: true },
    metrics: {
        seo: { type: Object, required: true },
        security: { type: Object, required: true },
        performance: { type: Object, required: true },
        miscellaneous: { type: Object, required: true },
    },
    createdAt: { type: Date, default: Date.now },
});

export const Metrics = mongoose.model<IMetrics>("Metrics", MetricsSchema);
