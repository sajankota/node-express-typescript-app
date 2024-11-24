// src/routes/cruxRoutes.ts

import express from "express";
import { getCruxData, getCruxReports } from "../controllers/cruxController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/get-crux-data", authMiddleware, getCruxData);


// New endpoint to fetch Crux reports
router.get("/get-reports", authMiddleware, getCruxReports);


export default router;
