import express, { Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import routes
import { initializeDatabase } from '../../server/db/connection.js';
import authRoutes from '../../server/routes/auth.js';
import productsRoutes from '../../server/routes/products.js';
import categoriesRoutes from '../../server/routes/categories.js';
import cartRoutes from '../../server/routes/cart.js';
import wishlistRoutes from '../../server/routes/wishlist.js';
import ordersRoutes from '../../server/routes/orders.js';
import addressesRoutes from '../../server/routes/addresses.js';
import paymentMethodsRoutes from '../../server/routes/paymentMethods.js';
import notificationPreferencesRoutes from '../../server/routes/notificationPreferences.js';
import adminAnalyticsRoutes from '../../server/routes/admin/analytics.js';
import adminOrdersRoutes from '../../server/routes/admin/orders.js';
import adminProductsRoutes from '../../server/routes/admin/products.js';
import adminUsersRoutes from '../../server/routes/admin/users.js';
import sellerProductsRoutes from '../../server/routes/seller/products.js';
import sellerOrdersRoutes from '../../server/routes/seller/orders.js';

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    /^https:\/\/.*\.netlify\.app$/,
    /^https:\/\/aligarh-attars\.netlify\.app$/,
  ],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`→ ${req.method} ${req.path}`);
  next();
});

// Initialize database on first request
let dbInitialized = false;
app.use(async (req: Request, res: Response, next: NextFunction) => {
  if (!dbInitialized) {
    try {
      await initializeDatabase();
      dbInitialized = true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }
  next();
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/payment-methods', paymentMethodsRoutes);
app.use('/api/notification-preferences', notificationPreferencesRoutes);

// Admin Routes
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/admin/products', adminProductsRoutes);
app.use('/api/admin/users', adminUsersRoutes);

// Seller Routes
app.use('/api/seller/products', sellerProductsRoutes);
app.use('/api/seller/orders', sellerOrdersRoutes);

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

