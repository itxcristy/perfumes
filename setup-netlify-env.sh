#!/bin/bash

# Netlify Environment Variables Setup Script
# This script sets all required environment variables for Netlify deployment

echo "🚀 Setting up Netlify Environment Variables..."
echo ""

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI is not installed!"
    echo "Install it with: npm install -g netlify-cli"
    exit 1
fi

echo "✓ Netlify CLI found"
echo ""

# Login to Netlify
echo "📝 Please login to Netlify..."
netlify login

# Link to site
echo ""
echo "🔗 Linking to your Netlify site..."
netlify link

# Set environment variables
echo ""
echo "⚙️  Setting environment variables..."

# Database Configuration
netlify env:set DATABASE_URL "postgresql://neondb_owner:npg_sNwDEqvWy16Y@ep-mute-rice-aeqwf2xh-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
netlify env:set DB_POOL_SIZE "20"

# Authentication & Security
netlify env:set JWT_SECRET "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
netlify env:set JWT_EXPIRY "7d"

# Application Configuration
netlify env:set NODE_ENV "production"
netlify env:set VITE_APP_ENV "production"
netlify env:set VITE_APP_VERSION "1.0.0"
netlify env:set FRONTEND_URL "https://sufi-e-commerce.netlify.app"

echo ""
echo "✅ Core environment variables set successfully!"
echo ""
echo "📋 Optional: Set these manually if needed:"
echo "   - RAZORPAY_KEY_ID"
echo "   - RAZORPAY_KEY_SECRET"
echo "   - VITE_RAZORPAY_KEY_ID"
echo "   - SENDGRID_API_KEY"
echo "   - EMAIL_FROM"
echo ""
echo "🎯 Next steps:"
echo "   1. Deploy your site: netlify deploy --prod"
echo "   2. Test health endpoint: https://your-site.netlify.app/.netlify/functions/api/health"
echo ""

