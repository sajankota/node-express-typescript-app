// src/models/AnalysisReportModel.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IReportAnalysis extends Document {
    userId: string; // User who generated the report
    url: string; // The URL being analyzed
    analyses: {
        pageSpeed: {
            pageSpeedId?: string; // Reference to PageSpeed report
            status: "pending" | "completed" | "failed"; // Status of the report
            error?: string; // Error message (if any)
        };
        metaData: {
            metaDataId?: string; // Reference to MetaTags report
            status: "pending" | "completed" | "failed";
            error?: string;
        };
        linkAnalysis: {
            linkAnalysisId?: string; // Reference to Link analysis report
            status: "pending" | "completed" | "failed";
            error?: string;
        };
        headingAnalysis: {
            headingAnalysisId?: string; // Reference to Heading analysis report
            status: "pending" | "completed" | "failed";
            error?: string;
        };
        contentAnalysis: {
            contentAnalysisId?: string; // Reference to Content analysis report
            status: "pending" | "completed" | "failed";
            error?: string;
        };
    };
    createdAt: Date;
    updatedAt: Date;
}

const ReportAnalysisSchema: Schema = new Schema(
    {
        userId: { type: String, required: true },
        url: { type: String, required: true },
        analyses: {
            pageSpeed: {
                pageSpeedId: { type: String, default: null },
                status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
                error: { type: String, default: null },
            },
            metaData: {
                metaDataId: { type: String, default: null },
                status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
                error: { type: String, default: null },
            },
            linkAnalysis: {
                linkAnalysisId: { type: String, default: null },
                status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
                error: { type: String, default: null },
            },
            headingAnalysis: {
                headingAnalysisId: { type: String, default: null },
                status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
                error: { type: String, default: null },
            },
            contentAnalysis: {
                contentAnalysisId: { type: String, default: null },
                status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
                error: { type: String, default: null },
            },
        },
    },
    { timestamps: true }
);

export const ReportAnalysis = mongoose.model<IReportAnalysis>("ReportAnalysis", ReportAnalysisSchema);
