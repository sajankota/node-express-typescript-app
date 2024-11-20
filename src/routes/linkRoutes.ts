//src/routes/linkRoutes.ts

import express from "express";
import { analyzeLinksController } from "../controllers/linkController";
import { verifyToken } from '../middleware/authMiddleware'

const router = express.Router();

// Link analysis endpoint
router.post("/analyze-links", verifyToken, analyzeLinksController);

export default router;
