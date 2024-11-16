// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes';


const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
// CORS Configuration
const allowedOrigins = ['https://www.roundcodebox.com', 'http://localhost:5173', 'https://api.roundcodebox.com'];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error('CORS policy: This origin is not allowed'), false);
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Allow cookies and credentials
  })
);

// Handle preflight requests
app.options('*', cors());

app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI!).then(() => {
  console.log('Connected to MongoDB');
});

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
