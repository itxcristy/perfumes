import { Router, Response } from 'express';
import { query } from '../db';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = Router();

/**
 * GET /api/payment-methods
 * Get all payment methods for the authenticated user
 */
router.get(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await query(
      `SELECT id, user_id, type, last_four, expiry_month, expiry_year, 
              cardholder_name, is_default, is_active, created_at, updated_at
       FROM public.payment_methods
       WHERE user_id = $1 AND is_active = true
       ORDER BY is_default DESC, created_at DESC`,
      [req.userId]
    );

    res.json({
      success: true,
      data: result.rows
    });
  })
);

/**
 * GET /api/payment-methods/:id
 * Get a specific payment method
 */
router.get(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    const result = await query(
      `SELECT id, user_id, type, last_four, expiry_month, expiry_year, 
              cardholder_name, is_default, is_active, created_at, updated_at
       FROM public.payment_methods
       WHERE id = $1 AND user_id = $2 AND is_active = true`,
      [id, req.userId]
    );

    if (result.rows.length === 0) {
      throw createError('Payment method not found', 404, 'NOT_FOUND');
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  })
);

/**
 * POST /api/payment-methods
 * Create a new payment method
 */
router.post(
  '/',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      type,
      lastFour,
      expiryMonth,
      expiryYear,
      cardholderName,
      billingAddress,
      isDefault
    } = req.body;

    // Validation
    if (!type || !lastFour) {
      throw createError('Missing required fields', 400, 'VALIDATION_ERROR');
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await query(
        'UPDATE public.payment_methods SET is_default = false WHERE user_id = $1',
        [req.userId]
      );
    }

    const result = await query(
      `INSERT INTO public.payment_methods 
       (user_id, type, last_four, expiry_month, expiry_year, cardholder_name, 
        billing_address, is_default, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        req.userId,
        type,
        lastFour,
        expiryMonth || null,
        expiryYear || null,
        cardholderName || null,
        billingAddress || null,
        isDefault || false,
        true
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Payment method created successfully'
    });
  })
);

/**
 * PUT /api/payment-methods/:id
 * Update a payment method
 */
router.put(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const {
      type,
      lastFour,
      expiryMonth,
      expiryYear,
      cardholderName,
      billingAddress,
      isDefault,
      isActive
    } = req.body;

    // Check if payment method exists and belongs to user
    const existing = await query(
      'SELECT id FROM public.payment_methods WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (existing.rows.length === 0) {
      throw createError('Payment method not found', 404, 'NOT_FOUND');
    }

    // If this is set as default, unset other defaults
    if (isDefault) {
      await query(
        'UPDATE public.payment_methods SET is_default = false WHERE user_id = $1 AND id != $2',
        [req.userId, id]
      );
    }

    const result = await query(
      `UPDATE public.payment_methods
       SET type = COALESCE($1, type),
           last_four = COALESCE($2, last_four),
           expiry_month = COALESCE($3, expiry_month),
           expiry_year = COALESCE($4, expiry_year),
           cardholder_name = COALESCE($5, cardholder_name),
           billing_address = COALESCE($6, billing_address),
           is_default = COALESCE($7, is_default),
           is_active = COALESCE($8, is_active),
           updated_at = NOW()
       WHERE id = $9 AND user_id = $10
       RETURNING *`,
      [
        type,
        lastFour,
        expiryMonth,
        expiryYear,
        cardholderName,
        billingAddress,
        isDefault,
        isActive,
        id,
        req.userId
      ]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Payment method updated successfully'
    });
  })
);

/**
 * DELETE /api/payment-methods/:id
 * Delete a payment method (soft delete)
 */
router.delete(
  '/:id',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check if payment method exists and belongs to user
    const existing = await query(
      'SELECT id, is_default FROM public.payment_methods WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (existing.rows.length === 0) {
      throw createError('Payment method not found', 404, 'NOT_FOUND');
    }

    // If this was the default payment method, set another one as default if available
    if (existing.rows[0].is_default) {
      await query(
        `UPDATE public.payment_methods 
         SET is_default = true 
         WHERE user_id = $1 AND id != $2 AND is_active = true
         LIMIT 1`,
        [req.userId, id]
      );
    }

    // Soft delete by setting is_active to false
    await query(
      'UPDATE public.payment_methods SET is_active = false, updated_at = NOW() WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    res.json({
      success: true,
      message: 'Payment method deleted successfully'
    });
  })
);

/**
 * PUT /api/payment-methods/:id/set-default
 * Set a payment method as default
 */
router.put(
  '/:id/set-default',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { id } = req.params;

    // Check if payment method exists and belongs to user
    const existing = await query(
      'SELECT id FROM public.payment_methods WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );

    if (existing.rows.length === 0) {
      throw createError('Payment method not found', 404, 'NOT_FOUND');
    }

    // Unset other defaults
    await query(
      'UPDATE public.payment_methods SET is_default = false WHERE user_id = $1',
      [req.userId]
    );

    // Set this as default
    const result = await query(
      'UPDATE public.payment_methods SET is_default = true, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, req.userId]
    );

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Payment method set as default'
    });
  })
);

export default router;