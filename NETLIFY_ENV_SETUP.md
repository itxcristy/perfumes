# 🚀 Netlify Environment Variables Setup

## ⚠️ CRITICAL: Set These in Netlify Dashboard

Go to: **Netlify Dashboard → Your Site → Site Settings → Environment Variables**

---

## 📋 Required Environment Variables

### 1. Database Configuration (CRITICAL)
```
DATABASE_URL=postgresql://neondb_owner:npg_sNwDEqvWy16Y@ep-mute-rice-aeqwf2xh-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
DB_POOL_SIZE=20
```

### 2. Authentication & Security (CRITICAL)
```
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
JWT_EXPIRY=7d
```

### 3. Application Configuration
```
NODE_ENV=production
VITE_APP_ENV=production
VITE_APP_VERSION=1.0.0
FRONTEND_URL=https://sufi-e-commerce.netlify.app
```

### 4. Payment Gateway (Razorpay) - OPTIONAL
```
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret_here
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id_here
```

### 5. Email Service (SendGrid) - OPTIONAL
```
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
EMAIL_FROM=orders@yourdomain.com
EMAIL_FROM_NAME=Sufi Essences
EMAIL_SUPPORT=support@yourdomain.com
```

---

## 🔧 How to Set Environment Variables in Netlify

### Method 1: Via Netlify Dashboard (Recommended)
1. Go to https://app.netlify.com
2. Select your site: **sufi-e-commerce** or **sufi-essences**
3. Click **Site Settings**
4. Click **Environment Variables** in the left sidebar
5. Click **Add a variable**
6. Enter **Key** and **Value**
7. Select **All scopes** (or specific deploy contexts)
8. Click **Create variable**
9. Repeat for all variables above

### Method 2: Via Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to your site
netlify link

# Set environment variables
netlify env:set DATABASE_URL "postgresql://neondb_owner:npg_sNwDEqvWy16Y@ep-mute-rice-aeqwf2xh-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
netlify env:set JWT_SECRET "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2"
netlify env:set NODE_ENV "production"
netlify env:set VITE_APP_ENV "production"
netlify env:set DB_POOL_SIZE "20"
netlify env:set JWT_EXPIRY "7d"
netlify env:set FRONTEND_URL "https://sufi-e-commerce.netlify.app"
```

---

## 🔍 Verify Environment Variables

After setting the variables:

1. Go to **Site Settings → Environment Variables**
2. Verify all variables are listed
3. Trigger a new deploy: **Deploys → Trigger deploy → Deploy site**
4. Check deploy logs for any errors

---

## 🧪 Test Database Connection

After deployment, test the database connection:

```bash
# Visit your health check endpoint
https://sufi-e-commerce.netlify.app/.netlify/functions/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "environment": "production",
  "database": "connected"
}
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: 502 Bad Gateway
**Cause:** Environment variables not set or database connection failed
**Solution:** 
- Verify DATABASE_URL is set correctly in Netlify
- Check Neon DB is accessible
- Review function logs in Netlify

### Issue 2: CSP Errors (localhost blocked)
**Cause:** Old CSP policy blocking localhost
**Solution:** Already fixed in netlify.toml - redeploy

### Issue 3: Database connection timeout
**Cause:** Neon DB connection string incorrect
**Solution:** 
- Verify the connection string format
- Ensure SSL mode is set to 'require'
- Check Neon DB is not paused (free tier auto-pauses)

---

## 🎯 Next Steps After Setting Variables

1. ✅ Set all environment variables in Netlify Dashboard
2. ✅ Trigger a new deployment
3. ✅ Test the health endpoint
4. ✅ Test login/signup functionality
5. ✅ Verify products are loading from database
6. ✅ Test admin dashboard access

---

## 📞 Support

If you encounter issues:
1. Check Netlify function logs: **Functions → api → Logs**
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure Neon DB is active (not paused)

