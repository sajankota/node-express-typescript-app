
// src/routes/reportRoutes.ts

import express from "express";
import {
    generateReport,
    getUserUrls,
    getIndividualReport,
} from "../controllers/reportController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Add this first to avoid conflict
router.get("/user-urls", authMiddleware, getUserUrls); // Fetch all user URLs

router.get("/:id", authMiddleware, getIndividualReport); // Fetch an individual report by ID

router.post("/generate", authMiddleware, generateReport); // Generate a new report

export default router;
