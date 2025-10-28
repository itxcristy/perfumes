import express, { Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import helmet from 'helmet';

// Note: For Netlify deployment, environment variables are set in Netlify dashboard
// No need to load .env file in production

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    /^https:\/\/.*\.netlify\.app$/,
    process.env.VITE_SITE_URL || '',
  ].filter(Boolean),
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`→ ${req.method} ${req.path}`);
  next();
});

// Health check endpoint (no database required)
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production'
  });
});

// Mock API endpoints for frontend-only deployment
// These will return sample data until a real database is connected

// Products endpoint
app.get('/api/products', (req: Request, res: Response) => {
  res.json({
    products: [],
    total: 0,
    page: 1,
    limit: 20
  });
});

// Categories endpoint
app.get('/api/categories', (req: Request, res: Response) => {
  res.json({
    categories: []
  });
});

// Auth endpoints
app.post('/api/auth/login', (req: Request, res: Response) => {
  res.status(501).json({
    error: 'Database not configured. Please set DATABASE_URL environment variable in Netlify.'
  });
});

app.post('/api/auth/signup', (req: Request, res: Response) => {
  res.status(501).json({
    error: 'Database not configured. Please set DATABASE_URL environment variable in Netlify.'
  });
});

// Cart endpoints
app.get('/api/cart', (req: Request, res: Response) => {
  res.json({ items: [], total: 0 });
});

// Wishlist endpoints
app.get('/api/wishlist', (req: Request, res: Response) => {
  res.json({ items: [] });
});

// Orders endpoints
app.get('/api/orders', (req: Request, res: Response) => {
  res.json({ orders: [] });
});

// Catch-all for unimplemented endpoints
app.use('/api/*', (req: Request, res: Response) => {
  res.status(501).json({
    error: 'This endpoint requires database configuration',
    message: 'Please configure DATABASE_URL in Netlify environment variables',
    path: req.path,
    method: req.method,
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    status,
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    method: req.method,
  });
});

// Export handler for Netlify Functions
export const handler = serverless(app);

