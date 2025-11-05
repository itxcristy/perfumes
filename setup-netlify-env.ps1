# Netlify Environment Variables Setup Script (PowerShell)
# This script sets all required environment variables for Netlify deployment

Write-Host "🚀 Setting up Netlify Environment Variables..." -ForegroundColor Cyan
Write-Host ""

# Check if Netlify CLI is installed
$netlifyInstalled = Get-Command netlify -ErrorAction SilentlyContinue
if (-not $netlifyInstalled) {
    Write-Host "❌ Netlify CLI is not installed!" -ForegroundColor Red
    Write-Host "Install it with: npm install -g netlify-cli" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Netlify CLI found" -ForegroundColor Green
Write-Host ""

# Login to Netlify
Write-Host "📝 Please login to Netlify..." -ForegroundColor Cyan
netlify login

# Link to site
Write-Host ""
Write-Host "🔗 Linking to your Netlify site..." -ForegroundColor Cyan
netlify link

# Set environment variables
Write-Host ""
Write-Host "⚙️  Setting environment variables..." -ForegroundColor Cyan

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

Write-Host ""
Write-Host "✅ Core environment variables set successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Optional: Set these manually if needed:" -ForegroundColor Yellow
Write-Host "   - RAZORPAY_KEY_ID"
Write-Host "   - RAZORPAY_KEY_SECRET"
Write-Host "   - VITE_RAZORPAY_KEY_ID"
Write-Host "   - SENDGRID_API_KEY"
Write-Host "   - EMAIL_FROM"
Write-Host ""
Write-Host "🎯 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Deploy your site: netlify deploy --prod"
Write-Host "   2. Test health endpoint: https://your-site.netlify.app/.netlify/functions/api/health"
Write-Host ""

