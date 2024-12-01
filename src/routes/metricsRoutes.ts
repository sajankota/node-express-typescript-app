// src/routes/metricsRoutes.ts

import express from "express";
import { getGeneratedUrls } from "../controllers/getGeneratedUrls";
import { processMetrics } from "../controllers/processMetrics";
import { getProcessedMetrics } from "../controllers/getProcessedMetrics";

const router = express.Router();

// Route to process metrics
router.post("/process-metrics", processMetrics);

// Route to get processed metrics
router.get("/processed-metrics", getProcessedMetrics);

// New route to get generated URLs
router.get("/generated-urls", getGeneratedUrls);

export default router;
