import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

// Enable CORS for all routes
app.use(cors());
app.use(
    cors({
      origin: ['https://wwwroundcodebox.com', 'http://localhost:5173'],
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );
  

// Simple endpoint for testing
app.get('/', (req: Request, res: Response) => {
  res.send('Hello from Node Express TypeScript app!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
