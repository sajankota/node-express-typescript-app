// src/index.ts

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { trackApiCall } from "./middleware/analyticsMiddleware";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import reportRoutes from "./routes/reportRoutes";
import metaRoutes from "./routes/metaRoutes";
import headingRoutes from "./routes/headingRoutes";
import contentRoutes from "./routes/contentRoutes";
import linkRoutes from "./routes/linkRoutes";
import seoMetricsRoutes from "./routes/seoMetricsRoutes";
import performanceMetricsRoutes from "./routes/performanceMetricsRoutes";
import accessibilityRoutes from "./routes/accessibilityRoutes";
import cruxRoutes from "./routes/cruxRoutes";
import metricsRoutes from "./routes/metricsRoutes";

interface ProjectUpdatePayload {
  url: string;
  reportId: string;
  status: "processing" | "ready" | "error";
}

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:4000",
      "https://www.roundcodebox.com",
      "https://api.roundcodebox.com",
    ],
    methods: ["GET", "POST"],
  },
});

// Attach WebSocket server to the Express app
app.set("io", io);

// Middleware to track API calls
app.use(trackApiCall("General API Call", "All Routes"));

// Configuration
const PORT = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://www.roundcodebox.com",
        "http://localhost:5173",
        "https://api.roundcodebox.com",
      ];

      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      console.error(`CORS policy: The origin ${origin} is not allowed`);
      return callback(new Error("CORS policy: This origin is not allowed"), false);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Connect to MongoDB
connectDB();

// Static Files
const screenshotsDir = path.resolve(__dirname, "../screenshots");
app.use("/screenshots", express.static(screenshotsDir));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/meta-tags", metaRoutes);
app.use("/api/headings", headingRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/metrics", metricsRoutes);
app.use("/api/seo-metrics", seoMetricsRoutes);
app.use("/api/performance-metrics", performanceMetricsRoutes);
app.use("/api/accessibility-metrics", accessibilityRoutes);
app.use("/api/crux", cruxRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Hello from Node Express TypeScript app!");
});

// WebSocket Connection
io.on("connection", (socket) => {
  console.log(`[WebSocket] Connection established: ${socket.id}`);

  socket.on("subscribe", (data: { userId: string }) => {
    console.log(`[WebSocket] User subscribed to room:`, data);
    socket.join(data.userId);
  });

  // Debug WebSocket Emit
  const emitProjectUpdate = (userId: string, payload: ProjectUpdatePayload) => {
    console.log(`[WebSocket] Emitting to room ${userId}:`, payload);
    io.to(userId).emit("project_update", payload);
  };

  // Add this to verify:
  io.on("connection", (socket) => {
    console.log(`[WebSocket] Connection established: ${socket.id}`);

    socket.on("subscribe", (data: { userId: string }) => {
      console.log(`[WebSocket] User subscribed to room:`, data);
      socket.join(data.userId);
    });
  });


  // Simulate a status update for testing
  socket.on("test_project_update", (data: { userId: string }) => {
    const mockPayload: ProjectUpdatePayload = {
      url: "http://example.com",
      reportId: "mock-report-id",
      status: "ready",
    };
    emitProjectUpdate(data.userId, mockPayload);
  });
});

// Server Listener
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("[WebSocket] Server is ready to accept connections.");
});

export { io };
