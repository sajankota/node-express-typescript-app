// src/routes/reportRoutes.ts

import express from 'express';
import { generateReport, getUserUrls, getIndividualReport } from '../controllers/reportController';
import { verifyToken } from '../middleware/authMiddleware';

const router = express.Router();

// POST /api/report/generate - Generate a new report
router.post('/generate', verifyToken, generateReport);

// GET /api/report/user-urls - Get distinct URLs and monthly report count for the user
router.get('/user-urls', verifyToken, getUserUrls);

// GET /api/report/:id - Get an individual report by ID
router.get('/:id', verifyToken, getIndividualReport);

export default router;
