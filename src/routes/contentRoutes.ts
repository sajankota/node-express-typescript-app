// src/routes/contentRoutes.ts

import express from "express";
import { getContent } from "../controllers/contentController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// POST /api/content
router.post("/", authMiddleware, getContent);

export default router;
