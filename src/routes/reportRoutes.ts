// src/routes/reportRoutes.ts

import express from 'express';
import { generateReport } from '../controllers/reportController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/generate', verifyToken, generateReport);

export default router;
