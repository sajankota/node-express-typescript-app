// src/models/CruxModel.ts

import mongoose, { Schema, Document } from "mongoose";

export interface ICruxResponse extends Document {
    url: string;
    response: object; // Store the API response as an object
    createdAt: Date;
}

const CruxResponseSchema = new Schema<ICruxResponse>({
    url: { type: String, required: true },
    response: { type: Schema.Types.Mixed, required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICruxResponse>("CruxModel", CruxResponseSchema);
