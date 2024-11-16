//src/index.ts

import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS
app.use(cors());

// Root endpoint
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
