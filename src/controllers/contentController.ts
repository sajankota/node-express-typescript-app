// src/controllers/contentController.ts

import { Request, Response } from "express";
import { io } from "../index"; // WebSocket instance
import { fetchWithAxios, fetchWithPuppeteer, processContent, saveContentToDB } from "../services/contentService";

export const getContent = async (req: Request, res: Response): Promise<void> => {
    const { url, userId } = req.body;

    if (!url || !userId) {
        res.status(400).json({ error: "Missing 'url' or 'userId' in request body" });
        return;
    }

    try {
        let htmlContent = await fetchWithAxios(url).catch(() => fetchWithPuppeteer(url));
        const { metadata, textContent, favicon } = processContent(htmlContent, url);

        const savedContent = await saveContentToDB({
            userId,
            url,
            metadata,
            textContent,
            favicon,
            dynamic: htmlContent.includes("<script>"),
            htmlContent,
        });

        // Emit WebSocket event
        io.to(userId).emit("project_update", {
            url: savedContent.url,
            reportId: savedContent._id,
            metadata: savedContent.metadata,
            generatedAt: savedContent.createdAt,
        });

        res.status(200).json({ message: "Report generated successfully." });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate report." });
    }
};
