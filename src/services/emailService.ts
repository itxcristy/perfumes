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
   * Send email using Supabase Edge Functions or external service
   */
  private async sendEmail(
    to: string,
    template: EmailTemplate,
    metadata?: Record<string, any>
  ): Promise<EmailServiceResponse> {
    try {
      // Option 1: Use Supabase Edge Function for email sending
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to,
          from: this.fromEmail,
          fromName: this.fromName,
          subject: template.subject,
          html: template.htmlContent,
          text: template.textContent,
          metadata
        }
      });

      if (error) {
        console.error('Email sending error:', error);
        return { success: false, error: error.message };
      }

      return { success: true, messageId: data?.messageId };
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
}

export const emailService = new EmailService();
