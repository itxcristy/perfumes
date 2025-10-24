"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * GET /api/categories
 * Get all categories
 */
router.get('/', auth_1.optionalAuth, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, connection_1.query)(`SELECT
        c.id,
        c.name,
        c.slug,
        c.description,
        c.image_url,
        c.parent_id,
        c.sort_order,
        c.is_active,
        c.created_at,
        COUNT(p.id) as product_count
       FROM public.categories c
       LEFT JOIN public.products p ON c.id = p.category_id AND p.is_active = true
       WHERE c.is_active = true
       GROUP BY c.id, c.name, c.slug, c.description, c.image_url, c.parent_id, c.sort_order, c.is_active, c.created_at
       ORDER BY c.sort_order ASC, c.name ASC`);
    res.json({
        success: true,
        data: result.rows,
    });
}));
/**
 * GET /api/categories/:id
 * Get category details with products
 */
router.get('/:id', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // Get category
    const categoryResult = await (0, connection_1.query)(`SELECT * FROM public.categories WHERE id = $1`, [id]);
    if (categoryResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Category not found', 404, 'NOT_FOUND');
    }
    const category = categoryResult.rows[0];
    // Get products in category
    const productsResult = await (0, connection_1.query)(`SELECT id, name, slug, price, original_price, images, rating, review_count
       FROM public.products
       WHERE category_id = $1 AND is_active = true
       ORDER BY created_at DESC
       LIMIT 50`, [id]);
    res.json({
        success: true,
        category,
        products: productsResult.rows,
    });
}));
/**
 * POST /api/categories
 * Create category (admin only)
 */
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { name, slug, description, imageUrl, parentId, sortOrder } = req.body;
    // Validation
    if (!name || !slug) {
        throw (0, errorHandler_1.createError)('Name and slug are required', 400, 'VALIDATION_ERROR');
    }
    // Check if slug exists
    const existingResult = await (0, connection_1.query)('SELECT id FROM public.categories WHERE slug = $1', [slug]);
    if (existingResult.rows.length > 0) {
        throw (0, errorHandler_1.createError)('Category slug already exists', 409, 'SLUG_EXISTS');
    }
    const result = await (0, connection_1.query)(`INSERT INTO public.categories (name, slug, description, image_url, parent_id, sort_order, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`, [name, slug, description, imageUrl, parentId, sortOrder || 0]);
    res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category: result.rows[0],
    });
}));
/**
 * PUT /api/categories/:id
 * Update category (admin only)
 */
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { name, slug, description, imageUrl, sortOrder } = req.body;
    // Check if category exists
    const categoryResult = await (0, connection_1.query)('SELECT id FROM public.categories WHERE id = $1', [id]);
    if (categoryResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Category not found', 404, 'NOT_FOUND');
    }
    // Check if new slug is unique
    if (slug) {
        const slugResult = await (0, connection_1.query)('SELECT id FROM public.categories WHERE slug = $1 AND id != $2', [slug, id]);
        if (slugResult.rows.length > 0) {
            throw (0, errorHandler_1.createError)('Category slug already exists', 409, 'SLUG_EXISTS');
        }
    }
    const result = await (0, connection_1.query)(`UPDATE public.categories 
       SET name = COALESCE($1, name),
           slug = COALESCE($2, slug),
           description = COALESCE($3, description),
           image_url = COALESCE($4, image_url),
           sort_order = COALESCE($5, sort_order),
           updated_at = NOW()
       WHERE id = $6
       RETURNING *`, [name, slug, description, imageUrl, sortOrder, id]);
    res.json({
        success: true,
        message: 'Category updated successfully',
        category: result.rows[0],
    });
}));
/**
 * DELETE /api/categories/:id
 * Delete category (admin only)
 */
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // Check if category exists
    const categoryResult = await (0, connection_1.query)('SELECT id FROM public.categories WHERE id = $1', [id]);
    if (categoryResult.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Category not found', 404, 'NOT_FOUND');
    }
    // Check if category has products
    const productsResult = await (0, connection_1.query)('SELECT COUNT(*) as count FROM public.products WHERE category_id = $1', [id]);
    if (parseInt(productsResult.rows[0].count) > 0) {
        throw (0, errorHandler_1.createError)('Cannot delete category with products', 409, 'CATEGORY_HAS_PRODUCTS');
    }
    await (0, connection_1.query)('DELETE FROM public.categories WHERE id = $1', [id]);
    res.json({ success: true, message: 'Category deleted successfully' });
}));
exports.default = router;
//# sourceMappingURL=categories.js.map