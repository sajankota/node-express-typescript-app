//src/index.ts

import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS
app.use(cors({ origin: ['http://localhost:5173', 'https://www.roundcodebox.com'], credentials: true }));

// Root endpoint (fix for "Cannot GET /")
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Node.js App on EC2! This is the root endpoint.');
});

// Health check endpoint
app.get('/api/health-check', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Node.js API!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
