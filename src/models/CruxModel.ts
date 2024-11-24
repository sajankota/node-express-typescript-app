// src/models/CruxModel.ts

import mongoose, { Schema, Document } from "mongoose";

export interface ICruxResponse extends Document {
    userId: string; // ID of the user who generated the report
    url: string;
    response: object; // Store the API response as an object
    createdAt: Date;
}

const CruxResponseSchema = new Schema<ICruxResponse>({
    userId: { type: String, required: true }, // ID of the user who generated the report
    url: { type: String, required: true },
    response: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICruxResponse>("CruxModel", CruxResponseSchema);
