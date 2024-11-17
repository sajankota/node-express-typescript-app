// src/routes/reportRoutes.ts
import express from 'express';
import { generateLighthouseReport, getReportHistory } from '../controllers/reportController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/generate', verifyToken, generateLighthouseReport);
router.get('/history', verifyToken, getReportHistory);

export default router;
