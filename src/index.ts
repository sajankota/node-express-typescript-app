//src/index.ts

import cors from 'cors';
import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS with specific origin
app.use(cors({
  origin: ['http://localhost:5173', 'https://www.roundcodebox.com'],
  credentials: true,
}));

// Simple endpoint for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Node Express TypeScript app!');
});

// Health check endpoint
app.get('/api/health-check', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Node.js API!' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
