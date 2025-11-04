import { Router, Response } from 'express';
import { query } from '../db/connection';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticate, AuthRequest } from '../middleware/auth';
import { authLimiter, registerLimiter, passwordResetLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post(
  '/register',
  registerLimiter, // Apply rate limiting
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password, fullName, role = 'customer' } = req.body;

    // Validation
    if (!email || !password || !fullName) {
      throw createError('Email, password, and full name are required', 400, 'VALIDATION_ERROR');
    }

    if (password.length < 8) {
      throw createError('Password must be at least 8 characters', 400, 'VALIDATION_ERROR');
    }

    // Public registrations are always customer role
    // Admin and seller accounts must be created by administrators only
    const userRole = 'customer';

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM public.profiles WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw createError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await query(
      `INSERT INTO public.profiles (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`,
      [email, passwordHash, fullName, userRole]
    );

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

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
  })
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post(
  '/login',
  authLimiter, // Apply rate limiting
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw createError('Email and password are required', 400, 'VALIDATION_ERROR');
    }

    // Find user
    const result = await query(
      'SELECT id, email, password_hash, full_name, role FROM public.profiles WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await comparePassword(password, user.password_hash);
    if (!isValid) {
      throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Generate token
    const token = generateToken(user.id, user.role);

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
  })
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await query(
      `SELECT id, email, full_name, avatar_url, role, phone, date_of_birth, gender,
              is_active, email_verified, business_name, business_address, business_phone, tax_id,
              preferred_language, newsletter_subscribed, created_at, updated_at
       FROM public.profiles WHERE id = $1`,
      [req.userId]
    );

    if (result.rows.length === 0) {
      throw createError('User not found', 404, 'NOT_FOUND');
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
        gender: user.gender,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        businessName: user.business_name,
        businessAddress: user.business_address,
        businessPhone: user.business_phone,
        taxId: user.tax_id,
        preferredLanguage: user.preferred_language,
        newsletterSubscribed: user.newsletter_subscribed,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  })
);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      fullName,
      phone,
      dateOfBirth,
      avatarUrl,
      gender,
      // Seller fields
      businessName,
      businessAddress,
      businessPhone,
      taxId,
      // Customer fields
      preferredLanguage,
      newsletterSubscribed
    } = req.body;

    const result = await query(
      `UPDATE public.profiles
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           date_of_birth = COALESCE($3, date_of_birth),
           avatar_url = COALESCE($4, avatar_url),
           gender = COALESCE($5, gender),
           business_name = COALESCE($7, business_name),
           business_address = COALESCE($8, business_address),
           business_phone = COALESCE($9, business_phone),
           tax_id = COALESCE($10, tax_id),
           preferred_language = COALESCE($11, preferred_language),
           newsletter_subscribed = COALESCE($12, newsletter_subscribed),
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, email, full_name, avatar_url, role, phone, date_of_birth, gender, business_name, business_address, business_phone, tax_id, preferred_language, newsletter_subscribed, updated_at`,
      [fullName, phone, dateOfBirth, avatarUrl, gender, req.userId, businessName, businessAddress, businessPhone, taxId, preferredLanguage, newsletterSubscribed]
    );

    if (result.rows.length === 0) {
      throw createError('User not found', 404, 'NOT_FOUND');
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
        gender: user.gender,
        businessName: user.business_name,
        businessAddress: user.business_address,
        businessPhone: user.business_phone,
        taxId: user.tax_id,
        preferredLanguage: user.preferred_language,
        newsletterSubscribed: user.newsletter_subscribed,
        updatedAt: user.updated_at,
      },
    });
  })
);

export default router;