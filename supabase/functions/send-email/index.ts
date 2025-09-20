import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRequest {
  to: string;
  from: string;
  fromName: string;
  subject: string;
  html: string;
  text: string;
  metadata?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, from, fromName, subject, html, text, metadata }: EmailRequest = await req.json()

    // Validate required fields
    if (!to || !subject || (!html && !text)) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, and content' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Option 1: Use Resend (recommended)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `${fromName} <${from}>`,
          to: [to],
          subject,
          html,
          text,
          tags: metadata ? [
            { name: 'type', value: metadata.type || 'user-management' },
            { name: 'role', value: metadata.role || 'unknown' }
          ] : undefined
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error('Resend API error:', result)
        throw new Error(`Resend API error: ${result.message || 'Unknown error'}`)
      }

      // Log email sent event
      await supabase
        .from('auth_audit_log')
        .insert({
          event_type: 'email_sent',
          metadata: {
            to,
            subject,
            provider: 'resend',
            message_id: result.id,
            ...metadata
          }
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: result.id,
          provider: 'resend'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Option 2: Use SendGrid
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY')
    if (sendGridApiKey) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sendGridApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: to }],
            subject
          }],
          from: { email: from, name: fromName },
          content: [
            { type: 'text/plain', value: text },
            { type: 'text/html', value: html }
          ].filter(c => c.value),
          custom_args: metadata || {}
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('SendGrid API error:', error)
        throw new Error(`SendGrid API error: ${error}`)
      }

      const messageId = response.headers.get('x-message-id') || `sendgrid-${Date.now()}`

      // Log email sent event
      await supabase
        .from('auth_audit_log')
        .insert({
          event_type: 'email_sent',
          metadata: {
            to,
            subject,
            provider: 'sendgrid',
            message_id: messageId,
            ...metadata
          }
        })

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId,
          provider: 'sendgrid'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Option 3: Use SMTP (fallback)
    const smtpHost = Deno.env.get('SMTP_HOST')
    const smtpUser = Deno.env.get('SMTP_USER')
    const smtpPass = Deno.env.get('SMTP_PASS')

    if (smtpHost && smtpUser && smtpPass) {
      // For SMTP, you would need to implement SMTP client
      // This is a placeholder for SMTP implementation
      console.log('SMTP sending not implemented in this example')
      
      // Log email attempt
      await supabase
        .from('auth_audit_log')
        .insert({
          event_type: 'email_attempted',
          metadata: {
            to,
            subject,
            provider: 'smtp',
            status: 'not_implemented',
            ...metadata
          }
        })

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'SMTP sending not implemented',
          provider: 'smtp'
        }),
        { 
          status: 501, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // No email provider configured - development mode
    console.log('=== EMAIL WOULD BE SENT (Development Mode) ===')
    console.log('To:', to)
    console.log('From:', `${fromName} <${from}>`)
    console.log('Subject:', subject)
    console.log('HTML Content:', html)
    console.log('Text Content:', text)
    console.log('Metadata:', metadata)
    console.log('===============================================')

    // Log email in development mode
    await supabase
      .from('auth_audit_log')
      .insert({
        event_type: 'email_dev_mode',
        metadata: {
          to,
          subject,
          provider: 'development',
          ...metadata
        }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: `dev-${Date.now()}`,
        provider: 'development',
        message: 'Email logged in development mode'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Email function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
