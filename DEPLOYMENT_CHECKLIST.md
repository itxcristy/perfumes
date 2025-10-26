# Netlify + Neon DB Deployment Checklist

## Pre-Deployment Setup

### Step 1: Create Neon DB Account ✅
- [ ] Go to https://neon.tech
- [ ] Sign up (free tier available)
- [ ] Create new project named "aligarh-attars"
- [ ] Copy PostgreSQL connection string
- [ ] Save connection string securely

**Connection String Format**:
```
postgresql://neondb_owner:password@ep-cool-lake-12345.us-east-1.neon.tech/neondb?sslmode=require
```

---

### Step 2: Update Local Environment ✅
- [ ] Update `.env` file with Neon connection string:
  ```
  DATABASE_URL=postgresql://...
  ```
- [ ] Test local connection:
  ```bash
  npm run db:auto-init
  ```
- [ ] Verify database is initialized on Neon

---

### Step 3: Prepare Project Files ✅
- [ ] ✅ Updated `server/db/connection.ts` to support Neon
- [ ] ✅ Created `netlify/functions/api.ts` (Netlify Functions handler)
- [ ] ✅ Created `src/config/api.ts` (Frontend API config)
- [ ] ✅ Updated `netlify.toml` with functions config
- [ ] ✅ Installed `serverless-http` package

---

### Step 4: Create Netlify Account
- [ ] Go to https://netlify.com
- [ ] Sign up (free tier available)
- [ ] Connect GitHub account (recommended)

---

### Step 5: Deploy to Netlify

#### Option A: Deploy via GitHub (Recommended)
1. [ ] Push code to GitHub
2. [ ] Go to Netlify dashboard
3. [ ] Click "New site from Git"
4. [ ] Select GitHub repository
5. [ ] Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
6. [ ] Click "Deploy site"

#### Option B: Deploy via Netlify CLI
1. [ ] Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. [ ] Login to Netlify:
   ```bash
   netlify login
   ```

3. [ ] Link project:
   ```bash
   netlify link
   ```

4. [ ] Set environment variables:
   ```bash
   netlify env:set DATABASE_URL "postgresql://..."
   netlify env:set JWT_SECRET "your-secret-key"
   netlify env:set NODE_ENV "production"
   ```

5. [ ] Deploy:
   ```bash
   netlify deploy --prod
   ```

---

### Step 6: Configure Environment Variables in Netlify

Go to **Site Settings → Environment** and add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | Generate a strong secret key |
| `NODE_ENV` | `production` |
| `RAZORPAY_KEY_SECRET` | Your Razorpay secret |
| `VITE_RAZORPAY_KEY_ID` | Your Razorpay key ID |

---

### Step 7: Initialize Database on Neon

After deployment, initialize the database:

```bash
# Option 1: Via Netlify Functions (after deployment)
curl https://your-site.netlify.app/api/health

# Option 2: Via local script with Neon connection
DATABASE_URL="postgresql://..." npm run db:auto-init
```

---

### Step 8: Test Deployment

- [ ] Visit your Netlify site: `https://your-site.netlify.app`
- [ ] Test health endpoint: `https://your-site.netlify.app/api/health`
- [ ] Test API endpoints:
  ```bash
  curl https://your-site.netlify.app/api/categories
  curl https://your-site.netlify.app/api/products
  ```
- [ ] Test login functionality
- [ ] Test product browsing
- [ ] Test cart functionality
- [ ] Test checkout (if payment gateway configured)

---

### Step 9: Monitor and Debug

#### Check Netlify Logs
```bash
netlify logs
```

#### Check Function Logs
1. Go to Netlify dashboard
2. Click "Functions"
3. Click "api" function
4. View logs and errors

#### Check Neon Database
1. Go to Neon dashboard
2. Check connection status
3. Monitor query performance
4. Check database size

---

## Troubleshooting

### Issue: "DATABASE_URL not found"
**Solution**: 
1. Go to Netlify Site Settings → Environment
2. Add `DATABASE_URL` variable
3. Redeploy site

### Issue: "Function timeout"
**Solution**:
1. Update `netlify.toml`:
   ```toml
   [functions]
     timeout = 30
   ```
2. Redeploy

### Issue: "CORS errors"
**Solution**: Already configured in `netlify/functions/api.ts` to allow:
- `localhost:5173` (development)
- `*.netlify.app` (production)

### Issue: "SSL certificate error"
**Solution**: Already handled in `server/db/connection.ts`:
```typescript
ssl: { rejectUnauthorized: false }
```

### Issue: "Database connection failed"
**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check Neon dashboard for connection status
3. Ensure IP whitelist allows Netlify Functions

---

## Post-Deployment

### Update DNS (Optional)
- [ ] Add custom domain in Netlify
- [ ] Update DNS records
- [ ] Enable HTTPS (automatic)

### Set Up Monitoring
- [ ] Enable Netlify Analytics
- [ ] Set up error tracking (Sentry)
- [ ] Set up session replay (LogRocket)

### Backup Database
- [ ] Set up automated backups in Neon
- [ ] Test restore procedure

### Performance Optimization
- [ ] Enable Netlify Edge Functions for caching
- [ ] Optimize images
- [ ] Enable gzip compression

---

## Rollback Plan

If deployment fails:

1. [ ] Check Netlify deployment logs
2. [ ] Revert to previous deployment:
   - Go to Netlify dashboard
   - Click "Deploys"
   - Select previous successful deploy
   - Click "Publish deploy"
3. [ ] Fix issues locally
4. [ ] Redeploy

---

## Cost Estimate

| Service | Free Tier | Cost |
|---------|-----------|------|
| Netlify | 300 min/month functions | $0 |
| Neon DB | 5GB storage, 3 projects | $0 |
| Razorpay | 2% transaction fee | Variable |
| **Total** | | **$0-50/month** |

---

## Success Indicators

✅ Site is live at `https://your-site.netlify.app`
✅ API endpoints respond correctly
✅ Database queries work
✅ Authentication works
✅ Products display correctly
✅ Cart functionality works
✅ Checkout process works
✅ No console errors

---

## Support Resources

- **Netlify Docs**: https://docs.netlify.com
- **Neon Docs**: https://neon.tech/docs
- **Serverless HTTP**: https://github.com/dougmoscrop/serverless-http
- **Express.js**: https://expressjs.com

---

**Status**: Ready to deploy! 🚀

**Next Step**: Follow the deployment steps above to get your site live!

