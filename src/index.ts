// src/index.ts

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import reportRoutes from "./routes/reportRoutes";
import metaRoutes from "./routes/metaRoutes";
import headingRoutes from "./routes/headingRoutes";
import contentRoutes from "./routes/contentRoutes";
import linkRoutes from "./routes/linkRoutes";
import { getIndividualReport, getUserUrls } from "./controllers/reportController";
import seoMetricsRoutes from "./routes/seoMetricsRoutes";

const app = express();
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

// Define routes
app.use("/api/auth", authRoutes); // Authentication routes
app.use("/api/report", reportRoutes); // Report-related routes
app.use("/api/meta-tags", metaRoutes); // Meta-tags routes
app.use("/api/headings", headingRoutes); // Headings routes
app.use("/api/content", contentRoutes); // Content routes
app.use("/api/links", linkRoutes); // Links routes

// seo-metrics route at /api/seo-metrics
app.use("/api/seo-metrics", seoMetricsRoutes); // SEO Metrics routes


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
