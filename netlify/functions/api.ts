import express, { Express, Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import helmet from 'helmet';
import { Pool } from 'pg';

// Import routes - using relative paths from server directory
import authRoutes from '../../server/routes/auth';
import productRoutes from '../../server/routes/products';
import categoryRoutes from '../../server/routes/categories';
import cartRoutes from '../../server/routes/cart';
import wishlistRoutes from '../../server/routes/wishlist';
import addressRoutes from '../../server/routes/addresses';
import orderRoutes from '../../server/routes/orders';
import paymentMethodRoutes from '../../server/routes/paymentMethods';
import notificationPreferenceRoutes from '../../server/routes/notificationPreferences';
import shippingRoutes from '../../server/routes/shipping';
import sitemapRoutes from '../../server/routes/sitemap';
import razorpayRoutes from '../../server/routes/razorpay';

// Import admin routes
import adminAnalyticsRoutes from '../../server/routes/admin/analytics';
import adminProductsRoutes from '../../server/routes/admin/products';
import adminUsersRoutes from '../../server/routes/admin/users';
import adminOrdersRoutes from '../../server/routes/admin/orders';
import adminSettingsRoutes from '../../server/routes/admin/settings';

// Import public routes
import publicSettingsRoutes from '../../server/routes/public/settings';

// Import seller routes
import sellerProductsRoutes from '../../server/routes/seller/products';
import sellerOrdersRoutes from '../../server/routes/seller/orders';

// Import middleware
import { errorHandler } from '../../server/middleware/errorHandler';
import { requestLogger } from '../../server/middleware/requestLogger';

// Create Express app
const app: Express = express();

// Initialize database connection pool
let pool: Pool | null = null;

function initializeDatabase() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: parseInt(process.env.DB_POOL_SIZE || '20'),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    console.log('✓ Database connection pool initialized');
  }
}

// Initialize database on cold start
initializeDatabase();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // CSP is handled by Netlify headers
}));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    /^https:\/\/.*\.netlify\.app$/,
    process.env.FRONTEND_URL || '',
    process.env.VITE_SITE_URL || '',
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    let dbStatus = 'not configured';

    if (pool) {
      const result = await pool.query('SELECT NOW()');
      dbStatus = result.rows ? 'connected' : 'error';
    }

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      database: dbStatus
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Sitemap route
app.use('/', sitemapRoutes);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/notification-preferences', notificationPreferenceRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/razorpay', razorpayRoutes);

// Admin API Routes
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/products', adminProductsRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);

// Public API Routes
app.use('/api/public/settings', publicSettingsRoutes);

// Seller API Routes
app.use('/api/seller/products', sellerProductsRoutes);
app.use('/api/seller/orders', sellerOrdersRoutes);

// Error handling middleware
app.use(errorHandler);

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

