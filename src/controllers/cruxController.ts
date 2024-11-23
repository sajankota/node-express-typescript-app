// src/controllers/cruxController.ts

import axios from "axios";
import { Request, Response } from "express";
import CruxModel from "../models/CruxModel";
import { ReportAnalysis } from "../models/AnalysisReportModel";
import { AuthRequest } from "../middleware/authMiddleware";

const GOOGLE_CRUX_API = "https://chromeuxreport.googleapis.com/v1/records:queryRecord";

export const getCruxData = async (req: AuthRequest, res: Response): Promise<void> => {
    const { url } = req.body;

    if (!url) {
        res.status(400).json({ error: "URL is required" });
        return;
    }

    try {
        const apiKey = process.env.CRUX_API_KEY;
        if (!apiKey) {
            res.status(500).json({ error: "Missing CRUX API Key in environment variables" });
            return;
        }

        // Fetch data from the CrUX API
        const cruxResponse = await axios.post(
            GOOGLE_CRUX_API,
            { url }, // The request payload
            {
                params: { key: apiKey }, // API key as query parameter
                headers: { "Content-Type": "application/json" },
            }
        );

        console.log("[Debug] CrUX API response received:", cruxResponse.data);

        // Save the CrUX response in the CruxModel schema
        const newCruxResponse = new CruxModel({
            url,
            response: cruxResponse.data,
        });

        await newCruxResponse.save();
        console.log("[Debug] Saved successfully to CruxModel:", newCruxResponse);

        // Update the ReportAnalysis collection
        const userId = req.user?.userId; // Extract userId from the authenticated request
        if (!userId) {
            res.status(401).json({ error: "Unauthorized request" });
            return;
        }

        const updatedReport = await ReportAnalysis.findOneAndUpdate(
            { userId, url }, // Find the report for the same user and URL
            {
                $set: {
                    "analyses.cruxResponse": {
                        cruxResponseId: newCruxResponse._id, // Save the CruxModel _id
                        status: "completed",
                        error: null,
                    },
                },
            },
            { new: true, upsert: true } // Create a new document if not found
        );

        console.log("[Debug] Updated ReportAnalysis:", updatedReport);

        res.status(200).json({
            message: "CrUX data fetched and saved successfully.",
            data: newCruxResponse,
        });
    } catch (error: unknown) {
        console.error("[CrUX Controller] Error:", error);

        // Handle errors and update the ReportAnalysis status
        try {
            const userId = req.user?.userId;
            if (userId) {
                await ReportAnalysis.findOneAndUpdate(
                    { userId, url },
                    {
                        $set: {
                            "analyses.cruxResponse.status": "failed",
                            "analyses.cruxResponse.error": error instanceof Error ? error.message : "Unknown error occurred",
                        },
                    },
                    { new: true, upsert: true }
                );
            }
        } catch (updateError) {
            console.error("[Debug] Failed to update ReportAnalysis:", updateError);
        }

        res.status(500).json({
            error: "Failed to fetch CrUX data.",
            details: error instanceof Error ? error.message : "Unknown error occurred.",
        });
    }
};
