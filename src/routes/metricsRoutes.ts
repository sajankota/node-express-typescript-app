// src/routes/metricsRoutes.ts

import { Router } from "express";
import { processMetrics } from "../controllers/processMetrics";
import { getProcessedMetrics } from "../controllers/getProcessedMetrics";
import { getGeneratedUrls } from "../controllers/getGeneratedUrls";
import { getReportById } from "../controllers/getReportById";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

// Route to process metrics
router.post("/process-metrics", authMiddleware, processMetrics); // Triggers worker threads

// Route to get processed metrics
router.get("/processed-metrics", authMiddleware, getProcessedMetrics); // Fetch processed metrics

// Route to fetch generated URLs
router.get("/generated-urls", authMiddleware, getGeneratedUrls); // Fetch URLs with processed metrics

// Route to fetch a specific report by ID
router.get("/report/:reportId", authMiddleware, getReportById); // Fetch a specific report by its ID

export default router;
