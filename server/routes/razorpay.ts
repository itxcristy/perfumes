/**
 * Razorpay Payment Routes
 *
 * Handles Razorpay payment integration with security best practices
 * Reference: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/integration-steps/
 */

import express, { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { query } from '../db/connection';

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

// Helper function to validate Razorpay webhook signature
function validateWebhookSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * POST /api/razorpay/create-order
 * Create a Razorpay order
 *
 * Request body:
 * {
 *   amount: number (in rupees),
 *   currency: string (default: 'INR'),
 *   receipt: string (optional),
 *   notes: object (optional)
 * }
 */
router.post(
  '/create-order',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { amount, currency = 'INR', receipt, notes } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      throw createError('Invalid amount. Amount must be greater than 0', 400, 'VALIDATION_ERROR');
    }

    // Validate amount is not too large (max 10 lakhs)
    if (amount > 1000000) {
      throw createError('Amount exceeds maximum limit', 400, 'VALIDATION_ERROR');
    }

    // Check if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials not configured');
      throw createError('Payment service is not configured. Please contact support.', 500, 'CONFIGURATION_ERROR');
    }

    try {
      // Create Razorpay order with proper options
      const options: any = {
        amount: Math.round(amount * 100), // Amount in paise (smallest currency unit)
        currency,
        receipt: receipt || `receipt_${req.userId}_${Date.now()}`,
        notes: {
          user_id: req.userId,
          ...notes
        }
      };

      console.log('Creating Razorpay order:', {
        userId: req.userId,
        amount: amount,
        currency: currency
      });

      const order = await razorpay.orders.create(options);

      console.log('Razorpay order created successfully:', {
        orderId: order.id,
        amount: order.amount
      });

      res.json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt
        }
      });
    } catch (error: any) {
      console.error('Razorpay order creation error:', {
        userId: req.userId,
        amount: amount,
        error: error.message,
        errorCode: error.code
      });

      throw createError(
        error.message || 'Failed to create Razorpay order',
        500,
        'RAZORPAY_ERROR'
      );
    }
  })
);

/**
 * POST /api/razorpay/verify-payment
 * Verify Razorpay payment signature and update order status
 *
 * Request body:
 * {
 *   razorpay_order_id: string,
 *   razorpay_payment_id: string,
 *   razorpay_signature: string
 * }
 */
router.post(
  '/verify-payment',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    // Validation
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw createError('Missing payment verification parameters', 400, 'VALIDATION_ERROR');
    }

    // Check if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay secret key not configured');
      throw createError('Payment service is not configured', 500, 'CONFIGURATION_ERROR');
    }

    try {
      console.log('Verifying payment:', {
        userId: req.userId,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });

      // Step 1: Verify signature (CRITICAL SECURITY CHECK)
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      // Use constant-time comparison to prevent timing attacks
      const isValid = crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(razorpay_signature)
      );

      if (!isValid) {
        console.error('Invalid payment signature detected:', {
          userId: req.userId,
          orderId: razorpay_order_id,
          paymentId: razorpay_payment_id
        });
        throw createError('Invalid payment signature. Payment verification failed.', 400, 'INVALID_SIGNATURE');
      }

      // Step 2: Fetch payment details from Razorpay API
      const payment = await razorpay.payments.fetch(razorpay_payment_id);

      console.log('Payment fetched from Razorpay:', {
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount
      });

      // Step 3: Verify payment status is captured
      if (payment.status !== 'captured') {
        console.warn('Payment not captured:', {
          paymentId: razorpay_payment_id,
          status: payment.status
        });
        throw createError('Payment not captured. Please try again.', 400, 'PAYMENT_NOT_CAPTURED');
      }

      // Step 4: Update order payment status in database
      try {
        await query(
          `UPDATE public.orders
           SET payment_status = $1,
               razorpay_payment_id = $2,
               razorpay_order_id = $3,
               updated_at = NOW()
           WHERE user_id = $4 AND status = 'pending'
           LIMIT 1`,
          ['completed', razorpay_payment_id, razorpay_order_id, req.userId]
        );

        console.log('Order payment status updated:', {
          userId: req.userId,
          paymentId: razorpay_payment_id
        });
      } catch (dbError) {
        console.error('Failed to update order payment status:', dbError);
        // Don't throw error here - payment is verified, just log the issue
      }

      res.json({
        success: true,
        data: {
          verified: true,
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          status: payment.status,
          method: payment.method,
          amount: payment.amount / 100, // Convert from paise to rupees
          email: payment.email,
          contact: payment.contact,
          createdAt: payment.created_at
        }
      });
    } catch (error: any) {
      console.error('Razorpay payment verification error:', {
        userId: req.userId,
        error: error.message,
        errorCode: error.code
      });

      if (error.code === 'INVALID_SIGNATURE' || error.code === 'PAYMENT_NOT_CAPTURED') {
        throw error;
      }

      throw createError(
        error.message || 'Failed to verify payment',
        500,
        'RAZORPAY_ERROR'
      );
    }
  })
);

/**
 * GET /api/razorpay/payment/:paymentId
 * Get payment details
 */
router.get(
  '/payment/:paymentId',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paymentId } = req.params;

    if (!paymentId) {
      throw createError('Payment ID is required', 400, 'VALIDATION_ERROR');
    }

    try {
      const payment = await razorpay.payments.fetch(paymentId);

      res.json({
        success: true,
        data: {
          id: payment.id,
          orderId: payment.order_id,
          status: payment.status,
          method: payment.method,
          amount: payment.amount / 100,
          currency: payment.currency,
          email: payment.email,
          contact: payment.contact,
          createdAt: payment.created_at
        }
      });
    } catch (error: any) {
      console.error('Razorpay payment fetch error:', error);
      throw createError(
        error.message || 'Failed to fetch payment details',
        500,
        'RAZORPAY_ERROR'
      );
    }
  })
);

/**
 * POST /api/razorpay/refund
 * Create a refund
 */
router.post(
  '/refund',
  authenticate,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paymentId, amount, notes } = req.body;

    if (!paymentId) {
      throw createError('Payment ID is required', 400, 'VALIDATION_ERROR');
    }

    try {
      const refundOptions: any = {
        payment_id: paymentId
      };

      if (amount) {
        refundOptions.amount = Math.round(amount * 100); // Amount in paise
      }

      if (notes) {
        refundOptions.notes = notes;
      }

      const refund = await razorpay.payments.refund(paymentId, refundOptions);

      res.json({
        success: true,
        data: {
          id: refund.id,
          paymentId: refund.payment_id,
          amount: refund.amount / 100,
          status: refund.status,
          createdAt: refund.created_at
        }
      });
    } catch (error: any) {
      console.error('Razorpay refund error:', error);
      throw createError(
        error.message || 'Failed to create refund',
        500,
        'RAZORPAY_ERROR'
      );
    }
  })
);

/**
 * POST /api/razorpay/webhook
 * Handle Razorpay webhook events
 *
 * Events handled:
 * - payment.authorized: Payment authorized
 * - payment.failed: Payment failed
 * - refund.created: Refund created
 */
router.post(
  '/webhook',
  asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = JSON.stringify(req.body);

    // Validate webhook signature
    if (!validateWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature detected');
      throw createError('Invalid webhook signature', 401, 'INVALID_SIGNATURE');
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log('Razorpay webhook received:', {
      event: event,
      paymentId: payload?.payment?.entity?.id
    });

    try {
      switch (event) {
        case 'payment.authorized':
          // Handle payment authorized
          console.log('Payment authorized:', payload.payment.entity.id);
          break;

        case 'payment.failed':
          // Handle payment failed
          console.log('Payment failed:', {
            paymentId: payload.payment.entity.id,
            reason: payload.payment.entity.error_reason
          });

          // Update order status to failed
          try {
            await query(
              `UPDATE public.orders
               SET payment_status = $1, updated_at = NOW()
               WHERE razorpay_payment_id = $2`,
              ['failed', payload.payment.entity.id]
            );
          } catch (dbError) {
            console.error('Failed to update order status for failed payment:', dbError);
          }
          break;

        case 'refund.created':
          // Handle refund created
          console.log('Refund created:', {
            refundId: payload.refund.entity.id,
            paymentId: payload.refund.entity.payment_id
          });

          // Update order status to refunded
          try {
            await query(
              `UPDATE public.orders
               SET payment_status = $1, updated_at = NOW()
               WHERE razorpay_payment_id = $2`,
              ['refunded', payload.refund.entity.payment_id]
            );
          } catch (dbError) {
            console.error('Failed to update order status for refund:', dbError);
          }
          break;

        default:
          console.log('Unhandled webhook event:', event);
      }

      // Always return 200 OK to acknowledge receipt
      res.json({ success: true, message: 'Webhook processed' });
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      // Still return 200 to prevent Razorpay from retrying
      res.json({ success: false, message: 'Webhook processing failed' });
    }
  })
);

export default router;

