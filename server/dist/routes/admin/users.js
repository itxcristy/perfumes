"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = require("../../db");
const auth_1 = require("../../middleware/auth");
const errorHandler_1 = require("../../middleware/errorHandler");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = (0, express_1.Router)();
/**
 * GET /api/admin/users
 * Get all users with pagination and filters
 */
router.get('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { page = '1', limit = '10', search = '', role = '', status = '', sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    // Build WHERE clause
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    if (search) {
        conditions.push(`(full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
        params.push(`%${search}%`);
        paramIndex++;
    }
    if (role) {
        conditions.push(`role = $${paramIndex}`);
        params.push(role);
        paramIndex++;
    }
    if (status === 'active') {
        conditions.push(`is_active = true`);
    }
    else if (status === 'inactive') {
        conditions.push(`is_active = false`);
    }
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    // Get total count
    const countResult = await (0, db_1.query)(`SELECT COUNT(*) as total FROM public.profiles ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].total);
    // Get users
    const validSortColumns = ['full_name', 'email', 'role', 'created_at'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'ASC' ? 'ASC' : 'DESC';
    params.push(limit, offset);
    const usersResult = await (0, db_1.query)(`SELECT id, email, full_name, avatar_url, role, phone, is_active, 
              email_verified, created_at, updated_at
       FROM public.profiles
       ${whereClause}
       ORDER BY ${sortColumn} ${order}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`, params);
    res.json({
        success: true,
        data: usersResult.rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
        }
    });
}));
/**
 * GET /api/admin/users/:id
 * Get single user by ID
 */
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const result = await (0, db_1.query)(`SELECT id, email, full_name, avatar_url, role, phone, date_of_birth,
              is_active, email_verified, created_at, updated_at
       FROM public.profiles
       WHERE id = $1`, [id]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('User not found', 404, 'NOT_FOUND');
    }
    // Get user's order count
    const ordersResult = await (0, db_1.query)('SELECT COUNT(*) as order_count FROM public.orders WHERE user_id = $1', [id]);
    // Get user's total spent
    const spentResult = await (0, db_1.query)(`SELECT COALESCE(SUM(total_amount), 0) as total_spent 
       FROM public.orders 
       WHERE user_id = $1 AND payment_status = 'paid'`, [id]);
    res.json({
        success: true,
        data: {
            ...result.rows[0],
            orderCount: parseInt(ordersResult.rows[0].order_count),
            totalSpent: parseFloat(spentResult.rows[0].total_spent)
        }
    });
}));
/**
 * POST /api/admin/users
 * Create new user
 */
router.post('/', auth_1.authenticate, (0, auth_1.authorize)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, full_name, role = 'customer', phone, is_active = true } = req.body;
    // Validation
    if (!email || !password || !full_name) {
        throw (0, errorHandler_1.createError)('Email, password, and full name are required', 400, 'VALIDATION_ERROR');
    }
    // Check if email already exists
    const existingUser = await (0, db_1.query)('SELECT id FROM public.profiles WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        throw (0, errorHandler_1.createError)('Email already exists', 400, 'DUPLICATE_EMAIL');
    }
    // Hash password
    const password_hash = await bcrypt_1.default.hash(password, 12);
    const result = await (0, db_1.query)(`INSERT INTO public.profiles (
        email, password_hash, full_name, role, phone, is_active
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, email, full_name, role, phone, is_active, created_at`, [email, password_hash, full_name, role, phone, is_active]);
    res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: result.rows[0]
    });
}));
/**
 * PUT /api/admin/users/:id
 * Update user
 */
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { email, full_name, role, phone, is_active, email_verified } = req.body;
    // Check if user exists
    const existingUser = await (0, db_1.query)('SELECT id FROM public.profiles WHERE id = $1', [id]);
    if (existingUser.rows.length === 0) {
        throw (0, errorHandler_1.createError)('User not found', 404, 'NOT_FOUND');
    }
    // If email is being updated, check for duplicates
    if (email) {
        const duplicateEmail = await (0, db_1.query)('SELECT id FROM public.profiles WHERE email = $1 AND id != $2', [email, id]);
        if (duplicateEmail.rows.length > 0) {
            throw (0, errorHandler_1.createError)('Email already exists', 400, 'DUPLICATE_EMAIL');
        }
    }
    const result = await (0, db_1.query)(`UPDATE public.profiles SET
        email = COALESCE($1, email),
        full_name = COALESCE($2, full_name),
        role = COALESCE($3, role),
        phone = COALESCE($4, phone),
        is_active = COALESCE($5, is_active),
        email_verified = COALESCE($6, email_verified),
        updated_at = NOW()
      WHERE id = $7
      RETURNING id, email, full_name, role, phone, is_active, email_verified, updated_at`, [email, full_name, role, phone, is_active, email_verified, id]);
    res.json({
        success: true,
        message: 'User updated successfully',
        data: result.rows[0]
    });
}));
/**
 * DELETE /api/admin/users/:id
 * Delete user
 */
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // Prevent admin from deleting themselves
    if (id === req.userId) {
        throw (0, errorHandler_1.createError)('Cannot delete your own account', 400, 'INVALID_OPERATION');
    }
    const result = await (0, db_1.query)('DELETE FROM public.profiles WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('User not found', 404, 'NOT_FOUND');
    }
    res.json({
        success: true,
        message: 'User deleted successfully'
    });
}));
/**
 * PATCH /api/admin/users/:id/toggle-status
 * Toggle user active status
 */
router.patch('/:id/toggle-status', auth_1.authenticate, (0, auth_1.authorize)('admin'), (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    // Prevent admin from deactivating themselves
    if (id === req.userId) {
        throw (0, errorHandler_1.createError)('Cannot deactivate your own account', 400, 'INVALID_OPERATION');
    }
    const result = await (0, db_1.query)(`UPDATE public.profiles 
       SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, full_name, is_active`, [id]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('User not found', 404, 'NOT_FOUND');
    }
    res.json({
        success: true,
        message: `User ${result.rows[0].is_active ? 'activated' : 'deactivated'} successfully`,
        data: result.rows[0]
    });
}));
exports.default = router;
//# sourceMappingURL=users.js.map