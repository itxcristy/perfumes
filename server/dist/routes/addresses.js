"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const router = (0, express_1.Router)();
/**
 * GET /api/addresses
 * Get all addresses for the authenticated user
 */
router.get('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, db_1.query)(`SELECT id, user_id, address_line1, address_line2, city, state, 
              postal_code, country, is_default, address_type, 
              created_at, updated_at
       FROM public.addresses
       WHERE user_id = $1
       ORDER BY is_default DESC, created_at DESC`, [req.userId]);
    res.json({
        success: true,
        data: result.rows
    });
}));
/**
 * GET /api/addresses/:id
 * Get a specific address
 */
router.get('/:id', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await (0, db_1.query)(`SELECT id, user_id, address_line1, address_line2, city, state, 
              postal_code, country, is_default, address_type, 
              created_at, updated_at
       FROM public.addresses
       WHERE id = $1 AND user_id = $2`, [id, req.userId]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Address not found', 404, 'NOT_FOUND');
    }
    res.json({
        success: true,
        data: result.rows[0]
    });
}));
/**
 * POST /api/addresses
 * Create a new address
 */
router.post('/', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { address_line1, address_line2, city, state, postal_code, country, is_default, address_type } = req.body;
    // Validation
    if (!address_line1 || !city || !state || !postal_code || !country) {
        throw (0, errorHandler_1.createError)('Missing required fields', 400, 'VALIDATION_ERROR');
    }
    // If this is set as default, unset other defaults
    if (is_default) {
        await (0, db_1.query)('UPDATE public.addresses SET is_default = false WHERE user_id = $1', [req.userId]);
    }
    const result = await (0, db_1.query)(`INSERT INTO public.addresses 
       (user_id, address_line1, address_line2, city, state, postal_code, 
        country, is_default, address_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`, [
        req.userId,
        address_line1,
        address_line2 || null,
        city,
        state,
        postal_code,
        country,
        is_default || false,
        address_type || 'shipping'
    ]);
    res.status(201).json({
        success: true,
        data: result.rows[0],
        message: 'Address created successfully'
    });
}));
/**
 * PUT /api/addresses/:id
 * Update an address
 */
router.put('/:id', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { address_line1, address_line2, city, state, postal_code, country, is_default, address_type } = req.body;
    // Check if address exists and belongs to user
    const existing = await (0, db_1.query)('SELECT id FROM public.addresses WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (existing.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Address not found', 404, 'NOT_FOUND');
    }
    // If this is set as default, unset other defaults
    if (is_default) {
        await (0, db_1.query)('UPDATE public.addresses SET is_default = false WHERE user_id = $1 AND id != $2', [req.userId, id]);
    }
    const result = await (0, db_1.query)(`UPDATE public.addresses
       SET address_line1 = COALESCE($1, address_line1),
           address_line2 = COALESCE($2, address_line2),
           city = COALESCE($3, city),
           state = COALESCE($4, state),
           postal_code = COALESCE($5, postal_code),
           country = COALESCE($6, country),
           is_default = COALESCE($7, is_default),
           address_type = COALESCE($8, address_type),
           updated_at = NOW()
       WHERE id = $9 AND user_id = $10
       RETURNING *`, [
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        is_default,
        address_type,
        id,
        req.userId
    ]);
    res.json({
        success: true,
        data: result.rows[0],
        message: 'Address updated successfully'
    });
}));
/**
 * PUT /api/addresses/:id/default
 * Set an address as default
 */
router.put('/:id/default', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // Check if address exists and belongs to user
    const existing = await (0, db_1.query)('SELECT id FROM public.addresses WHERE id = $1 AND user_id = $2', [id, req.userId]);
    if (existing.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Address not found', 404, 'NOT_FOUND');
    }
    // Unset all defaults for this user
    await (0, db_1.query)('UPDATE public.addresses SET is_default = false WHERE user_id = $1', [req.userId]);
    // Set this address as default
    const result = await (0, db_1.query)(`UPDATE public.addresses
       SET is_default = true, updated_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`, [id, req.userId]);
    res.json({
        success: true,
        data: result.rows[0],
        message: 'Default address updated successfully'
    });
}));
/**
 * DELETE /api/addresses/:id
 * Delete an address
 */
router.delete('/:id', auth_1.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await (0, db_1.query)('DELETE FROM public.addresses WHERE id = $1 AND user_id = $2 RETURNING id', [id, req.userId]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Address not found', 404, 'NOT_FOUND');
    }
    res.json({
        success: true,
        message: 'Address deleted successfully'
    });
}));
exports.default = router;
//# sourceMappingURL=addresses.js.map