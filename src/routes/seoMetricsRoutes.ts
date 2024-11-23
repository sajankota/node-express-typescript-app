// src/routes/seoMetricsRoutes.tsx;

import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getMobileSEOMetrics, getDesktopSEOMetrics } from "../controllers/seoMetricsController";

const router = express.Router();

// Route to fetch SEO metrics by report ID
router.get("/mobile/:reportId", authMiddleware, getMobileSEOMetrics); // Fetch a specific SEO metric by report ID

// Route to fetch SEO metrics for desktop by report ID
router.get("/desktop/:reportId", authMiddleware, getDesktopSEOMetrics);

export default router;
