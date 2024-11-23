import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
    getMobilePerformanceMetrics,
    getDesktopPerformanceMetrics,
} from "../controllers/performanceMetricsController";

const router = express.Router();

// Route to fetch Mobile Performance metrics by report ID
router.get("/mobile/:reportId", authMiddleware, getMobilePerformanceMetrics);

// Route to fetch Desktop Performance metrics by report ID
router.get("/desktop/:reportId", authMiddleware, getDesktopPerformanceMetrics);

export default router;
