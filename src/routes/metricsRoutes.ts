// src/routes/metricsRoutes.ts

import { Router } from "express";
import { processMetrics } from "../controllers/processMetrics";
import { getProcessedMetrics } from "../controllers/getProcessedMetrics";
import { getGeneratedUrls } from "../controllers/getGeneratedUrls";

const router = Router();

router.post("/process-metrics", processMetrics); // Triggers worker threads
router.get("/processed-metrics", getProcessedMetrics); // Fetch processed metrics
router.get("/generated-urls", getGeneratedUrls); // Fetch URLs with processed metrics

export default router;
