# Netlify Deployment Guide

## Quick Start

### Option 1: Deploy via Netlify CLI (Recommended)

1. **Install Netlify CLI** (if not already installed):
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Initialize Netlify site** (first time only):
   ```bash
   netlify init
   ```
   - Choose "Create & configure a new site"
   - Select your team
   - Enter a site name (or leave blank for auto-generated)
   - Build command: `npm run build`
   - Publish directory: `dist`

4. **Set Environment Variables**:
   ```bash
   # Required variables
   netlify env:set VITE_APP_ENV production
   netlify env:set VITE_SUPABASE_URL "https://gtnpmxlnzpfqbhfzuitj.supabase.co"
   netlify env:set VITE_SUPABASE_ANON_KEY "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8"
   netlify env:set VITE_DIRECT_LOGIN_ENABLED false
   netlify env:set NODE_VERSION 18
   ```

5. **Deploy**:
   ```bash
   # Deploy to production
   netlify deploy --prod
   ```

### Option 2: Deploy via Netlify Dashboard

1. **Push your code to GitHub/GitLab/Bitbucket**

2. **Go to Netlify Dashboard** (https://app.netlify.com)

3. **Click "Add new site" > "Import an existing project"**

4. **Connect your Git repository**

5. **Configure build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: 18

6. **Set Environment Variables** (Site Settings > Environment Variables):
   ```
   VITE_APP_ENV=production
   VITE_SUPABASE_URL=https://gtnpmxlnzpfqbhfzuitj.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0bnBteGxuenBmcWJoZnp1aXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MjExNTQsImV4cCI6MjA3MzM5NzE1NH0.cREEJprRj9dnCk5zc9vqsyiSAdFt3ih7aTUUnpkNjB8
   VITE_DIRECT_LOGIN_ENABLED=false
   NODE_VERSION=18
   ```

7. **Click "Deploy site"**

## Current Configuration

### What's Deployed
- **Frontend**: React + TypeScript + Vite application
- **Styling**: Tailwind CSS
- **Backend**: Netlify Functions (currently with mock endpoints)
- **Database**: Supabase (configured in environment variables)

### What Works Out of the Box
✅ Frontend application
✅ Static pages and routing
✅ UI components and styling
✅ Service Worker (PWA features)
✅ Basic API health check

### What Needs Database Configuration
⚠️ User authentication
⚠️ Product management
⚠️ Shopping cart
⚠️ Orders
⚠️ Admin dashboard

## Post-Deployment Steps

### 1. Verify Deployment
After deployment, visit your site and check:
- Homepage loads correctly
- Navigation works
- Images display properly
- No console errors

### 2. Test API Endpoints
Visit: `https://your-site.netlify.app/api/health`
Should return: `{"status":"ok","timestamp":"...","environment":"production"}`

### 3. Configure Custom Domain (Optional)
1. Go to Site Settings > Domain management
2. Add your custom domain
3. Configure DNS settings as instructed

### 4. Enable HTTPS
Netlify automatically provisions SSL certificates. Ensure:
- HTTPS is enabled
- HTTP redirects to HTTPS

## Troubleshooting

### Build Fails
- Check build logs in Netlify dashboard
- Verify all dependencies are in `package.json`
- Ensure Node version is set to 18

### Environment Variables Not Working
- Verify variables are set in Netlify dashboard
- Variable names must start with `VITE_` to be accessible in frontend
- Redeploy after adding/changing variables

### API Endpoints Return 404
- Check that `netlify.toml` is in the repository root
- Verify Functions are enabled in Netlify dashboard
- Check Functions logs for errors

### Database Connection Issues
- Verify DATABASE_URL is set correctly
- Check database allows connections from Netlify IPs
- Ensure SSL is configured if required

## Advanced Configuration

### Adding a PostgreSQL Database

If you want full backend functionality, you can add a PostgreSQL database:

1. **Choose a provider**:
   - [Neon](https://neon.tech) - Serverless PostgreSQL (Recommended)
   - [Supabase](https://supabase.com) - Already configured
   - [Railway](https://railway.app) - Simple deployment
   - [Render](https://render.com) - Free tier available

2. **Get connection string** from your provider

3. **Set environment variable** in Netlify:
   ```bash
   netlify env:set DATABASE_URL "postgresql://user:password@host:port/database?sslmode=require"
   ```

4. **Redeploy** your site

### Monitoring and Analytics

Add monitoring tools:
```bash
netlify env:set VITE_SENTRY_DSN "your_sentry_dsn"
netlify env:set VITE_GOOGLE_ANALYTICS_ID "your_ga_id"
```

## Support

For issues or questions:
- Check Netlify documentation: https://docs.netlify.com
- Review build logs in Netlify dashboard
- Check browser console for frontend errors
- Review Function logs for backend errors

## Next Steps

1. ✅ Deploy to Netlify
2. ⬜ Configure custom domain
3. ⬜ Set up database (if needed)
4. ⬜ Configure payment gateway
5. ⬜ Add monitoring and analytics
6. ⬜ Set up email notifications

