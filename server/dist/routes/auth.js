"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const connection_1 = require("../db/connection");
const auth_1 = require("../utils/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const auth_2 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password, fullName } = req.body;
    // Validation
    if (!email || !password || !fullName) {
        throw (0, errorHandler_1.createError)('Email, password, and full name are required', 400, 'VALIDATION_ERROR');
    }
    if (password.length < 8) {
        throw (0, errorHandler_1.createError)('Password must be at least 8 characters', 400, 'VALIDATION_ERROR');
    }
    // Check if user exists
    const existingUser = await (0, connection_1.query)('SELECT id FROM public.profiles WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
        throw (0, errorHandler_1.createError)('Email already registered', 409, 'EMAIL_EXISTS');
    }
    // Hash password
    const passwordHash = await (0, auth_1.hashPassword)(password);
    // Create user
    const result = await (0, connection_1.query)(`INSERT INTO public.profiles (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`, [email, passwordHash, fullName, 'customer']);
    const user = result.rows[0];
    const token = (0, auth_1.generateToken)(user.id, user.role);
    res.status(201).json({
        message: 'User registered successfully',
        user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
        },
        token,
    });
}));
/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    // Validation
    if (!email || !password) {
        throw (0, errorHandler_1.createError)('Email and password are required', 400, 'VALIDATION_ERROR');
    }
    // Find user
    const result = await (0, connection_1.query)('SELECT id, email, password_hash, full_name, role FROM public.profiles WHERE email = $1', [email]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }
    const user = result.rows[0];
    // Verify password
    const isValid = await (0, auth_1.comparePassword)(password, user.password_hash);
    if (!isValid) {
        throw (0, errorHandler_1.createError)('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }
    // Generate token
    const token = (0, auth_1.generateToken)(user.id, user.role);
    res.json({
        message: 'Login successful',
        user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
        },
        token,
    });
}));
/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', auth_2.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const result = await (0, connection_1.query)(`SELECT id, email, full_name, avatar_url, role, phone, date_of_birth, 
              is_active, email_verified, created_at, updated_at
       FROM public.profiles WHERE id = $1`, [req.userId]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('User not found', 404, 'NOT_FOUND');
    }
    const user = result.rows[0];
    res.json({
        user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            avatar: user.avatar_url,
            role: user.role,
            phone: user.phone,
            dateOfBirth: user.date_of_birth,
            isActive: user.is_active,
            emailVerified: user.email_verified,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
        },
    });
}));
/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile', auth_2.authenticate, (0, errorHandler_1.asyncHandler)(async (req, res) => {
    const { fullName, phone, dateOfBirth, avatarUrl } = req.body;
    const result = await (0, connection_1.query)(`UPDATE public.profiles 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           date_of_birth = COALESCE($3, date_of_birth),
           avatar_url = COALESCE($4, avatar_url),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, full_name, avatar_url, role, phone, date_of_birth, updated_at`, [fullName, phone, dateOfBirth, avatarUrl, req.userId]);
    if (result.rows.length === 0) {
        throw (0, errorHandler_1.createError)('User not found', 404, 'NOT_FOUND');
    }
    const user = result.rows[0];
    res.json({
        message: 'Profile updated successfully',
        user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            avatar: user.avatar_url,
            role: user.role,
            phone: user.phone,
            dateOfBirth: user.date_of_birth,
            updatedAt: user.updated_at,
        },
    });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map