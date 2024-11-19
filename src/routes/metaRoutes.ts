// src/routes/metaRoutes.ts

import express from "express";
import { getMetaTags, getUserMetaTags } from "../controllers/metaController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

// POST /api/meta - Get meta tags for a URL (requires authentication)
router.post("/", verifyToken, getMetaTags);

// GET /api/meta/ - Retrieve saved metadata for the logged-in user
router.get("/", verifyToken, getUserMetaTags);

export default router;
