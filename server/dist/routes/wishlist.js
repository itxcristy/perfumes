"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/wishlist
 * Get user's wishlist items
 */
router.get('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, connection_1.query)(`SELECT 
        wi.id,
        wi.product_id,
        wi.created_at,
        p.id as product_id,
        p.name,
        p.slug,
        p.description,
        p.short_description,
        p.price,
        p.original_price,
        p.images,
        p.stock,
        p.rating,
        p.review_count,
        p.is_featured,
        p.category_id,
        c.name as category_name
      FROM public.wishlist_items wi
      JOIN public.products p ON wi.product_id = p.id
      LEFT JOIN public.categories c ON p.category_id = c.id
      WHERE wi.user_id = $1
      ORDER BY wi.created_at DESC`, [req.userId]);
    res.json({
        success: true,
        data: result.rows
    });
}));
/**
 * POST /api/wishlist
 * Add item to wishlist
 */
router.post('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.body;
    // Validation
    if (!productId) {
        throw (0, errorHandler_1.createError)('Product ID is required', 400, 'VALIDATION_ERROR');
    }
    // Check if product exists
    const productResult = await (0, connection_1.query)('SELECT id FROM public.products WHERE id = $1', [productId]);
    if (productResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Product not found', 404, 'NOT_FOUND');
    }
    // Check if already in wishlist
    const existingResult = await (0, connection_1.query)('SELECT id FROM public.wishlist_items WHERE user_id = $1 AND product_id = $2', [req.userId, productId]);
    if (existingResult.rows.length > 0) {
        throw (0, errorHandler_1.createError)('Product already in wishlist', 409, 'ALREADY_EXISTS');
    }
    // Add to wishlist
    await (0, connection_1.query)('INSERT INTO public.wishlist_items (user_id, product_id) VALUES ($1, $2)', [req.userId, productId]);
    res.json({
        success: true,
        message: 'Product added to wishlist'
    });
}));
/**
 * DELETE /api/wishlist/:productId
 * Remove item from wishlist
 */
router.delete('/:productId', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { productId } = req.params;
    // Check if item exists and belongs to user
    const itemResult = await (0, connection_1.query)('SELECT id FROM public.wishlist_items WHERE user_id = $1 AND product_id = $2', [req.userId, productId]);
    if (itemResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Wishlist item not found', 404, 'NOT_FOUND');
    }
    await (0, connection_1.query)('DELETE FROM public.wishlist_items WHERE user_id = $1 AND product_id = $2', [req.userId, productId]);
    res.json({
        success: true,
        message: 'Item removed from wishlist'
    });
}));
/**
 * DELETE /api/wishlist
 * Clear entire wishlist
 */
router.delete('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    await (0, connection_1.query)('DELETE FROM public.wishlist_items WHERE user_id = $1', [req.userId]);
    res.json({
        success: true,
        message: 'Wishlist cleared'
    });
}));
exports.default = router;
//# sourceMappingURL=wishlist.js.map