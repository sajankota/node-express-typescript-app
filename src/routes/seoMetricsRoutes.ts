// src/routes/seoMetricsRoutes.tsx;

import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getSEOMetrics } from "../controllers/seoMetricsController";

const router = express.Router();

// Route to fetch SEO metrics by report ID
router.get("/:reportId", authMiddleware, getSEOMetrics); // Fetch a specific SEO metric by report ID

export default router;
