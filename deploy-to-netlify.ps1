# Netlify Deployment Script for Windows PowerShell
# This script automates the deployment process to Netlify

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Netlify Deployment Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Netlify CLI is installed
Write-Host "Checking Netlify CLI installation..." -ForegroundColor Yellow
try {
    $netlifyVersion = netlify --version 2>&1
    Write-Host "✓ Netlify CLI is installed: $netlifyVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Netlify CLI is not installed" -ForegroundColor Red
    Write-Host "Installing Netlify CLI globally..." -ForegroundColor Yellow
    npm install -g netlify-cli
    Write-Host "✓ Netlify CLI installed successfully" -ForegroundColor Green
}

Write-Host ""

# Check if user is logged in
Write-Host "Checking Netlify login status..." -ForegroundColor Yellow
$statusOutput = netlify status 2>&1 | Out-String
if ($statusOutput -match "Not logged in") {
    Write-Host "✗ Not logged in to Netlify" -ForegroundColor Red
    Write-Host "Opening browser for authentication..." -ForegroundColor Yellow
    netlify login
    Write-Host "✓ Login successful" -ForegroundColor Green
} else {
    Write-Host "✓ Already logged in to Netlify" -ForegroundColor Green
}

Write-Host ""

# Check if site is linked
Write-Host "Checking if site is linked..." -ForegroundColor Yellow
if (Test-Path ".netlify/state.json") {
    Write-Host "✓ Site is already linked" -ForegroundColor Green
} else {
    Write-Host "✗ Site is not linked" -ForegroundColor Red
    Write-Host "Initializing new Netlify site..." -ForegroundColor Yellow
    netlify init
    Write-Host "✓ Site initialized successfully" -ForegroundColor Green
}

Write-Host ""

# Set environment variables
Write-Host "Setting environment variables..." -ForegroundColor Yellow
Write-Host "Note: You may need to set these manually in Netlify Dashboard if this fails" -ForegroundColor Gray

$envVars = @{
    "VITE_APP_ENV" = "production"
    "VITE_SUPABASE_URL" = "https://gtnpmxlnzpfqbhfzuitj.supabase.co"
    "VITE_SUPABASE_ANON_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8"
    "VITE_DIRECT_LOGIN_ENABLED" = "false"
    "NODE_VERSION" = "18"
}

foreach ($key in $envVars.Keys) {
    try {
        netlify env:set $key $envVars[$key] --silent 2>&1 | Out-Null
        Write-Host "  ✓ Set $key" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠ Could not set $key (may need manual configuration)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Build the project
Write-Host "Building the project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build completed successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Build failed" -ForegroundColor Red
    Write-Host "Please fix build errors and try again" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Deploy to Netlify
Write-Host "Deploying to Netlify..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
netlify deploy --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  ✓ Deployment Successful!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your site is now live!" -ForegroundColor Green
    Write-Host "Check the URL above to visit your deployed site." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Visit your site and verify it works correctly" -ForegroundColor White
    Write-Host "2. Configure a custom domain (optional)" -ForegroundColor White
    Write-Host "3. Set up a database for full functionality (optional)" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "  ✗ Deployment Failed" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the error messages above." -ForegroundColor Red
    Write-Host "You can also try deploying manually:" -ForegroundColor Yellow
    Write-Host "  netlify deploy --prod" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

