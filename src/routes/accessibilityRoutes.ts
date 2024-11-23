// src/routes/accessibilityRoutes.ts

import express from "express";
import {
    getMobileAccessibilityMetrics,
    getDesktopAccessibilityMetrics,
} from "../controllers/accessibilityMetricsController";
import { authMiddleware } from "../middleware/authMiddleware"; // Include authentication middleware if required

const router = express.Router();

// Route to fetch mobile Accessibility metrics
router.get("/mobile/:reportId", authMiddleware, getMobileAccessibilityMetrics);

// Route to fetch desktop Accessibility metrics
router.get("/desktop/:reportId", authMiddleware, getDesktopAccessibilityMetrics);

export default router;
