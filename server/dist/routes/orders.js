"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * GET /api/orders
 * Get all orders for the authenticated user
 */
router.get('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, db_1.query)(`SELECT o.id, o.order_number, o.user_id, o.total_amount, o.status, 
              o.payment_status, o.payment_method, o.shipping_address, 
              o.billing_address, o.tracking_number, o.notes,
              o.created_at, o.updated_at,
              COUNT(oi.id) as item_count
       FROM public.orders o
       LEFT JOIN public.order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`, [req.userId]);
    res.json({
        success: true,
        data: result.rows
    });
}));
/**
 * GET /api/orders/:id
 * Get a specific order with items
 */
router.get('/:id', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // Get order details
    const orderResult = await (0, db_1.query)(`SELECT o.id, o.order_number, o.user_id, o.total_amount, o.status, 
              o.payment_status, o.payment_method, o.shipping_address, 
              o.billing_address, o.tracking_number, o.notes,
              o.created_at, o.updated_at
       FROM public.orders o
       WHERE o.id = $1 AND o.user_id = $2`, [id, req.userId]);
    if (orderResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Order not found', 404, 'NOT_FOUND');
    }
    // Get order items
    const itemsResult = await (0, db_1.query)(`SELECT oi.id, oi.product_id, oi.quantity, oi.price, oi.subtotal,
              p.name as product_name, p.images as product_images
       FROM public.order_items oi
       LEFT JOIN public.products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`, [id]);
    const order = orderResult.rows[0];
    order.items = itemsResult.rows;
    res.json({
        success: true,
        data: order
    });
}));
/**
 * POST /api/orders
 * Create a new order
 */
router.post('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { items, shippingAddress, billingAddress, paymentMethod, total } = req.body;
    // Validation
    if (!items || items.length === 0) {
        throw (0, errorHandler_1.createError)('Order must contain at least one item', 400, 'VALIDATION_ERROR');
    }
    if (!shippingAddress) {
        throw (0, errorHandler_1.createError)('Shipping address is required', 400, 'VALIDATION_ERROR');
    }
    if (!paymentMethod) {
        throw (0, errorHandler_1.createError)('Payment method is required', 400, 'VALIDATION_ERROR');
    }
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    // Calculate total from items
    let calculatedTotal = 0;
    for (const item of items) {
        const productResult = await (0, db_1.query)('SELECT price FROM public.products WHERE id = $1', [item.product_id || item.productId]);
        if (productResult.rows.length === 0) {
            throw (0, errorHandler_1.createError)(`Product ${item.product_id || item.productId} not found`, 404, 'NOT_FOUND');
        }
        const price = productResult.rows[0].price;
        calculatedTotal += price * item.quantity;
    }
    // Create order
    const orderResult = await (0, db_1.query)(`INSERT INTO public.orders 
       (user_id, order_number, total_amount, status, payment_status, 
        payment_method, shipping_address, billing_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`, [
        req.userId,
        orderNumber,
        calculatedTotal,
        'pending',
        'pending',
        paymentMethod,
        JSON.stringify(shippingAddress),
        billingAddress ? JSON.stringify(billingAddress) : null
    ]);
    const order = orderResult.rows[0];
    // Create order items
    for (const item of items) {
        const productResult = await (0, db_1.query)('SELECT price FROM public.products WHERE id = $1', [item.product_id || item.productId]);
        const price = productResult.rows[0].price;
        const subtotal = price * item.quantity;
        await (0, db_1.query)(`INSERT INTO public.order_items 
         (order_id, product_id, quantity, price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`, [order.id, item.product_id || item.productId, item.quantity, price, subtotal]);
        // Update product stock
        await (0, db_1.query)('UPDATE public.products SET stock = stock - $1 WHERE id = $2', [item.quantity, item.product_id || item.productId]);
    }
    // Clear user's cart
    await (0, db_1.query)('DELETE FROM public.cart_items WHERE user_id = $1', [req.userId]);
    res.status(201).json({
        success: true,
        data: order,
        message: 'Order created successfully'
    });
}));
/**
 * PUT /api/orders/:id/status
 * Update order status (for customer cancellation only)
 */
router.put('/:id/status', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    // Check if order exists and belongs to user
    const existing = await (0, db_1.query)('SELECT id, status FROM public.orders WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (existing.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Order not found', 404, 'NOT_FOUND');
    }
    // Only allow cancellation by customer
    if (status !== 'cancelled') {
        throw (0, errorHandler_1.createError)('You can only cancel orders', 403, 'FORBIDDEN');
    }
    // Only allow cancellation if order is pending
    if (existing.rows[0].status !== 'pending') {
        throw (0, errorHandler_1.createError)('Only pending orders can be cancelled', 400, 'VALIDATION_ERROR');
    }
    const result = await (0, db_1.query)(`UPDATE public.orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3
       RETURNING *`, [status, id, req.userId]);
    res.json({
        success: true,
        data: result.rows[0],
        message: 'Order cancelled successfully'
    });
}));
exports.default = router;
//# sourceMappingURL=orders.js.map