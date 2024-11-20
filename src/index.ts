// src/index.ts

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import reportRoutes from './routes/reportRoutes';
import metaRoutes from './routes/metaRoutes';
import headingRoutes from "./routes/headingRoutes";
import contentRoutes from "./routes/contentRoutes";
import linkRoutes from "./routes/linkRoutes";

const app = express();
const PORT = process.env.PORT || 4000;

const allowedOrigins = [
  'https://www.roundcodebox.com',
  'http://localhost:5173',
  'https://api.roundcodebox.com',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        console.error(`CORS policy: The origin ${origin} is not allowed`);
        return callback(new Error('CORS policy: This origin is not allowed'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/meta-tags', metaRoutes);
app.use("/api/headings", headingRoutes);
app.use("/api/content", contentRoutes);
app.use("/api/links", linkRoutes);

app.get('/', (req, res) => {
  res.send('Hello from Node Express TypeScript app!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
