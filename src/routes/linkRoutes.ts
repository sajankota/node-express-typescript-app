//src/routes/linkRoutes.ts

import express from "express";
import { analyzeLinksController } from "../controllers/linkController";
import { authMiddleware } from '../middleware/authMiddleware'

const router = express.Router();

// Link analysis endpoint
router.post("/", authMiddleware, analyzeLinksController);

export default router;
