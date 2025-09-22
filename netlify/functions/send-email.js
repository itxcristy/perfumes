/**
 * Netlify Function to send emails using SendGrid
 * This function handles all email sending for the application
 */

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    // Parse request body
    const { to, from, fromName, subject, html, text, metadata } = JSON.parse(event.body);

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields: to, subject, and content' }),
      };
    }

    // Validate SendGrid API key
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Email service not configured' }),
      };
    }

    // Prepare email message
    const msg = {
      to: to,
      from: {
        email: from || process.env.VITE_SUPPORT_EMAIL || 'noreply@sufiessences.com',
        name: fromName || 'Sufi Essences'
      },
      subject: subject,
      html: html,
      text: text,
      // Add tracking and analytics
      trackingSettings: {
        clickTracking: {
          enable: true,
          enableText: false
        },
        openTracking: {
          enable: true
        }
      },
      // Add custom args for analytics
      customArgs: {
        type: metadata?.type || 'general',
        timestamp: new Date().toISOString(),
        environment: process.env.VITE_APP_ENV || 'production'
      }
    };

    // Send email
    const response = await sgMail.send(msg);

    // Log successful send (for monitoring)
    console.log('Email sent successfully:', {
      to: to,
      subject: subject,
      type: metadata?.type,
      messageId: response[0].headers['x-message-id']
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        messageId: response[0].headers['x-message-id'],
        message: 'Email sent successfully'
      }),
    };
  } catch (error) {
    console.error('Error sending email:', error);

    // Handle SendGrid specific errors
    if (error.response) {
      const { message, code, response } = error;
      console.error('SendGrid error:', {
        message,
        code,
        body: response?.body
      });

      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Email sending failed',
          details: message
        }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Internal server error',
        message: error.message
      }),
    };
  }
};
