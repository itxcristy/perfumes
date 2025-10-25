import { Router, Response } from 'express';
import { query } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/orders
 * Get all orders for the authenticated user
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await query(
      `SELECT o.id, o.order_number, o.user_id, o.total_amount, o.status, 
              o.payment_status, o.payment_method, o.shipping_address, 
              o.billing_address, o.tracking_number, o.notes,
              o.created_at, o.updated_at,
              COUNT(oi.id) as item_count
       FROM public.orders o
       LEFT JOIN public.order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  })
);

/**
 * GET /api/orders/:id
 * Get a specific order with items
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Get order details
    const orderResult = await query(
      `SELECT o.id, o.order_number, o.user_id, o.total_amount, o.status, 
              o.payment_status, o.payment_method, o.shipping_address, 
              o.billing_address, o.tracking_number, o.notes,
              o.created_at, o.updated_at
       FROM public.orders o
       WHERE o.id = $1 AND o.user_id = $2`,
      [id, req.userId]
    );

    if (orderResult.rows.length === 0) {
      throw createError('Order not found', 404, 'NOT_FOUND');
    }

    // Get order items
    const itemsResult = await query(
      `SELECT oi.id, oi.product_id, oi.quantity, oi.price, oi.subtotal,
              p.name as product_name, p.images as product_images
       FROM public.order_items oi
       LEFT JOIN public.products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id]
    );

    const order = orderResult.rows[0];
    order.items = itemsResult.rows;

    res.json({
      success: true,
      data: order
    });
  })
);

/**
 * POST /api/orders
 * Create a new order
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      items,
      shippingAddress,
      billingAddress,
      paymentMethod,
      total
    } = req.body;

    // Validation
    if (!items || items.length === 0) {
      throw createError('Order must contain at least one item', 400, 'VALIDATION_ERROR');
    }

    if (!shippingAddress) {
      throw createError('Shipping address is required', 400, 'VALIDATION_ERROR');
    }

    if (!paymentMethod) {
      throw createError('Payment method is required', 400, 'VALIDATION_ERROR');
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Calculate subtotal, tax, and total from items
    let subtotal = 0;
    for (const item of items) {
      const productResult = await query(
        'SELECT price FROM public.products WHERE id = $1',
        [item.product_id || item.productId]
      );
      
      if (productResult.rows.length === 0) {
        throw createError(`Product ${item.product_id || item.productId} not found`, 404, 'NOT_FOUND');
      }

      const price = productResult.rows[0].price;
      subtotal += price * item.quantity;
    }

    // Calculate tax (18% GST) and shipping
    const taxAmount = Math.round(subtotal * 0.18 * 100) / 100;
    const shippingAmount = subtotal >= 2000 ? 0 : 
      (shippingAddress.state?.toLowerCase().includes('kashmir') ? 50 : 100);
    const calculatedTotal = subtotal + taxAmount + shippingAmount;

    // Create order
    const orderResult = await query(
      `INSERT INTO public.orders 
       (user_id, order_number, subtotal, tax_amount, shipping_amount, total_amount, status, payment_status, 
        payment_method, shipping_address, billing_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        req.userId,
        orderNumber,
        subtotal,
        taxAmount,
        shippingAmount,
        calculatedTotal,
        'pending',
        'pending',
        paymentMethod,
        JSON.stringify(shippingAddress),
        billingAddress ? JSON.stringify(billingAddress) : null
      ]
    );

    const order = orderResult.rows[0];

    // Create order items
    for (const item of items) {
      const productResult = await query(
        'SELECT price FROM public.products WHERE id = $1',
        [item.product_id || item.productId]
      );

      const price = productResult.rows[0].price;
      const totalPrice = price * item.quantity;

      await query(
        `INSERT INTO public.order_items 
         (order_id, product_id, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, item.product_id || item.productId, item.quantity, price, totalPrice]
      );

      // Update product stock
      await query(
        'UPDATE public.products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, item.product_id || item.productId]
      );
    }

    // Clear user's cart
    await query(
      'DELETE FROM public.cart_items WHERE user_id = $1',
      [req.userId]
    );

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  })
);

/**
 * PUT /api/orders/:id/status
 * Update order status (for customer cancellation only)
 */
router.put(
  '/:id/status',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    // Check if order exists and belongs to user
    const existing = await query(
      'SELECT id, status FROM public.orders WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (existing.rows.length === 0) {
      throw createError('Order not found', 404, 'NOT_FOUND');
    }

    // Only allow cancellation by customer
    if (status !== 'cancelled') {
      throw createError('You can only cancel orders', 403, 'FORBIDDEN');
    }

    // Only allow cancellation if order is pending
    if (existing.rows[0].status !== 'pending') {
      throw createError('Only pending orders can be cancelled', 400, 'VALIDATION_ERROR');
    }

    const result = await query(
      `UPDATE public.orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`,
      [status, id, req.userId]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Order cancelled successfully'
    });
  })
);

export default router;

