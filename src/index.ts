// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

// Define allowed origins (including your frontend and API domain)
const allowedOrigins = [
  'https://www.roundcodebox.com',
  'http://localhost:5173',
  'https://api.roundcodebox.com',
];

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Allow requests with no origin
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

// Middleware
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.send('Hello from Node Express TypeScript app!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
