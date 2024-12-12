// src/index.ts

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { trackApiCall } from './middleware/analyticsMiddleware';
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import reportRoutes from "./routes/reportRoutes";
import metaRoutes from "./routes/metaRoutes";
import headingRoutes from "./routes/headingRoutes";
import contentRoutes from "./routes/contentRoutes";
import linkRoutes from "./routes/linkRoutes";
import { getIndividualReport, getUserUrls } from "./controllers/reportController";
import seoMetricsRoutes from "./routes/seoMetricsRoutes";
import performanceMetricsRoutes from "./routes/performanceMetricsRoutes";
import accessibilityRoutes from "./routes/accessibilityRoutes";
import cruxRoutes from "./routes/cruxRoutes";
import metricsRoutes from "./routes/metricsRoutes";


const app = express();

// Apply tracking middleware globally for all API calls
app.use(trackApiCall('General API Call', 'All Routes'));

const PORT = process.env.PORT || 4000;
const router = express.Router();


const allowedOrigins = [
  "https://www.roundcodebox.com",
  "http://localhost:5173",
  "https://api.roundcodebox.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error(`CORS policy: The origin ${origin} is not allowed`);
        return callback(new Error("CORS policy: This origin is not allowed"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

connectDB();

// Serve the screenshots directory as static files
const screenshotsDir = path.resolve(__dirname, "../screenshots");
app.use("/screenshots", express.static(screenshotsDir));

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/meta-tags", metaRoutes);
app.use("/api/headings", headingRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/metrics", metricsRoutes);
// seo-metrics route at /api/seo-metrics
app.use("/api/seo-metrics", seoMetricsRoutes);
// performance-metrics route at /api/performance-metrics
app.use("/api/performance-metrics", performanceMetricsRoutes);
// accessibility-metrics route at /api/accessibility-metrics
app.use("/api/accessibility-metrics", accessibilityRoutes);
// Add CrUX API routes
app.use("/api/crux", cruxRoutes);

app.get("/", (req, res) => {
  res.send("Hello from Node Express TypeScript app!");
});


// Route to fetch all user-related URLs (user-urls)
router.get("/user-urls", getUserUrls);

// Route to fetch an individual report by ID
router.get("/:id", getIndividualReport);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
