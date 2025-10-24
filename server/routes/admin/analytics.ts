import { Router, Response } from 'express';
import { query } from '../../db';
import { authenticate, authorize, AuthRequest } from '../../middleware/auth';
import { asyncHandler } from '../../middleware/errorHandler';

const router = Router();

/**
 * GET /api/admin/analytics/dashboard
 * Get dashboard analytics and metrics
 */
router.get(
  '/dashboard',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Get total users
    const usersResult = await query(
      'SELECT COUNT(*) as total FROM public.profiles'
    );
    const totalUsers = parseInt(usersResult.rows[0].total);

    // Get total products
    const productsResult = await query(
      'SELECT COUNT(*) as total FROM public.products WHERE is_active = true'
    );
    const totalProducts = parseInt(productsResult.rows[0].total);

    // Get total orders
    const ordersResult = await query(
      'SELECT COUNT(*) as total FROM public.orders'
    );
    const totalOrders = parseInt(ordersResult.rows[0].total);

    // Get total revenue
    const revenueResult = await query(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM public.orders WHERE payment_status = $1',
      ['paid']
    );
    const totalRevenue = parseFloat(revenueResult.rows[0].total);

    // Get pending orders
    const pendingOrdersResult = await query(
      'SELECT COUNT(*) as total FROM public.orders WHERE status IN ($1, $2, $3)',
      ['pending', 'confirmed', 'processing']
    );
    const pendingOrders = parseInt(pendingOrdersResult.rows[0].total);

    // Get low stock products
    const lowStockResult = await query(
      'SELECT COUNT(*) as total FROM public.products WHERE stock <= min_stock_level AND is_active = true'
    );
    const lowStockProducts = parseInt(lowStockResult.rows[0].total);

    // Get new users today
    const newUsersTodayResult = await query(
      'SELECT COUNT(*) as total FROM public.profiles WHERE DATE(created_at) = CURRENT_DATE'
    );
    const newUsersToday = parseInt(newUsersTodayResult.rows[0].total);

    // Get orders today
    const ordersTodayResult = await query(
      'SELECT COUNT(*) as total FROM public.orders WHERE DATE(created_at) = CURRENT_DATE'
    );
    const ordersToday = parseInt(ordersTodayResult.rows[0].total);

    // Get revenue today
    const revenueTodayResult = await query(
      'SELECT COALESCE(SUM(total_amount), 0) as total FROM public.orders WHERE DATE(created_at) = CURRENT_DATE AND payment_status = $1',
      ['paid']
    );
    const revenueToday = parseFloat(revenueTodayResult.rows[0].total);

    // Get top products
    const topProductsResult = await query(
      `SELECT p.id, p.name, p.price, p.images, p.stock, 
              COUNT(oi.id) as order_count,
              COALESCE(SUM(oi.quantity), 0) as total_sold
       FROM public.products p
       LEFT JOIN public.order_items oi ON p.id = oi.product_id
       WHERE p.is_active = true
       GROUP BY p.id, p.name, p.price, p.images, p.stock
       ORDER BY total_sold DESC
       LIMIT 5`
    );

    // Get recent orders
    const recentOrdersResult = await query(
      `SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at,
              p.full_name as customer_name, p.email as customer_email
       FROM public.orders o
       LEFT JOIN public.profiles p ON o.user_id = p.id
       ORDER BY o.created_at DESC
       LIMIT 10`
    );

    // Get low stock products list
    const lowStockProductsResult = await query(
      `SELECT id, name, stock, min_stock_level, price, images
       FROM public.products
       WHERE stock <= min_stock_level AND is_active = true
       ORDER BY stock ASC
       LIMIT 10`
    );

    // Get sales data for last 7 days
    const salesChartResult = await query(
      `SELECT DATE(created_at) as date, 
              COUNT(*) as orders,
              COALESCE(SUM(total_amount), 0) as revenue
       FROM public.orders
       WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
          pendingOrders,
          lowStockProducts,
          newUsersToday,
          ordersToday,
          revenueToday
        },
        topProducts: topProductsResult.rows,
        recentOrders: recentOrdersResult.rows,
        lowStockProductsList: lowStockProductsResult.rows,
        salesChart: salesChartResult.rows
      }
    });
  })
);

/**
 * GET /api/admin/analytics/revenue
 * Get revenue analytics
 */
router.get(
  '/revenue',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { period = '30' } = req.query;

    const revenueResult = await query(
      `SELECT DATE(created_at) as date,
              COUNT(*) as orders,
              COALESCE(SUM(total_amount), 0) as revenue
       FROM public.orders
       WHERE created_at >= CURRENT_DATE - INTERVAL '${period} days'
         AND payment_status = 'paid'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    res.json({
      success: true,
      data: revenueResult.rows
    });
  })
);

/**
 * GET /api/admin/analytics/products
 * Get product analytics
 */
router.get(
  '/products',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Get category distribution
    const categoryDistResult = await query(
      `SELECT c.name, COUNT(p.id) as count
       FROM public.categories c
       LEFT JOIN public.products p ON c.id = p.category_id AND p.is_active = true
       WHERE c.is_active = true
       GROUP BY c.name
       ORDER BY count DESC`
    );

    // Get stock status
    const stockStatusResult = await query(
      `SELECT 
         COUNT(CASE WHEN stock = 0 THEN 1 END) as out_of_stock,
         COUNT(CASE WHEN stock > 0 AND stock <= min_stock_level THEN 1 END) as low_stock,
         COUNT(CASE WHEN stock > min_stock_level THEN 1 END) as in_stock
       FROM public.products
       WHERE is_active = true`
    );

    res.json({
      success: true,
      data: {
        categoryDistribution: categoryDistResult.rows,
        stockStatus: stockStatusResult.rows[0]
      }
    });
  })
);

/**
 * GET /api/admin/analytics/users
 * Get user analytics
 */
router.get(
  '/users',
  authenticate,
  authorize('admin'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    // Get user growth over last 30 days
    const userGrowthResult = await query(
      `SELECT DATE(created_at) as date, COUNT(*) as new_users
       FROM public.profiles
       WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    // Get user role distribution
    const roleDistResult = await query(
      `SELECT role, COUNT(*) as count
       FROM public.profiles
       GROUP BY role`
    );

    res.json({
      success: true,
      data: {
        userGrowth: userGrowthResult.rows,
        roleDistribution: roleDistResult.rows
      }
    });
  })
);

export default router;

