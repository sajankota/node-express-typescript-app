import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 4000;

// Simple endpoint for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Node Express TypeScript app!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
