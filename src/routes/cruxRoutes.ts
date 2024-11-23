// src/routes/cruxRoutes.ts

import express from "express";
import { getCruxData } from "../controllers/cruxController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/get-crux-data", authMiddleware, getCruxData);

export default router;
