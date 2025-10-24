"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/cart
 * Get user's cart items
 */
router.get('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, connection_1.query)(`SELECT ci.id, ci.product_id, ci.variant_id, ci.quantity, 
              p.name, p.price, p.images, p.stock,
              pv.name as variant_name, pv.price as variant_price
       FROM public.cart_items ci
       JOIN public.products p ON ci.product_id = p.id
       LEFT JOIN public.product_variants pv ON ci.variant_id = pv.id
       WHERE ci.user_id = $1
       ORDER BY ci.created_at DESC`, [req.userId]);
    // Calculate totals
    let subtotal = 0;
    result.rows.forEach(item => {
        const price = item.variant_price || item.price;
        subtotal += price * item.quantity;
    });
    res.json({
        items: result.rows,
        subtotal,
        itemCount: result.rows.length,
    });
}));
/**
 * POST /api/cart
 * Add item to cart
 */
router.post('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { productId, variantId, quantity } = req.body;
    // Validation
    if (!productId || !quantity || quantity < 1) {
        throw (0, errorHandler_1.createError)('Product ID and quantity are required', 400, 'VALIDATION_ERROR');
    }
    // Check if product exists
    const productResult = await (0, connection_1.query)('SELECT id, price, stock FROM public.products WHERE id = $1', [productId]);
    if (productResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Product not found', 404, 'NOT_FOUND');
    }
    const product = productResult.rows[0];
    // Check stock
    if (product.stock < quantity) {
        throw (0, errorHandler_1.createError)('Insufficient stock', 409, 'INSUFFICIENT_STOCK');
    }
    // Check if item already in cart
    const existingResult = await (0, connection_1.query)(`SELECT id, quantity FROM public.cart_items 
       WHERE user_id = $1 AND product_id = $2 AND variant_id IS NOT DISTINCT FROM $3`, [req.userId, productId, variantId]);
    if (existingResult.rows.length > 0) {
        // Update quantity
        const newQuantity = existingResult.rows[0].quantity + quantity;
        if (product.stock < newQuantity) {
            throw (0, errorHandler_1.createError)('Insufficient stock', 409, 'INSUFFICIENT_STOCK');
        }
        const updateResult = await (0, connection_1.query)(`UPDATE public.cart_items 
         SET quantity = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING *`, [newQuantity, existingResult.rows[0].id]);
        return res.json({
            message: 'Cart item updated',
            item: updateResult.rows[0],
        });
    }
    // Add new item
    const result = await (0, connection_1.query)(`INSERT INTO public.cart_items (user_id, product_id, variant_id, quantity)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [req.userId, productId, variantId, quantity]);
    res.status(201).json({
        message: 'Item added to cart',
        item: result.rows[0],
    });
}));
/**
 * PUT /api/cart/:itemId
 * Update cart item quantity
 */
router.put('/:itemId', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    // Validation
    if (!quantity || quantity < 1) {
        throw (0, errorHandler_1.createError)('Quantity must be at least 1', 400, 'VALIDATION_ERROR');
    }
    // Check if item exists and belongs to user
    const itemResult = await (0, connection_1.query)(`SELECT ci.id, ci.product_id, p.stock
       FROM public.cart_items ci
       JOIN public.products p ON ci.product_id = p.id
       WHERE ci.id = $1 AND ci.user_id = $2`, [itemId, req.userId]);
    if (itemResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Cart item not found', 404, 'NOT_FOUND');
    }
    const item = itemResult.rows[0];
    // Check stock
    if (item.stock < quantity) {
        throw (0, errorHandler_1.createError)('Insufficient stock', 409, 'INSUFFICIENT_STOCK');
    }
    const result = await (0, connection_1.query)(`UPDATE public.cart_items 
       SET quantity = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`, [quantity, itemId]);
    res.json({
        message: 'Cart item updated',
        item: result.rows[0],
    });
}));
/**
 * DELETE /api/cart/:itemId
 * Remove item from cart
 */
router.delete('/:itemId', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { itemId } = req.params;
    // Check if item exists and belongs to user
    const itemResult = await (0, connection_1.query)('SELECT id FROM public.cart_items WHERE id = $1 AND user_id = $2', [itemId, req.userId]);
    if (itemResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Cart item not found', 404, 'NOT_FOUND');
    }
    await (0, connection_1.query)('DELETE FROM public.cart_items WHERE id = $1', [itemId]);
    res.json({ message: 'Item removed from cart' });
}));
/**
 * DELETE /api/cart
 * Clear entire cart
 */
router.delete('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    await (0, connection_1.query)('DELETE FROM public.cart_items WHERE user_id = $1', [req.userId]);
    res.json({ message: 'Cart cleared' });
}));
exports.default = router;
//# sourceMappingURL=cart.js.map