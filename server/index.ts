import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { autoInitializeDatabase } from './scripts/autoInitDb'; // Use our new auto-init script
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import cartRoutes from './routes/cart';
import wishlistRoutes from './routes/wishlist';
import addressRoutes from './routes/addresses';
import orderRoutes from './routes/orders';
import paymentMethodRoutes from './routes/paymentMethods';
import notificationPreferenceRoutes from './routes/notificationPreferences';

// Import admin routes
import adminAnalyticsRoutes from './routes/admin/analytics';
import adminProductsRoutes from './routes/admin/products';
import adminUsersRoutes from './routes/admin/users';
import adminOrdersRoutes from './routes/admin/orders';

// Import seller routes
import sellerProductsRoutes from './routes/seller/products';
import sellerOrdersRoutes from './routes/seller/orders';

// Load environment variables from project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
// Increase payload limits for image uploads and large data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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

// Admin API Routes
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/products', adminProductsRoutes);
app.use('/api/admin/users', adminUsersRoutes);
app.use('/api/admin/orders', adminOrdersRoutes);

// Seller API Routes
app.use('/api/seller/products', sellerProductsRoutes);
app.use('/api/seller/orders', sellerOrdersRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Auto-initialize database with schema and sample data
    console.log('🔧 Auto-initializing database...');
    await autoInitializeDatabase();
    console.log('✓ Database auto-initialized successfully');

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;