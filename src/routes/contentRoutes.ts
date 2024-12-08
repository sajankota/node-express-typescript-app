// src/routes/contentRoutes.ts

import express from 'express';
import { getContent } from '../controllers/contentController';
import { authMiddleware } from '../middleware/authMiddleware';
import { trackApiCall } from '../middleware/analyticsMiddleware';

const router = express.Router();

// Track API calls for content route
router.post(
    '/',
    authMiddleware,
    trackApiCall('Generate Content', 'Content API'),
    getContent
);

export default router;
