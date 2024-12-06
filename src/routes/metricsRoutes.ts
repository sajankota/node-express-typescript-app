// src/routes/metricsRoutes.ts

import { Router } from "express";
import { processMetrics } from "../controllers/processMetrics";
import { getProcessedMetrics } from "../controllers/getProcessedMetrics";
import { getGeneratedUrls } from "../controllers/getGeneratedUrls";
import { getReportById } from "../controllers/getReportById"; // Import the controller
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/process-metrics", authMiddleware, processMetrics); // Triggers worker threads
router.get("/processed-metrics", authMiddleware, getProcessedMetrics); // Fetch processed metrics
router.get("/generated-urls", authMiddleware, getGeneratedUrls); // Fetch URLs with processed metrics
router.get("/report/:reportId", authMiddleware, getReportById); // Add this route to fetch a specific report

export default router;
