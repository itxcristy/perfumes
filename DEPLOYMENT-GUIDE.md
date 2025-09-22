# 🚀 Sufi Essences - Production Deployment Guide

This guide will help you deploy your Kashmiri perfume e-commerce website to production on Netlify.

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Update `.env.production` with actual credentials
- [ ] Set up production Supabase project
- [ ] Configure Razorpay payment gateway
- [ ] Set up email service (SendGrid/Mailgun)
- [ ] Configure domain and SSL certificate

### 2. Database Setup
- [ ] Create production Supabase project
- [ ] Run database migrations
- [ ] Set up Row Level Security (RLS) policies
- [ ] Create admin user account
- [ ] Add sample products and categories

### 3. Payment Gateway Setup
- [ ] Create Razorpay account
- [ ] Get API keys (Key ID and Secret)
- [ ] Configure webhooks
- [ ] Test payment flow

### 4. Email Service Setup
- [ ] Choose email provider (SendGrid recommended)
- [ ] Get API keys
- [ ] Set up email templates
- [ ] Configure SMTP settings

## 🔧 Step-by-Step Deployment

### Step 1: Supabase Production Setup

1. **Create New Supabase Project**
   ```bash
   # Go to https://supabase.com/dashboard
   # Click "New Project"
   # Choose organization and region (Asia Pacific for Indian users)
   # Set project name: "sufi-essences-prod"
   ```

2. **Get Project Credentials**
   ```bash
   # From Supabase Dashboard > Settings > API
   # Copy Project URL and anon public key
   ```

3. **Run Database Migrations**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login to Supabase
   supabase login

   # Link to your project
   supabase link --project-ref YOUR_PROJECT_REF

   # Push database schema
   supabase db push
   ```

### Step 2: Environment Configuration

1. **Update Production Environment**
   ```bash
   # Edit .env.production with your actual values:
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_RAZORPAY_KEY_ID=rzp_live_your-key-id
   VITE_SENDGRID_API_KEY=SG.your-sendgrid-key
   ```

2. **Configure Business Details**
   ```bash
   VITE_BUSINESS_NAME=Sufi Essences
   VITE_BUSINESS_ADDRESS=Srinagar, Kashmir, India
   VITE_BUSINESS_PHONE=+91-XXXXXXXXXX
   VITE_BUSINESS_EMAIL=info@sufiessences.com
   VITE_BUSINESS_GST_NUMBER=your-gst-number
   ```

### Step 3: Razorpay Payment Setup

1. **Create Razorpay Account**
   - Go to https://razorpay.com
   - Sign up for business account
   - Complete KYC verification
   - Get live API keys

2. **Configure Payment Settings**
   ```javascript
   // In your environment file
   VITE_RAZORPAY_KEY_ID=rzp_live_your-key-id
   VITE_RAZORPAY_ENABLED=true
   VITE_COD_ENABLED=true
   VITE_UPI_ENABLED=true
   ```

3. **Set Up Webhooks**
   ```bash
   # Webhook URL: https://your-domain.com/api/webhooks/razorpay
   # Events: payment.captured, payment.failed, order.paid
   ```

### Step 4: Email Service Setup

1. **SendGrid Configuration**
   ```bash
   # Sign up at https://sendgrid.com
   # Create API key with full access
   # Verify sender identity
   # Set up email templates
   ```

2. **Email Templates**
   - Order confirmation
   - Shipping notification
   - User registration
   - Password reset
   - Admin notifications

### Step 5: Netlify Deployment

1. **Connect Repository**
   ```bash
   # Go to https://netlify.com
   # Click "New site from Git"
   # Connect your GitHub repository
   # Choose main/master branch
   ```

2. **Configure Build Settings**
   ```bash
   # Build command: npm ci && npm run build
   # Publish directory: dist
   # Node version: 18
   ```

3. **Set Environment Variables**
   ```bash
   # In Netlify Dashboard > Site Settings > Environment Variables
   # Add all variables from .env.production
   ```

4. **Configure Domain**
   ```bash
   # Add custom domain: sufiessences.com
   # Configure DNS settings
   # Enable HTTPS/SSL
   ```

### Step 6: Post-Deployment Testing

1. **Functionality Testing**
   - [ ] User registration and login
   - [ ] Product browsing and search
   - [ ] Add to cart and checkout
   - [ ] Payment processing
   - [ ] Order confirmation emails
   - [ ] Admin dashboard access

2. **Performance Testing**
   - [ ] Page load speeds
   - [ ] Mobile responsiveness
   - [ ] Core Web Vitals
   - [ ] SEO optimization

3. **Security Testing**
   - [ ] SSL certificate
   - [ ] Security headers
   - [ ] Input validation
   - [ ] Authentication flows

## 🔐 Security Configuration

### SSL and HTTPS
- Netlify provides automatic SSL
- Force HTTPS redirects
- HSTS headers configured

### Security Headers
- CSP (Content Security Policy)
- XSS Protection
- Frame Options
- CORS configuration

### Database Security
- Row Level Security (RLS) enabled
- API key restrictions
- Input sanitization
- SQL injection protection

## 📊 Monitoring and Analytics

### Google Analytics
```javascript
// Add to index.html
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### Error Monitoring
```javascript
// Sentry configuration
VITE_SENTRY_DSN=your-sentry-dsn
```

### Performance Monitoring
- Core Web Vitals tracking
- Real User Monitoring (RUM)
- Lighthouse CI integration

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version (18+)
   - Verify all dependencies installed
   - Check environment variables

2. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Validate API permissions

3. **Payment Issues**
   - Test Razorpay keys
   - Verify webhook configuration
   - Check CORS settings

4. **Email Issues**
   - Validate SendGrid API key
   - Check sender verification
   - Test email templates

## 📞 Support

For deployment issues:
- Check Netlify deploy logs
- Review browser console errors
- Test API endpoints
- Validate environment variables

## 🎯 Go Live Checklist

- [ ] All tests passing
- [ ] Performance optimized
- [ ] Security configured
- [ ] Analytics tracking
- [ ] Error monitoring
- [ ] Backup strategy
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] Payment gateway tested
- [ ] Email notifications working

🎉 **Congratulations! Your Sufi Essences e-commerce site is now live!**
