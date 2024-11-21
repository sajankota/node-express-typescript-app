// src/routes/headingRoutes.ts

import express from "express";
import { getHeadings } from "../controllers/headingController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// POST /api/headings - Extract heading tags from a given URL
router.post("/", authMiddleware, getHeadings);

export default router;
