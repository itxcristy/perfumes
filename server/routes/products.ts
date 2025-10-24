import { Router, Response } from 'express';
import { query } from '../db/connection';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticate, authorize, AuthRequest, optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * GET /api/products
 * Get products with pagination and filtering
 */
router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, parseInt(req.query.limit as string) || 20);
    const offset = (page - 1) * limit;
    const categoryId = req.query.categoryId as string;
    const search = req.query.search as string;
    const featured = req.query.featured === 'true';
    const bestSellers = req.query.bestSellers === 'true';
    const latest = req.query.latest === 'true';

    let whereClause = 'WHERE is_active = true';
    const params: any[] = [];
    let orderByClause = 'ORDER BY created_at DESC';

    if (categoryId) {
      whereClause += ` AND category_id = $${params.length + 1}`;
      params.push(categoryId);
    }

    if (search) {
      whereClause += ` AND (name ILIKE $${params.length + 1} OR description ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (featured) {
      whereClause += ` AND is_featured = true`;
    }

    // Best sellers: Sort by rating and review count (temporary until we have order data)
    if (bestSellers) {
      orderByClause = 'ORDER BY (rating * review_count) DESC, rating DESC, review_count DESC';
    }

    // Latest arrivals: Sort by creation date
    if (latest) {
      orderByClause = 'ORDER BY created_at DESC';
    }

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM public.products ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get products
    const result = await query(
      `SELECT id, name, slug, description, short_description, price, original_price,
              category_id, images, stock, rating, review_count, is_featured, tags, created_at
       FROM public.products
       ${whereClause}
       ${orderByClause}
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  })
);

/**
 * GET /api/products/:id
 * Get product details
 */
router.get(
  '/:id',
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM public.products WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      throw createError('Product not found', 404, 'NOT_FOUND');
    }

    const product = result.rows[0];

    // Get variants
    const variantsResult = await query(
      `SELECT id, name, sku, price, stock, attributes FROM public.product_variants 
       WHERE product_id = $1`,
      [id]
    );

    // Get reviews
    const reviewsResult = await query(
      `SELECT r.id, r.rating, r.title, r.comment, r.created_at, p.full_name, p.avatar_url
       FROM public.reviews r
       JOIN public.profiles p ON r.user_id = p.id
       WHERE r.product_id = $1 AND r.is_approved = true
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      product: {
        ...product,
        variants: variantsResult.rows,
        reviews: reviewsResult.rows,
      },
    });
  })
);

/**
 * POST /api/products
 * Create product (admin only)
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'seller'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      originalPrice,
      categoryId,
      images,
      stock,
      sku,
      tags,
      specifications,
    } = req.body;

    // Validation
    if (!name || !price) {
      throw createError('Name and price are required', 400, 'VALIDATION_ERROR');
    }

    const result = await query(
      `INSERT INTO public.products 
       (name, slug, description, short_description, price, original_price, 
        category_id, seller_id, images, stock, sku, tags, specifications, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
       RETURNING *`,
      [
        name,
        slug || name.toLowerCase().replace(/\s+/g, '-'),
        description,
        shortDescription,
        price,
        originalPrice,
        categoryId,
        req.userId,
        images || [],
        stock || 0,
        sku,
        tags || [],
        specifications || {},
      ]
    );

    res.status(201).json({
      message: 'Product created successfully',
      product: result.rows[0],
    });
  })
);

/**
 * PUT /api/products/:id
 * Update product (admin/seller only)
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'seller'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, description, price, stock, images, tags } = req.body;

    // Check ownership
    const productResult = await query(
      'SELECT seller_id FROM public.products WHERE id = $1',
      [id]
    );

    if (productResult.rows.length === 0) {
      throw createError('Product not found', 404, 'NOT_FOUND');
    }

    if (req.role !== 'admin' && productResult.rows[0].seller_id !== req.userId) {
      throw createError('Unauthorized', 403, 'FORBIDDEN');
    }

    const result = await query(
      `UPDATE public.products 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           stock = COALESCE($4, stock),
           images = COALESCE($5, images),
           tags = COALESCE($6, tags),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [name, description, price, stock, images, tags, id]
    );

    res.json({
      message: 'Product updated successfully',
      product: result.rows[0],
    });
  })
);

/**
 * DELETE /api/products/:id
 * Delete product (admin/seller only)
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'seller'),
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check ownership
    const productResult = await query(
      'SELECT seller_id FROM public.products WHERE id = $1',
      [id]
    );

    if (productResult.rows.length === 0) {
      throw createError('Product not found', 404, 'NOT_FOUND');
    }

    if (req.role !== 'admin' && productResult.rows[0].seller_id !== req.userId) {
      throw createError('Unauthorized', 403, 'FORBIDDEN');
    }

    await query('DELETE FROM public.products WHERE id = $1', [id]);

    res.json({ message: 'Product deleted successfully' });
  })
);

export default router;

