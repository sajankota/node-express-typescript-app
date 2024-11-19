// src/routes/contentRoutes.ts

import express from "express";
import { getContent } from "../controllers/contentController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

// POST /api/content
router.post("/", verifyToken, getContent);

export default router;
