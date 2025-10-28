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
import adminSettingsRoutes from './routes/admin/settings';

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
  origin: [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:5173$/, // Allow local network access
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:5173$/, // Allow private network
    /^http:\/\/172\.(1[6-9]|2[0-9]|3[0-1])\.\d{1,3}\.\d{1,3}:5173$/ // Allow private network
  ],
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
app.use('/api/admin/settings', adminSettingsRoutes);

// Seller API Routes
app.use('/api/seller/products', sellerProductsRoutes);
app.use('/api/seller/orders', sellerOrdersRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Auto-initialize database with schema and sample data
    await autoInitializeDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server running on:`);
      console.log(`  - Local:   http://localhost:${PORT}`);
      console.log(`  - Network: http://<your-ip>:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n📱 To access from mobile on same network:`);
      console.log(`  1. Find your computer's IP address`);
      console.log(`  2. On mobile, open: http://<your-ip>:5173`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;