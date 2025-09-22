/**
 * Email Service for User Management
 * Handles email sending for user creation, confirmation, and notifications
 */

import { supabase } from '../lib/supabase';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface UserCreationEmailData {
  email: string;
  name: string;
  password: string;
  role: string;
  confirmationUrl?: string;
}

export interface EmailServiceResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailService {
  private readonly fromEmail = 'noreply@sufiessences.com';
  private readonly fromName = 'Sufi Essences Admin';

  /**
   * Generate user creation email template
   */
  private generateUserCreationTemplate(data: UserCreationEmailData): EmailTemplate {
    const { name, email, password, role, confirmationUrl } = data;
    
    const subject = `Welcome to Sufi Essences - Your Account Has Been Created`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Sufi Essences</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: #fff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Sufi Essences</h1>
            <p>Your account has been created successfully</p>
          </div>
          <div class="content">
            <h2>Hello ${name},</h2>
            <p>Your administrator has created an account for you on Sufi Essences with the role of <strong>${role}</strong>.</p>
            
            <div class="credentials">
              <h3>Your Login Credentials:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Temporary Password:</strong> <code>${password}</code></p>
            </div>
            
            <div class="warning">
              <strong>Important:</strong> Please change your password after your first login for security purposes.
            </div>
            
            ${confirmationUrl ? `
              <p>Please click the button below to confirm your email address and activate your account:</p>
              <a href="${confirmationUrl}" class="button">Confirm Email Address</a>
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p><a href="${confirmationUrl}">${confirmationUrl}</a></p>
            ` : `
              <p>Your account is ready to use. You can log in immediately with the credentials above.</p>
              <a href="${window.location.origin}/login" class="button">Login to Your Account</a>
            `}
            
            <h3>What's Next?</h3>
            <ul>
              <li>Log in to your account using the credentials above</li>
              <li>Complete your profile information</li>
              <li>Change your password for security</li>
              <li>Explore the platform features available to your role</li>
            </ul>
            
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
            
            <p>Best regards,<br>The Sufi Essences Team</p>
          </div>
          <div class="footer">
            <p>This email was sent from Sufi Essences Admin Panel</p>
            <p>If you didn't expect this email, please contact our support team immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Welcome to Sufi Essences

Hello ${name},

Your administrator has created an account for you on Sufi Essences with the role of ${role}.

Your Login Credentials:
Email: ${email}
Temporary Password: ${password}

IMPORTANT: Please change your password after your first login for security purposes.

${confirmationUrl ? `
Please confirm your email address by visiting this link:
${confirmationUrl}
` : `
Your account is ready to use. You can log in immediately at:
${window.location.origin}/login
`}

What's Next:
- Log in to your account using the credentials above
- Complete your profile information
- Change your password for security
- Explore the platform features available to your role

If you have any questions or need assistance, please contact our support team.

Best regards,
The Sufi Essences Team

---
This email was sent from Sufi Essences Admin Panel
If you didn't expect this email, please contact our support team immediately.
    `;

    return { subject, htmlContent, textContent };
  }

  /**
   * Send email using Netlify Functions with SendGrid
   */
  private async sendEmail(
    to: string,
    template: EmailTemplate,
    metadata?: Record<string, any>
  ): Promise<EmailServiceResponse> {
    try {
      // Use Netlify function for email sending
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to,
          from: this.fromEmail,
          fromName: this.fromName,
          subject: template.subject,
          html: template.htmlContent,
          text: template.textContent,
          metadata
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Email sending failed');
      }

      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email service error:', error);

      // Fallback: Log email to console in development
      if (import.meta.env.DEV) {
        console.log('=== EMAIL WOULD BE SENT ===');
        console.log('To:', to);
        console.log('Subject:', template.subject);
        console.log('Content:', template.textContent);
        console.log('========================');
        return { success: true, messageId: 'dev-mode-' + Date.now() };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      };
    }
  }

  /**
   * Send user creation email with credentials
   */
  async sendUserCreationEmail(data: UserCreationEmailData): Promise<EmailServiceResponse> {
    const template = this.generateUserCreationTemplate(data);
    return this.sendEmail(data.email, template, {
      type: 'user_creation',
      role: data.role,
      hasConfirmation: !!data.confirmationUrl
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmationEmail(data: {
    email: string;
    name: string;
    orderId: string;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      image?: string;
    }>;
    subtotal: number;
    gst: number;
    shipping: number;
    total: number;
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    paymentMethod: string;
  }): Promise<EmailServiceResponse> {
    const template = this.generateOrderConfirmationTemplate(data);
    return this.sendEmail(data.email, template, {
      type: 'order_confirmation',
      orderId: data.orderId,
      total: data.total
    });
  }

  /**
   * Send order status update email
   */
  async sendOrderStatusUpdateEmail(data: {
    email: string;
    name: string;
    orderId: string;
    status: string;
    trackingNumber?: string;
  }): Promise<EmailServiceResponse> {
    const template = this.generateOrderStatusTemplate(data);
    return this.sendEmail(data.email, template, {
      type: 'order_status_update',
      orderId: data.orderId,
      status: data.status
    });
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(data: {
    email: string;
    name: string;
  }): Promise<EmailServiceResponse> {
    const template = this.generateWelcomeTemplate(data);
    return this.sendEmail(data.email, template, {
      type: 'welcome',
      userEmail: data.email
    });
  }

  /**
   * Send email confirmation reminder
   */
  async sendConfirmationReminder(
    email: string,
    name: string,
    confirmationUrl: string
  ): Promise<EmailServiceResponse> {
    const template: EmailTemplate = {
      subject: 'Please Confirm Your Email Address - Sufi Essences',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Confirmation Required</h2>
          <p>Hello ${name},</p>
          <p>Please confirm your email address to complete your account setup:</p>
          <a href="${confirmationUrl}" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Confirm Email</a>
          <p>If the button doesn't work, copy and paste this link: ${confirmationUrl}</p>
        </div>
      `,
      textContent: `
Email Confirmation Required

Hello ${name},

Please confirm your email address to complete your account setup by visiting:
${confirmationUrl}

Best regards,
The Sufi Essences Team
      `
    };

    return this.sendEmail(email, template, {
      type: 'confirmation_reminder'
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    name: string,
    newPassword: string
  ): Promise<EmailServiceResponse> {
    const template: EmailTemplate = {
      subject: 'Your Password Has Been Reset - Sufi Essences',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>Hello ${name},</p>
          <p>Your password has been reset by an administrator.</p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p><strong>New Password:</strong> <code>${newPassword}</code></p>
          </div>
          <p><strong>Important:</strong> Please change this password after logging in.</p>
          <a href="${window.location.origin}/login" style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">Login Now</a>
        </div>
      `,
      textContent: `
Password Reset

Hello ${name},

Your password has been reset by an administrator.

New Password: ${newPassword}

IMPORTANT: Please change this password after logging in.

Login at: ${window.location.origin}/login

Best regards,
The Sufi Essences Team
      `
    };

    return this.sendEmail(email, template, {
      type: 'password_reset'
    });
  }

  /**
   * Generate order confirmation email template
   */
  private generateOrderConfirmationTemplate(data: any): EmailTemplate {
    const itemsHtml = data.items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <div style="display: flex; align-items: center;">
            ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 4px;">` : ''}
            <div>
              <strong>${item.name}</strong><br>
              <small>Quantity: ${item.quantity}</small>
            </div>
          </div>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
          ₹${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation - Sufi Essences</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #8B5A3C, #A0522D); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: white; padding: 30px; border: 1px solid #ddd; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
          .order-summary { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .total-row { font-weight: bold; font-size: 18px; color: #8B5A3C; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .btn { background: #8B5A3C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌸 Order Confirmed!</h1>
            <p>Thank you for your purchase from Sufi Essences</p>
          </div>

          <div class="content">
            <p>Dear ${data.name},</p>

            <p>Your order has been confirmed and is being prepared for shipment. Here are your order details:</p>

            <div class="order-summary">
              <h3>Order #${data.orderId}</h3>
              <p><strong>Payment Method:</strong> ${data.paymentMethod}</p>
              <p><strong>Shipping Address:</strong><br>
                ${data.shippingAddress.street}<br>
                ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}<br>
                ${data.shippingAddress.country}
              </p>
            </div>

            <h3>Order Items:</h3>
            <table>
              ${itemsHtml}
              <tr>
                <td style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="padding: 10px; text-align: right;"><strong>₹${data.subtotal.toFixed(2)}</strong></td>
              </tr>
              <tr>
                <td style="padding: 10px; text-align: right;">GST (18%):</td>
                <td style="padding: 10px; text-align: right;">₹${data.gst.toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 10px; text-align: right;">Shipping:</td>
                <td style="padding: 10px; text-align: right;">${data.shipping === 0 ? 'FREE' : '₹' + data.shipping.toFixed(2)}</td>
              </tr>
              <tr class="total-row">
                <td style="padding: 15px; text-align: right; border-top: 2px solid #8B5A3C;">Total:</td>
                <td style="padding: 15px; text-align: right; border-top: 2px solid #8B5A3C;">₹${data.total.toFixed(2)}</td>
              </tr>
            </table>

            <p>We'll send you another email with tracking information once your order ships.</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${window.location.origin}/orders" class="btn">Track Your Order</a>
            </div>
          </div>

          <div class="footer">
            <p>Thank you for choosing Sufi Essences - Premium Kashmiri Perfumes</p>
            <p>If you have any questions, contact us at orders@sufiessences.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `
Order Confirmation - Sufi Essences

Dear ${data.name},

Your order #${data.orderId} has been confirmed!

Order Details:
${data.items.map((item: any) => `- ${item.name} (Qty: ${item.quantity}) - ₹${(item.price * item.quantity).toFixed(2)}`).join('\n')}

Subtotal: ₹${data.subtotal.toFixed(2)}
GST (18%): ₹${data.gst.toFixed(2)}
Shipping: ${data.shipping === 0 ? 'FREE' : '₹' + data.shipping.toFixed(2)}
Total: ₹${data.total.toFixed(2)}

Shipping Address:
${data.shippingAddress.street}
${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}
${data.shippingAddress.country}

We'll send you tracking information once your order ships.

Thank you for choosing Sufi Essences!
    `;

    return {
      subject: `Order Confirmation #${data.orderId} - Sufi Essences`,
      htmlContent,
      textContent
    };
  }
}

export const emailService = new EmailService();
